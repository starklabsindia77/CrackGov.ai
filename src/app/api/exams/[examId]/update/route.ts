import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSessionSchema = z.object({
  sessionId: z.string().min(1),
  currentQuestion: z.number().int().min(0).optional(),
  answers: z.record(z.string()).optional(),
  timeRemaining: z.number().int().min(0).optional(),
});

export async function PATCH(
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
    const { sessionId, currentQuestion, answers, timeRemaining } =
      updateSessionSchema.parse(body);

    // Verify session belongs to user and exam
    const examSession = await prisma.examSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
        examId: examId,
        status: "in_progress",
      },
    });

    if (!examSession) {
      return NextResponse.json(
        { error: "Session not found or already completed" },
        { status: 404 }
      );
    }

    // Check if session expired
    if (new Date() > new Date(examSession.expiresAt)) {
      await prisma.examSession.update({
        where: { id: sessionId },
        data: { status: "expired" },
      });
      return NextResponse.json(
        { error: "Exam session has expired" },
        { status: 400 }
      );
    }

    // Update session
    const updateData: any = {
      lastActivityAt: new Date(),
    };

    if (currentQuestion !== undefined) {
      updateData.currentQuestion = currentQuestion;
    }

    if (answers !== undefined) {
      updateData.answers = answers;
    }

    if (timeRemaining !== undefined) {
      updateData.timeRemaining = timeRemaining;
    }

    const updatedSession = await prisma.examSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      session: {
        currentQuestion: updatedSession.currentQuestion,
        answers: updatedSession.answers,
        timeRemaining: updatedSession.timeRemaining,
        expiresAt: updatedSession.expiresAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating exam session:", error);
    return NextResponse.json(
      { error: "Failed to update exam session" },
      { status: 500 }
    );
  }
}

