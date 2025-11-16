import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createStreakSchema = z.object({
  activityType: z.enum(["test", "study_plan", "doubt", "all"]),
  date: z.string().optional(), // ISO date string, defaults to today
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const streaks = await prisma.studyStreak.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate },
      },
      orderBy: { date: "desc" },
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasActivity = streaks.some(
        (s) => new Date(s.date).toDateString() === checkDate.toDateString()
      );
      
      if (hasActivity) {
        currentStreak++;
      } else if (i > 0) {
        // Break if not today and no activity
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedStreaks = [...streaks].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 0; i < sortedStreaks.length; i++) {
      const currentDate = new Date(sortedStreaks[i].date);
      currentDate.setHours(0, 0, 0, 0);
      
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedStreaks[i - 1].date);
        prevDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return NextResponse.json({
      streaks,
      currentStreak,
      longestStreak,
      totalDays: streaks.length,
    });
  } catch (error) {
    console.error("Error fetching streaks:", error);
    return NextResponse.json(
      { error: "Failed to fetch streaks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createStreakSchema.parse(body);

    const date = data.date ? new Date(data.date) : new Date();
    date.setHours(0, 0, 0, 0);

    // Check if streak already exists for this date and activity type
    const existing = await prisma.studyStreak.findUnique({
      where: {
        userId_date_activityType: {
          userId: session.user.id,
          date,
          activityType: data.activityType,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ streak: existing });
    }

    const streak = await prisma.studyStreak.create({
      data: {
        userId: session.user.id,
        date,
        activityType: data.activityType,
      },
    });

    return NextResponse.json({ streak }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    // Handle unique constraint violation
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Streak already recorded for this date" },
        { status: 409 }
      );
    }
    console.error("Error creating streak:", error);
    return NextResponse.json(
      { error: "Failed to create streak" },
      { status: 500 }
    );
  }
}

