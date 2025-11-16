import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateNextReview } from "@/lib/flashcard-spaced-repetition";

const reviewSchema = z.object({
  result: z.enum(["correct", "incorrect", "hard"]),
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
    const { result, timeSpent } = reviewSchema.parse(body);

    const flashcard = await prisma.flashcard.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!flashcard) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
    }

    // Calculate next review using spaced repetition
    const reviewData = calculateNextReview(
      flashcard.difficulty,
      flashcard.reviewCount,
      flashcard.correctCount,
      result
    );

    // Update flashcard
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: params.id },
      data: {
        difficulty: reviewData.difficulty,
        reviewCount: reviewData.reviewCount,
        correctCount: reviewData.correctCount,
        nextReview: reviewData.nextReview,
        lastReviewed: new Date(),
      },
    });

    // Record review
    const review = await prisma.flashcardReview.create({
      data: {
        userId: session.user.id,
        flashcardId: params.id,
        result,
        timeSpent: timeSpent || null,
      },
    });

    return NextResponse.json({
      flashcard: updatedFlashcard,
      review,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error recording review:", error);
    return NextResponse.json(
      { error: "Failed to record review" },
      { status: 500 }
    );
  }
}

