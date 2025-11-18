import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: { examId: string; attemptId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId, attemptId } = params;

    // Get the attempt
    const attempt = await prisma.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId: session.user.id,
        examId: examId,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    // Get the exam
    const exam = await prisma.generatedExam.findUnique({
      where: { id: examId },
      select: {
        examName: true,
        examCode: true,
        questions: true,
      },
    });

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        examName: exam?.examName,
        examCode: exam?.examCode,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        timeTaken: attempt.timeTaken,
        totalQuestions: attempt.totalQuestions,
        answered: attempt.answered,
        correct: attempt.correct,
        incorrect: attempt.incorrect,
        unattempted: attempt.unattempted,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        answers: attempt.answers,
        topicBreakdown: attempt.topicBreakdown,
        sectionBreakdown: attempt.sectionBreakdown,
        analysis: attempt.analysis,
      },
    });
  } catch (error) {
    console.error("Error fetching exam results:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam results" },
      { status: 500 }
    );
  }
}

