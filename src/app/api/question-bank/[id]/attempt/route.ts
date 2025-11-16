import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const attemptSchema = z.object({
  selectedOption: z.string().optional(),
  timeSpent: z.number().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { selectedOption, timeSpent } = attemptSchema.parse(body);

    const question = await prisma.questionBank.findUnique({
      where: { id: params.id },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const isCorrect = selectedOption === question.correctOption;

    // Record attempt
    const attempt = await prisma.questionAttempt.create({
      data: {
        userId: session.user.id,
        questionId: params.id,
        selectedOption: selectedOption || null,
        isCorrect,
        timeSpent: timeSpent || null,
      },
    });

    // Update usage count
    await prisma.questionBank.update({
      where: { id: params.id },
      data: { usageCount: { increment: 1 } },
    });

    return NextResponse.json({
      attempt,
      isCorrect,
      correctOption: question.correctOption,
      explanation: question.explanation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error recording attempt:", error);
    return NextResponse.json(
      { error: "Failed to record attempt" },
      { status: 500 }
    );
  }
}

