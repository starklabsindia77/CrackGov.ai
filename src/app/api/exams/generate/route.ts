import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { callAI } from "@/lib/ai-orchestrator";
import { aiRateLimiter } from "@/lib/rate-limit-redis";
import { logApiError } from "@/lib/logger";
import { z } from "zod";

const generateExamSchema = z.object({
  templateId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await aiRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { templateId } = generateExamSchema.parse(body);

    // Get exam template
    const template = await prisma.examTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template || !template.isActive) {
      return NextResponse.json(
        { error: "Exam template not found or inactive" },
        { status: 404 }
      );
    }

    const sections = template.sections as any;
    const markingScheme = template.markingScheme as any;
    const difficultyDistribution = template.difficultyDistribution as any;
    const syllabus = template.syllabus as any;

    // Build comprehensive prompt for exam generation
    const prompt = `Generate a complete ${template.examName} exam with exactly ${template.totalQuestions} questions following these specifications:

EXAM DETAILS:
- Exam Name: ${template.examName}
- Total Questions: ${template.totalQuestions}
- Time Limit: ${template.timeLimit} minutes
- Marking Scheme: ${JSON.stringify(markingScheme)}

SECTIONS:
${JSON.stringify(sections, null, 2)}

DIFFICULTY DISTRIBUTION:
- Easy: ${difficultyDistribution.easy || 30}%
- Medium: ${difficultyDistribution.medium || 50}%
- Hard: ${difficultyDistribution.hard || 20}%

SYLLABUS/TOPICS:
${syllabus ? JSON.stringify(syllabus, null, 2) : "Cover all standard topics for this exam"}

GUIDELINES:
${template.guidelines ? JSON.stringify(template.guidelines, null, 2) : "Follow standard government exam patterns"}

INSTRUCTIONS:
${template.instructions || "Generate questions that are clear, unambiguous, and aligned with the exam pattern"}

Return the response as a valid JSON object with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "section": "Section Name",
      "subject": "Subject Name",
      "topic": "Topic Name",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOption": "Option A",
      "explanation": "Brief explanation of why this is correct",
      "difficulty": "easy" | "medium" | "hard",
      "marks": 2
    }
  ]
}

IMPORTANT:
- Generate exactly ${template.totalQuestions} questions
- Distribute questions according to sections
- Follow difficulty distribution percentages
- Ensure questions are relevant to ${template.examName} syllabus
- Include proper explanations for each question
- Make questions exam-pattern appropriate`;

    const result = await callAI({
      featureCode: "EXAM_GENERATOR",
      messages: [
        {
          role: "system",
          content:
            "You are an expert government exam question generator. Generate complete, realistic exams following exact specifications. Return valid JSON with a 'questions' array containing all required fields.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      maxTokens: 8000,
      responseFormat: { type: "json_object" },
    });

    if (!result.success || !result.content) {
      throw new Error(result.error || "Failed to generate exam");
    }

    // Parse the response
    const parsed = JSON.parse(result.content);
    const questions = parsed.questions || [];

    if (!Array.isArray(questions) || questions.length !== template.totalQuestions) {
      throw new Error(
        `Invalid question format or count. Expected ${template.totalQuestions}, got ${questions.length}`
      );
    }

    // Create generated exam in database
    const generatedExam = await prisma.generatedExam.create({
      data: {
        userId: session.user.id,
        templateId: template.id,
        examName: template.examName,
        examCode: template.examCode,
        totalQuestions: template.totalQuestions,
        timeLimit: template.timeLimit,
        questions: questions,
        metadata: {
          provider: result.provider,
          keyId: result.keyId,
          generatedAt: new Date().toISOString(),
        },
        status: "generated",
      },
    });

    return NextResponse.json({
      success: true,
      examId: generatedExam.id,
      exam: {
        id: generatedExam.id,
        examName: generatedExam.examName,
        examCode: generatedExam.examCode,
        totalQuestions: generatedExam.totalQuestions,
        timeLimit: generatedExam.timeLimit,
        status: generatedExam.status,
        createdAt: generatedExam.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logApiError("/api/exams/generate", error, {
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate exam" },
      { status: 500 }
    );
  }
}

