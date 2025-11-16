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

    // Revenue calculations (assuming ₹999/month for Pro)
    const proUsers = await prisma.user.count({
      where: { subscriptionStatus: "pro" },
    });

    const newProUsers = await prisma.user.count({
      where: {
        subscriptionStatus: "pro",
        updatedAt: { gte: daysAgo },
      },
    });

    // Calculate estimated monthly recurring revenue (MRR)
    const mrr = proUsers * 999;

    // Calculate estimated annual recurring revenue (ARR)
    const arr = mrr * 12;

    // Revenue trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyRevenue: Array<{ date: string; newSubscribers: number; revenue: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const newSubs = await prisma.user.count({
        where: {
          subscriptionStatus: "pro",
          updatedAt: { gte: date, lt: nextDate },
        },
      });

      dailyRevenue.push({
        date: date.toISOString().split("T")[0],
        newSubscribers: newSubs,
        revenue: newSubs * 999,
      });
    }

    // Conversion metrics
    const totalUsers = await prisma.user.count();
    const freeUsers = totalUsers - proUsers;
    const conversionRate = totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0;

    // Churn calculation (users who were pro but are now free - simplified)
    // In production, you'd track subscription history
    const churnedUsers = await prisma.user.count({
      where: {
        subscriptionStatus: "free",
        updatedAt: { gte: daysAgo },
        // This is simplified - in production, track subscription history
      },
    });

    const churnRate = proUsers > 0 ? (churnedUsers / (proUsers + churnedUsers)) * 100 : 0;

    // Revenue by user acquisition date
    const revenueByCohort = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        subscriptionStatus: "pro",
        createdAt: { gte: daysAgo },
      },
      _count: true,
    });

    // Lifetime value estimation (simplified)
    const avgLifetimeMonths = 6; // Assume average 6 months subscription
    const ltv = 999 * avgLifetimeMonths;

    return NextResponse.json({
      overview: {
        mrr,
        arr,
        proUsers,
        freeUsers,
        totalUsers,
        conversionRate,
        churnRate,
        ltv,
        newProUsers,
      },
      trends: {
        dailyRevenue,
      },
      cohorts: revenueByCohort.map((cohort) => ({
        date: cohort.createdAt.toISOString().split("T")[0],
        users: cohort._count,
        revenue: cohort._count * 999,
      })),
    });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: error.status });
    }
    console.error("Error fetching revenue analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue analytics" },
      { status: 500 }
    );
  }
}

