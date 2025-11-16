import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createFlashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  topic: z.string().optional(),
  exam: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const topic = searchParams.get("topic");
    const exam = searchParams.get("exam");
    const dueOnly = searchParams.get("dueOnly") === "true";
    const tag = searchParams.get("tag");

    const where: any = { userId: session.user.id };
    if (topic) where.topic = topic;
    if (exam) where.exam = exam;
    if (tag) where.tags = { has: tag };
    if (dueOnly) {
      where.nextReview = { lte: new Date() };
    }

    const flashcards = await prisma.flashcard.findMany({
      where,
      orderBy: dueOnly ? { nextReview: "asc" } : { createdAt: "desc" },
    });

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
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
    const data = createFlashcardSchema.parse(body);

    const flashcard = await prisma.flashcard.create({
      data: {
        userId: session.user.id,
        front: data.front,
        back: data.back,
        topic: data.topic,
        exam: data.exam,
        tags: data.tags || [],
      },
    });

    return NextResponse.json({ flashcard }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating flashcard:", error);
    return NextResponse.json(
      { error: "Failed to create flashcard" },
      { status: 500 }
    );
  }
}

