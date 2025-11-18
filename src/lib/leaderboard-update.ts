import { prisma } from "./prisma";

/**
 * Update leaderboard entries for a user after test submission
 */
export async function updateLeaderboard(
  userId: string,
  testId: string,
  score: number,
  exam?: string
) {
  const now = new Date();
  const periods = [
    { name: "daily", start: new Date(now.setHours(0, 0, 0, 0)) },
    {
      name: "weekly",
      start: new Date(
        now.setDate(now.getDate() - now.getDay())
      ),
    },
    {
      name: "monthly",
      start: new Date(now.getFullYear(), now.getMonth(), 1),
    },
    { name: "all-time", start: new Date(0) },
  ];

  // Get test attempt details
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: testId },
    include: { test: true },
  });

  if (!attempt) {
    throw new Error("Test attempt not found");
  }

  const examType = exam || attempt.test.exam;

  // Update leaderboard for each period
  for (const period of periods) {
    const periodEnd =
      period.name === "all-time"
        ? null
        : period.name === "daily"
        ? new Date(period.start.getTime() + 24 * 60 * 60 * 1000)
        : period.name === "weekly"
        ? new Date(period.start.getTime() + 7 * 24 * 60 * 60 * 1000)
        : new Date(
            period.start.getFullYear(),
            period.start.getMonth() + 1,
            1
          );

    // Find or create leaderboard entry
    const existing = await prisma.leaderboardEntry.findUnique({
      where: {
        userId_exam_period_periodStart: {
          userId,
          exam: examType || null,
          period: period.name,
          periodStart: period.start,
        },
      },
    });

    if (existing) {
      // Update score if new score is higher
      if (score > existing.score) {
        await prisma.leaderboardEntry.update({
          where: { id: existing.id },
          data: {
            score,
            metadata: {
              testsTaken: ((existing.metadata as any)?.testsTaken || 0) + 1,
              avgAccuracy: attempt.accuracy,
            },
          },
        });
      } else {
        // Just update metadata
        await prisma.leaderboardEntry.update({
          where: { id: existing.id },
          data: {
            metadata: {
              testsTaken: ((existing.metadata as any)?.testsTaken || 0) + 1,
              avgAccuracy: attempt.accuracy,
            },
          },
        });
      }
    } else {
      // Create new entry
      await prisma.leaderboardEntry.create({
        data: {
          userId,
          exam: examType || null,
          period: period.name,
          score,
          periodStart: period.start,
          periodEnd,
          metadata: {
            testsTaken: 1,
            avgAccuracy: attempt.accuracy,
          },
        },
      });
    }
  }
}

