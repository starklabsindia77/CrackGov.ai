import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// This endpoint should be called periodically (e.g., via cron) to update leaderboards
// For now, we'll call it after test submissions

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || session.user.id;
    const exam = searchParams.get("exam") || null;

    // Get user's recent test attempts
    const attempts = await prisma.testAttempt.findMany({
      where: {
        userId,
        ...(exam && {
          test: {
            exam,
          },
        }),
      },
      include: {
        test: {
          select: {
            exam: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    if (attempts.length === 0) {
      return NextResponse.json({ message: "No attempts to process" });
    }

    // Calculate scores for different periods
    const periods = ["daily", "weekly", "monthly", "all-time"];

    for (const period of periods) {
      const now = new Date();
      let periodStart: Date;
      let periodEnd: Date | null = null;

      switch (period) {
        case "daily":
          periodStart = new Date(now);
          periodStart.setHours(0, 0, 0, 0);
          periodEnd = new Date(periodStart);
          periodEnd.setDate(periodEnd.getDate() + 1);
          break;
        case "weekly":
          periodStart = new Date(now);
          periodStart.setDate(periodStart.getDate() - periodStart.getDay());
          periodStart.setHours(0, 0, 0, 0);
          periodEnd = new Date(periodStart);
          periodEnd.setDate(periodEnd.getDate() + 7);
          break;
        case "monthly":
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        default: // all-time
          periodStart = new Date(0);
          periodEnd = null;
      }

      // Filter attempts for this period
      const periodAttempts = attempts.filter((attempt) => {
        const attemptDate = new Date(attempt.createdAt);
        return (
          attemptDate >= periodStart &&
          (periodEnd === null || attemptDate < periodEnd)
        );
      });

      if (periodAttempts.length === 0) continue;

      // Calculate score (weighted: accuracy * tests taken)
      const totalTests = periodAttempts.length;
      const avgAccuracy =
        periodAttempts.reduce((sum, a) => sum + a.accuracy, 0) /
        periodAttempts.length;
      const score = Math.round(avgAccuracy * totalTests * 10); // Scale for better ranking

      // Get exam type (use most common if multiple)
      const examCounts: Record<string, number> = {};
      periodAttempts.forEach((a) => {
        const examType = a.test.exam;
        examCounts[examType] = (examCounts[examType] || 0) + 1;
      });
      const topExam =
        Object.entries(examCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        exam ||
        null;

      // Upsert leaderboard entry
      await prisma.leaderboardEntry.upsert({
        where: {
          userId_exam_period_periodStart: {
            userId,
            exam: topExam || "",
            period,
            periodStart,
          },
        },
        update: {
          score,
          metadata: {
            testsTaken: totalTests,
            avgAccuracy,
            lastUpdated: new Date().toISOString(),
          },
        },
        create: {
          userId,
          exam: topExam,
          period,
          score,
          periodStart,
          periodEnd,
          metadata: {
            testsTaken: totalTests,
            avgAccuracy,
            lastUpdated: new Date().toISOString(),
          },
        },
      });
    }

    return NextResponse.json({ message: "Leaderboard updated" });
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to update leaderboard" },
      { status: 500 }
    );
  }
}

