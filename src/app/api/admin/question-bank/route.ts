import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createQuestionSchema = z.object({
  exam: z.string().min(1),
  subject: z.string().optional(),
  topic: z.string().optional(),
  question: z.string().min(1),
  options: z.array(z.string()).length(4),
  correctOption: z.string().min(1),
  explanation: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  source: z.string().optional(),
  year: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const exam = searchParams.get("exam");
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (exam) where.exam = exam;
    if (topic) where.topic = topic;
    if (difficulty) where.difficulty = difficulty;

    const [questions, total] = await Promise.all([
      prisma.questionBank.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.questionBank.count({ where }),
    ]);

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: error.status });
    }
    console.error("Error fetching question bank:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const session = await import("next-auth").then((m) =>
      m.getServerSession(await import("@/app/api/auth/[...nextauth]/route").then((m) => m.authOptions))
    );

    const body = await request.json();
    const data = createQuestionSchema.parse(body);

    const question = await prisma.questionBank.create({
      data: {
        ...data,
        createdBy: session?.user?.id,
      },
    });

    return NextResponse.json({ question }, { status: 201 });
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
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}

