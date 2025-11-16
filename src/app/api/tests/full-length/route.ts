import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { callAI } from "@/lib/ai-orchestrator";
import { checkUsageLimit, incrementUsage, getSubscriptionLimits } from "@/lib/subscription-limits";
import { z } from "zod";

const fullLengthTestSchema = z.object({
  exam: z.string().min(1),
  timeLimit: z.number().optional(), // in minutes
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { exam, timeLimit } = fullLengthTestSchema.parse(body);

    // Get user subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const limits = getSubscriptionLimits(user.subscriptionStatus);

    // Check if full-length tests are allowed
    if (!limits.fullLengthTests) {
      return NextResponse.json(
        { error: "Full-length tests (100 questions) are only available in Pro and Topper plans. Please upgrade." },
        { status: 403 }
      );
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(session.user.id, "mockTests", user.subscriptionStatus);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: "Monthly mock test limit reached",
          limit: usageCheck.limit,
          remaining: usageCheck.remaining,
        },
        { status: 403 }
      );
    }

    // Get questions from question bank
    const questions = await prisma.questionBank.findMany({
      where: { exam },
      take: 200, // Get more to randomize
      orderBy: { usageCount: "asc" },
    });

    if (questions.length < 100) {
      return NextResponse.json(
        { error: `Not enough questions available. Found ${questions.length}, need 100` },
        { status: 400 }
      );
    }

    // Shuffle and select 100 questions
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, 100);

    // Create test
    const test = await prisma.test.create({
      data: {
        userId: session.user.id,
        exam,
        timeLimit: timeLimit || null,
        questions: {
          create: selectedQuestions.map((q) => ({
            question: q.question,
            options: q.options,
            correctOption: q.correctOption,
            explanation: q.explanation,
            topic: q.topic || undefined,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    // Update usage count for questions
    await prisma.questionBank.updateMany({
      where: {
        id: { in: selectedQuestions.map((q) => q.id) },
      },
      data: {
        usageCount: { increment: 1 },
      },
    });

    // Increment usage
    await incrementUsage(session.user.id, "mockTests");

    return NextResponse.json({
      success: true,
      test: {
        id: test.id,
        exam: test.exam,
        questionCount: test.questions.length,
        timeLimit: timeLimit || null,
        createdAt: test.createdAt,
      },
      usage: {
        remaining: usageCheck.remaining - 1,
        limit: usageCheck.limit,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating full-length test:", error);
    return NextResponse.json(
      { error: "Failed to create full-length test" },
      { status: 500 }
    );
  }
}

