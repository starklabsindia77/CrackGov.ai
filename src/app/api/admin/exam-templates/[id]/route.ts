import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateExamTemplateSchema = z.object({
  examName: z.string().min(1).optional(),
  examCode: z.string().min(1).optional(),
  description: z.string().optional(),
  totalQuestions: z.number().int().min(1).optional(),
  timeLimit: z.number().int().min(1).optional(),
  sections: z.any().optional(),
  markingScheme: z.any().optional(),
  questionTypes: z.array(z.string()).optional(),
  difficultyDistribution: z.any().optional(),
  syllabus: z.any().optional(),
  guidelines: z.any().optional(),
  instructions: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const template = await prisma.examTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Exam template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching exam template:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam template" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = updateExamTemplateSchema.parse(body);

    // If examCode is being updated, check for conflicts
    if (data.examCode) {
      const existing = await prisma.examTemplate.findFirst({
        where: {
          examCode: data.examCode,
          id: { not: params.id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Exam code already exists" },
          { status: 400 }
        );
      }
    }

    const template = await prisma.examTemplate.update({
      where: { id: params.id },
      data: data,
    });

    return NextResponse.json({ template });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating exam template:", error);
    return NextResponse.json(
      { error: "Failed to update exam template" },
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

    // Check if template has generated exams
    const generatedExams = await prisma.generatedExam.count({
      where: { templateId: params.id },
    });

    if (generatedExams > 0) {
      // Soft delete by setting isActive to false
      const template = await prisma.examTemplate.update({
        where: { id: params.id },
        data: { isActive: false },
      });
      return NextResponse.json({ template });
    }

    // Hard delete if no generated exams
    await prisma.examTemplate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error deleting exam template:", error);
    return NextResponse.json(
      { error: "Failed to delete exam template" },
      { status: 500 }
    );
  }
}

