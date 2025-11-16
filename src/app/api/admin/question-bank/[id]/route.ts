import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateQuestionSchema = z.object({
  exam: z.string().min(1).optional(),
  subject: z.string().optional(),
  topic: z.string().optional(),
  question: z.string().min(1).optional(),
  options: z.array(z.string()).length(4).optional(),
  correctOption: z.string().min(1).optional(),
  explanation: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  source: z.string().optional(),
  year: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = updateQuestionSchema.parse(body);

    const question = await prisma.questionBank.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ question });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: error.status });
    }
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    await prisma.questionBank.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Question deleted" });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: error.status });
    }
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}

