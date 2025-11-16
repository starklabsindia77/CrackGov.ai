import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const customTestSchema = z.object({
  exam: z.string().min(1),
  topics: z.array(z.string()).optional(),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]).optional(),
  subject: z.string().optional(),
  questionCount: z.number().min(5).max(50).default(20),
  timeLimit: z.number().optional(), // in minutes
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = customTestSchema.parse(body);

    // Build query for question bank
    const where: any = {
      exam: data.exam,
    };

    if (data.topics && data.topics.length > 0) {
      where.topic = { in: data.topics };
    }

    if (data.difficulty && data.difficulty !== "mixed") {
      where.difficulty = data.difficulty;
    }

    if (data.subject) {
      where.subject = data.subject;
    }

    // Get questions from question bank
    const availableQuestions = await prisma.questionBank.findMany({
      where,
      take: data.questionCount * 2, // Get more to randomize
      orderBy: { usageCount: "asc" }, // Prefer less used questions
    });

    if (availableQuestions.length < data.questionCount) {
      return NextResponse.json(
        { error: `Not enough questions available. Found ${availableQuestions.length}, need ${data.questionCount}` },
        { status: 400 }
      );
    }

    // Randomize and select
    const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, data.questionCount);

    // Create test
    const test = await prisma.test.create({
      data: {
        userId: session.user.id,
        exam: data.exam,
        questions: {
          create: selectedQuestions.map((q) => ({
            question: q.question,
            options: q.options,
            correctOption: q.correctOption,
            explanation: q.explanation,
            topic: q.topic,
          })),
        },
      },
    });

    // Update usage count for selected questions
    await prisma.questionBank.updateMany({
      where: {
        id: { in: selectedQuestions.map((q) => q.id) },
      },
      data: {
        usageCount: { increment: 1 },
      },
    });

    return NextResponse.json({ testId: test.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating custom test:", error);
    return NextResponse.json(
      { error: "Failed to create custom test" },
      { status: 500 }
    );
  }
}

