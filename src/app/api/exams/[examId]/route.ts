import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
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
      include: {
        template: {
          select: {
            markingScheme: true,
            instructions: true,
            guidelines: true,
          },
        },
      },
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

    // Check for existing attempt
    const attempt = await prisma.examAttempt.findFirst({
      where: {
        userId: session.user.id,
        examId: examId,
      },
      orderBy: { completedAt: "desc" },
    });

    // Check for active session
    const activeSession = await prisma.examSession.findFirst({
      where: {
        userId: session.user.id,
        examId: examId,
        status: "in_progress",
      },
    });

    return NextResponse.json({
      exam: {
        id: exam.id,
        examName: exam.examName,
        examCode: exam.examCode,
        totalQuestions: exam.totalQuestions,
        timeLimit: exam.timeLimit,
        status: exam.status,
        questions: exam.questions,
        markingScheme: exam.template.markingScheme,
        instructions: exam.template.instructions,
        guidelines: exam.template.guidelines,
        createdAt: exam.createdAt,
      },
      attempt: attempt
        ? {
            id: attempt.id,
            score: attempt.score,
            maxScore: attempt.maxScore,
            percentage: attempt.percentage,
            completedAt: attempt.completedAt,
          }
        : null,
      activeSession: activeSession
        ? {
            id: activeSession.id,
            startedAt: activeSession.startedAt,
            expiresAt: activeSession.expiresAt,
            currentQuestion: activeSession.currentQuestion,
            timeRemaining: Math.max(
              0,
              Math.floor(
                (new Date(activeSession.expiresAt).getTime() - Date.now()) / 1000
              )
            ),
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

