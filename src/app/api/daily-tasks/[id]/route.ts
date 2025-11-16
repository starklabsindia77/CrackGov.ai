import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTaskSchema = z.object({
  completed: z.boolean().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.number().int().min(0).max(5).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = updateTaskSchema.parse(body);

    // Verify task belongs to user
    const task = await prisma.dailyTask.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updateData: any = {};
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
      if (data.completed) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;

    const updated = await prisma.dailyTask.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ task: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating daily task:", error);
    return NextResponse.json(
      { error: "Failed to update daily task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify task belongs to user
    const task = await prisma.dailyTask.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.dailyTask.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting daily task:", error);
    return NextResponse.json(
      { error: "Failed to delete daily task" },
      { status: 500 }
    );
  }
}

