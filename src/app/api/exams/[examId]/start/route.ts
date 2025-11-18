import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

    // Get the generated exam
    const exam = await prisma.generatedExam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    // Check if user owns this exam
    if (exam.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to access this exam" },
        { status: 403 }
      );
    }

    // Check if there's an active session
    const activeSession = await prisma.examSession.findFirst({
      where: {
        userId: session.user.id,
        examId: examId,
        status: "in_progress",
      },
    });

    if (activeSession) {
      // Return existing session
      const timeRemaining = Math.max(
        0,
        Math.floor((new Date(activeSession.expiresAt).getTime() - Date.now()) / 1000)
      );

      return NextResponse.json({
        sessionId: activeSession.id,
        examId: exam.id,
        startedAt: activeSession.startedAt,
        expiresAt: activeSession.expiresAt,
        timeRemaining,
        currentQuestion: activeSession.currentQuestion,
        answers: activeSession.answers,
      });
    }

    // Check if exam was already completed
    const completedAttempt = await prisma.examAttempt.findFirst({
      where: {
        userId: session.user.id,
        examId: examId,
      },
    });

    if (completedAttempt) {
      return NextResponse.json(
        { error: "This exam has already been completed" },
        { status: 400 }
      );
    }

    // Create new exam session
    const now = new Date();
    const expiresAt = new Date(now.getTime() + exam.timeLimit * 60 * 1000);

    const sessionData = await prisma.examSession.create({
      data: {
        userId: session.user.id,
        examId: exam.id,
        startedAt: now,
        expiresAt: expiresAt,
        currentQuestion: 0,
        answers: {},
        timeRemaining: exam.timeLimit * 60,
        status: "in_progress",
      },
    });

    // Update exam status
    await prisma.generatedExam.update({
      where: { id: examId },
      data: { status: "started" },
    });

    return NextResponse.json({
      sessionId: sessionData.id,
      examId: exam.id,
      startedAt: sessionData.startedAt,
      expiresAt: sessionData.expiresAt,
      timeRemaining: sessionData.timeRemaining,
      currentQuestion: sessionData.currentQuestion,
      answers: sessionData.answers,
    });
  } catch (error) {
    console.error("Error starting exam session:", error);
    return NextResponse.json(
      { error: "Failed to start exam session" },
      { status: 500 }
    );
  }
}

