import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's test attempts
    const attempts = await prisma.testAttempt.findMany({
      where: { userId: session.user.id },
      include: {
        test: {
          select: {
            exam: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get study plans
    const studyPlans = await prisma.studyPlan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Calculate statistics
    const totalTests = attempts.length;
    const avgAccuracy = totalTests > 0
      ? attempts.reduce((sum, a) => sum + a.accuracy, 0) / totalTests
      : 0;

    // Recent performance (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAttempts = attempts.filter(
      (a) => new Date(a.createdAt) >= sevenDaysAgo
    );
    const recentAvgAccuracy = recentAttempts.length > 0
      ? recentAttempts.reduce((sum, a) => sum + a.accuracy, 0) / recentAttempts.length
      : 0;

    // Exam-wise breakdown
    const examStats: Record<string, { count: number; avgAccuracy: number }> = {};
    attempts.forEach((attempt) => {
      const exam = attempt.test.exam;
      if (!examStats[exam]) {
        examStats[exam] = { count: 0, avgAccuracy: 0 };
      }
      examStats[exam].count++;
      examStats[exam].avgAccuracy += attempt.accuracy;
    });

    Object.keys(examStats).forEach((exam) => {
      examStats[exam].avgAccuracy /= examStats[exam].count;
    });

    // Progress trend (last 5 attempts)
    const last5Attempts = attempts.slice(0, 5).reverse();
    const trend = last5Attempts.map((a) => ({
      date: a.createdAt,
      accuracy: a.accuracy,
    }));

    // Study plan progress
    const activePlans = studyPlans.filter((plan) => {
      const targetDate = new Date(plan.targetDate);
      return targetDate >= new Date();
    });

    return NextResponse.json({
      totalTests,
      avgAccuracy,
      recentAvgAccuracy,
      recentTestCount: recentAttempts.length,
      examStats,
      trend,
      activePlans: activePlans.length,
      totalPlans: studyPlans.length,
    });
  } catch (error) {
    console.error("Error fetching progress analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress analytics" },
      { status: 500 }
    );
  }
}

