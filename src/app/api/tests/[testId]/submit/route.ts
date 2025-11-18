import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { enqueueEmail, enqueueLeaderboardUpdate } from "@/lib/queue";
import { z } from "zod";

const submitTestSchema = z.object({
  answers: z.record(z.string()),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = submitTestSchema.parse(body);

    const test = await prisma.test.findUnique({
      where: { id: params.testId },
      include: { questions: true },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    if (test.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Evaluate answers
    let score = 0;
    const details: any[] = [];
    const topicStats: Record<string, { correct: number; total: number }> = {};

    for (const question of test.questions) {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctOption;

      if (isCorrect) {
        score++;
      }

      // Track topic-wise performance
      if (question.topic) {
        if (!topicStats[question.topic]) {
          topicStats[question.topic] = { correct: 0, total: 0 };
        }
        topicStats[question.topic].total++;
        if (isCorrect) {
          topicStats[question.topic].correct++;
        }
      }

      details.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctOption,
        isCorrect,
      });
    }

    const total = test.questions.length;
    const accuracy = (score / total) * 100;

    // Calculate topic breakdown
    const topicBreakdown: Record<string, { correct: number; total: number }> =
      {};
    for (const [topic, stats] of Object.entries(topicStats)) {
      topicBreakdown[topic] = stats;
    }

    // Identify weak topics (accuracy < 50%)
    const weakTopics = Object.entries(topicBreakdown)
      .filter(([_, stats]) => (stats.correct / stats.total) * 100 < 50)
      .map(([topic]) => topic);

    // Save attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        testId: test.id,
        userId: session.user.id,
        score,
        total,
        accuracy,
        details: {
          details,
          topicBreakdown,
        },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    // Send test result email via queue (async)
    enqueueEmail({
      to: attempt.user.email,
      subject: `Test Results - ${test.exam}`,
      template: "test-result",
      data: {
        exam: test.exam,
        score,
        total,
        accuracy,
        weakTopics,
      },
    }).catch((error) => {
      console.error("Error enqueueing test result email:", error);
    });

    // Update leaderboard via queue (async)
    enqueueLeaderboardUpdate({
      userId: session.user.id,
      testId: attempt.id,
      score,
      exam: test.exam,
    }).catch((error) => {
      console.error("Error enqueueing leaderboard update:", error);
    });

    return NextResponse.json({
      score,
      total,
      accuracy,
      topicBreakdown,
      weakTopics,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Test submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    );
  }
}

