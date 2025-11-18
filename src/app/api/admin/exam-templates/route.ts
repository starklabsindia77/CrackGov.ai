import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createExamTemplateSchema = z.object({
  examName: z.string().min(1),
  examCode: z.string().min(1),
  description: z.string().optional(),
  totalQuestions: z.number().int().min(1),
  timeLimit: z.number().int().min(1),
  sections: z.any(), // JSON structure
  markingScheme: z.any(), // JSON structure
  questionTypes: z.array(z.string()).optional(),
  difficultyDistribution: z.any(), // JSON structure
  syllabus: z.any().optional(), // JSON structure
  guidelines: z.any().optional(), // JSON structure
  instructions: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateExamTemplateSchema = createExamTemplateSchema.partial();

export async function GET() {
  try {
    await requireAdmin();

    const templates = await prisma.examTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching exam templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = createExamTemplateSchema.parse(body);

    // Check if exam code already exists
    const existing = await prisma.examTemplate.findUnique({
      where: { examCode: data.examCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Exam code already exists" },
        { status: 400 }
      );
    }

    const template = await prisma.examTemplate.create({
      data: {
        ...data,
        questionTypes: data.questionTypes || ["MCQ"],
      },
    });

    return NextResponse.json({ template }, { status: 201 });
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
    console.error("Error creating exam template:", error);
    return NextResponse.json(
      { error: "Failed to create exam template" },
      { status: 500 }
    );
  }
}

