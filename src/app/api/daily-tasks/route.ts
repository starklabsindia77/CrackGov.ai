import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTaskSchema = z.object({
  taskType: z.enum(["study_plan", "mock_test", "flashcard", "doubt", "notes"]),
  taskId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.number().int().min(0).max(5).default(0),
  date: z.string().optional(), // ISO date string
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const completed = searchParams.get("completed");

    const where: any = { userId: session.user.id };
    
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      where.date = {
        gte: targetDate,
        lt: nextDate,
      };
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      where.date = {
        gte: today,
        lt: tomorrow,
      };
    }

    if (completed !== null) {
      where.completed = completed === "true";
    }

    const tasks = await prisma.dailyTask.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching daily tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily tasks" },
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
    const { taskType, taskId, title, description, priority, date } = createTaskSchema.parse(body);

    const taskDate = date ? new Date(date) : new Date();
    taskDate.setHours(0, 0, 0, 0);

    const task = await prisma.dailyTask.create({
      data: {
        userId: session.user.id,
        taskType,
        taskId: taskId || null,
        title,
        description: description || null,
        priority,
        date: taskDate,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating daily task:", error);
    return NextResponse.json(
      { error: "Failed to create daily task" },
      { status: 500 }
    );
  }
}

