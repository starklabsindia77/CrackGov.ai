import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { callAI } from "@/lib/ai-orchestrator";
import { z } from "zod";

const submitExamSchema = z.object({
  sessionId: z.string().min(1),
  answers: z.record(z.string()),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const examId = params.examId;
    const body = await request.json();
    const { sessionId, answers } = submitExamSchema.parse(body);

    // Get exam session
    const examSession = await prisma.examSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
        examId: examId,
      },
    });

    if (!examSession) {
      return NextResponse.json(
        { error: "Exam session not found" },
        { status: 404 }
      );
    }

    if (examSession.status !== "in_progress") {
      return NextResponse.json(
        { error: "Exam session is not active" },
        { status: 400 }
      );
    }

    // Get the exam
    const exam = await prisma.generatedExam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    const questions = exam.questions as any[];
    const markingScheme = (await prisma.examTemplate.findUnique({
      where: { id: exam.templateId },
      select: { markingScheme: true },
    }))?.markingScheme as any;

    // Calculate results
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let score = 0;
    const detailedAnswers: any[] = [];
    const topicBreakdown: Record<string, { correct: number; total: number }> = {};
    const sectionBreakdown: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q: any) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctOption;
      const isUnattempted = !userAnswer;

      if (isUnattempted) {
        unattempted++;
      } else if (isCorrect) {
        correct++;
        score += markingScheme?.positive || 2;
      } else {
        incorrect++;
        if (markingScheme?.negative && !markingScheme?.noNegative) {
          score -= markingScheme.negative;
        }
      }

      detailedAnswers.push({
        questionId: q.id,
        question: q.question,
        userAnswer: userAnswer || null,
        correctAnswer: q.correctOption,
        isCorrect,
        explanation: q.explanation,
        topic: q.topic,
        section: q.section,
      });

      // Topic breakdown
      if (q.topic) {
        if (!topicBreakdown[q.topic]) {
          topicBreakdown[q.topic] = { correct: 0, total: 0 };
        }
        topicBreakdown[q.topic].total++;
        if (isCorrect) {
          topicBreakdown[q.topic].correct++;
        }
      }

      // Section breakdown
      if (q.section) {
        if (!sectionBreakdown[q.section]) {
          sectionBreakdown[q.section] = { correct: 0, total: 0 };
        }
        sectionBreakdown[q.section].total++;
        if (isCorrect) {
          sectionBreakdown[q.section].correct++;
        }
      }
    });

    const maxScore = questions.length * (markingScheme?.positive || 2);
    const percentage = (score / maxScore) * 100;
    const timeTaken = Math.floor(
      (Date.now() - new Date(examSession.startedAt).getTime()) / 1000
    );

    // Generate AI analysis
    const analysisPrompt = `Analyze the following exam performance:

Exam: ${exam.examName}
Total Questions: ${questions.length}
Correct: ${correct}
Incorrect: ${incorrect}
Unattempted: ${unattempted}
Score: ${score}/${maxScore} (${percentage.toFixed(2)}%)

Topic Performance:
${Object.entries(topicBreakdown)
  .map(
    ([topic, stats]) =>
      `- ${topic}: ${stats.correct}/${stats.total} (${((stats.correct / stats.total) * 100).toFixed(1)}%)`
  )
  .join("\n")}

Section Performance:
${Object.entries(sectionBreakdown)
  .map(
    ([section, stats]) =>
      `- ${section}: ${stats.correct}/${stats.total} (${((stats.correct / stats.total) * 100).toFixed(1)}%)`
  )
  .join("\n")}

Provide:
1. Overall performance assessment
2. Strengths (topics/sections performed well)
3. Weak areas (topics/sections need improvement)
4. Actionable recommendations for improvement
5. Study focus areas

Keep it concise and actionable.`;

    let analysis = null;
    try {
      const aiResult = await callAI({
        featureCode: "EXAM_GENERATOR",
        prompt: analysisPrompt,
        temperature: 0.7,
        maxTokens: 1500,
      });

      if (aiResult.success && aiResult.content) {
        analysis = { text: aiResult.content };
      }
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      // Continue without analysis
    }

    // Create exam attempt
    const attempt = await prisma.examAttempt.create({
      data: {
        userId: session.user.id,
        examId: exam.id,
        startedAt: examSession.startedAt,
        completedAt: new Date(),
        timeTaken: timeTaken,
        totalQuestions: questions.length,
        answered: questions.length - unattempted,
        correct: correct,
        incorrect: incorrect,
        unattempted: unattempted,
        score: score,
        maxScore: maxScore,
        percentage: percentage,
        answers: detailedAnswers,
        topicBreakdown: topicBreakdown,
        sectionBreakdown: sectionBreakdown,
        analysis: analysis,
      },
    });

    // Update session status
    await prisma.examSession.update({
      where: { id: sessionId },
      data: { status: "completed" },
    });

    // Update exam status
    await prisma.generatedExam.update({
      where: { id: examId },
      data: { status: "completed" },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      results: {
        totalQuestions: attempt.totalQuestions,
        answered: attempt.answered,
        correct: attempt.correct,
        incorrect: attempt.incorrect,
        unattempted: attempt.unattempted,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        timeTaken: attempt.timeTaken,
        topicBreakdown: attempt.topicBreakdown,
        sectionBreakdown: attempt.sectionBreakdown,
        analysis: attempt.analysis,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error submitting exam:", error);
    return NextResponse.json(
      { error: "Failed to submit exam" },
      { status: 500 }
    );
  }
}

