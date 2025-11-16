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

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "weekly"; // daily, weekly, monthly, all-time
    const exam = searchParams.get("exam") || null;
    const limit = parseInt(searchParams.get("limit") || "50");

    // Calculate period dates
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

    // Get leaderboard entries
    const where: any = {
      period,
      periodStart,
    };
    if (exam) where.exam = exam;
    if (periodEnd) where.periodEnd = periodEnd;

    const entries = await prisma.leaderboardEntry.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { score: "desc" },
      take: limit,
    });

    // Calculate ranks
    const rankedEntries = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Get user's rank
    const userEntry = await prisma.leaderboardEntry.findFirst({
      where: {
        ...where,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const userRank = userEntry
      ? await prisma.leaderboardEntry.count({
          where: {
            ...where,
            score: { gt: userEntry.score },
          },
        }) + 1
      : null;

    return NextResponse.json({
      entries: rankedEntries,
      userRank: userRank
        ? {
            ...userEntry,
            rank: userRank,
          }
        : null,
      period,
      exam,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

