import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { callAI } from "@/lib/ai-orchestrator";
import { aiRateLimiter } from "@/lib/rate-limit-redis";
import { logApiError } from "@/lib/logger";
import { z } from "zod";

const generateTestSchema = z.object({
  exam: z.string().min(1),
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
    const { exam } = generateTestSchema.parse(body);

    const prompt = `Generate exactly 20 multiple-choice questions for ${exam} exam preparation. 

Each question should be:
- Relevant to ${exam} syllabus
- Clear and unambiguous
- With 4 options (A, B, C, D)
- Include the correct answer
- Include a brief explanation
- Include the topic/subject area

Return the response as a valid JSON array with this exact structure:
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOption": "Option A",
    "explanation": "Brief explanation of why this is correct",
    "topic": "Topic name"
  }
]

Generate diverse questions covering different topics relevant to ${exam}.`;

    const result = await callAI({
      featureCode: "MOCK_TEST",
      messages: [
        {
          role: "system",
          content:
            "You are an expert exam question generator. Return a JSON object with a 'questions' array containing exactly 20 questions. Each question must have: id, question, options (array of 4 strings), correctOption, explanation, and topic.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      responseFormat: { type: "json_object" },
    });

    if (!result.success || !result.content) {
      throw new Error(result.error || "Failed to generate test");
    }

    // Parse the response - AI returns a JSON object
    const parsed = JSON.parse(result.content);
    const questions = parsed.questions || parsed.data || [];

    if (!Array.isArray(questions) || questions.length !== 20) {
      throw new Error("Invalid question format or count");
    }

    // Create test in database
    const test = await prisma.test.create({
      data: {
        userId: session.user.id,
        exam,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            correctOption: q.correctOption,
            explanation: q.explanation || null,
            topic: q.topic || null,
          })),
        },
      },
    });

    return NextResponse.json({ testId: test.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    logApiError("/api/tests/generate", error, {
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: "Failed to generate test" },
      { status: 500 }
    );
  }
}

