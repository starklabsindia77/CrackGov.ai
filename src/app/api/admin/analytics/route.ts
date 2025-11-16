import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "30"; // days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // User metrics
    const [
      totalUsers,
      newUsers,
      proUsers,
      totalTests,
      totalAttempts,
      totalStudyPlans,
      recentUsers,
      recentTests,
      recentAttempts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: daysAgo } },
      }),
      prisma.user.count({
        where: { subscriptionStatus: "pro" },
      }),
      prisma.test.count(),
      prisma.testAttempt.count(),
      prisma.studyPlan.count(),
      prisma.user.findMany({
        where: { createdAt: { gte: daysAgo } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          subscriptionStatus: true,
          createdAt: true,
        },
      }),
      prisma.test.findMany({
        where: { createdAt: { gte: daysAgo } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.testAttempt.findMany({
        where: { createdAt: { gte: daysAgo } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
          test: {
            select: {
              exam: true,
            },
          },
        },
      }),
    ]);

    // Calculate revenue (assuming ₹999/month for Pro users)
    const estimatedMonthlyRevenue = proUsers * 999;

    // User growth trend (last 7 days) - simplified
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsersCount = await prisma.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Test attempts trend - simplified
    const recentAttemptsCount = await prisma.testAttempt.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    });

    const recentAvgAccuracy = await prisma.testAttempt.aggregate({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      _avg: {
        accuracy: true,
      },
    });

    // Exam-wise breakdown
    const examBreakdown = await prisma.test.groupBy({
      by: ["exam"],
      _count: true,
    });

    // Average accuracy
    const avgAccuracyResult = await prisma.testAttempt.aggregate({
      _avg: {
        accuracy: true,
      },
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        newUsers,
        proUsers,
        freeUsers: totalUsers - proUsers,
        totalTests,
        totalAttempts,
        totalStudyPlans,
        estimatedMonthlyRevenue,
        avgAccuracy: avgAccuracyResult._avg.accuracy || 0,
      },
      recent: {
        users: recentUsers,
        tests: recentTests,
        attempts: recentAttempts,
      },
      trends: {
        recentUsersCount,
        recentAttemptsCount,
        recentAvgAccuracy: recentAvgAccuracy._avg.accuracy || 0,
      },
      breakdown: {
        exams: examBreakdown,
      },
    });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: error.status });
    }
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

