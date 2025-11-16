import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { checkUsageLimit, incrementUsage, getSubscriptionLimits } from "@/lib/subscription-limits";
import { z } from "zod";

const sectionWiseTestSchema = z.object({
  exam: z.string().min(1),
  section: z.string().min(1), // e.g., "Quantitative Aptitude", "English", "Reasoning"
  questionCount: z.number().int().min(5).max(50).default(20),
  timeLimit: z.number().optional(), // in minutes
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { exam, section, questionCount, timeLimit } = sectionWiseTestSchema.parse(body);

    // Get user subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const limits = getSubscriptionLimits(user.subscriptionStatus);

    // Check if section-wise tests are allowed
    if (!limits.sectionWiseTests) {
      return NextResponse.json(
        { error: "Section-wise tests are only available in Pro and Topper plans. Please upgrade." },
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

    // Get questions from question bank filtered by section/topic
    const questions = await prisma.questionBank.findMany({
      where: {
        exam,
        OR: [
          { topic: { contains: section, mode: "insensitive" } },
          { subject: { contains: section, mode: "insensitive" } },
        ],
      },
      take: questionCount * 2, // Get more to randomize
      orderBy: { usageCount: "asc" },
    });

    if (questions.length < questionCount) {
      return NextResponse.json(
        { error: `Not enough questions available for section "${section}". Found ${questions.length}, need ${questionCount}` },
        { status: 400 }
      );
    }

    // Shuffle and select questions
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, questionCount);

    // Create test
    const test = await prisma.test.create({
      data: {
        userId: session.user.id,
        exam: `${exam} - ${section}`,
        timeLimit: timeLimit || null,
        questions: {
          create: selectedQuestions.map((q) => ({
            question: q.question,
            options: q.options,
            correctOption: q.correctOption,
            explanation: q.explanation,
            topic: q.topic || section,
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
        section,
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
    console.error("Error creating section-wise test:", error);
    return NextResponse.json(
      { error: "Failed to create section-wise test" },
      { status: 500 }
    );
  }
}

