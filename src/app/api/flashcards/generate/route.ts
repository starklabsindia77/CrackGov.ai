import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const generateSchema = z.object({
  topic: z.string().optional(),
  exam: z.string().optional(),
  count: z.number().min(1).max(50).default(10),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { topic, exam, count } = generateSchema.parse(body);

    // Get user's weak topics from test attempts
    const attempts = await prisma.testAttempt.findMany({
      where: {
        userId: session.user.id,
      },
      take: 50,
      orderBy: { createdAt: "desc" },
    });

    const weakTopics: string[] = [];
    attempts.forEach((attempt) => {
      const details = attempt.details as any;
      if (details?.topicBreakdown) {
        Object.entries(details.topicBreakdown).forEach(([topic, stats]: [string, any]) => {
          const accuracy = (stats.correct / stats.total) * 100;
          if (accuracy < 50 && !weakTopics.includes(topic)) {
            weakTopics.push(topic);
          }
        });
      }
    });

    // Get questions from question bank for weak topics
    const where: any = {};
    if (exam) where.exam = exam;
    if (topic) {
      where.topic = topic;
    } else if (weakTopics.length > 0) {
      where.topic = { in: weakTopics };
    }

    const questions = await prisma.questionBank.findMany({
      where,
      take: count * 2, // Get more to randomize
      orderBy: { usageCount: "asc" },
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions found to generate flashcards" },
        { status: 400 }
      );
    }

    // Shuffle and select
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    // Create flashcards from questions
    const flashcards = await Promise.all(
      selected.map((q) =>
        prisma.flashcard.create({
          data: {
            userId: session.user.id,
            front: q.question,
            back: `${q.correctOption}\n\n${q.explanation || ""}`,
            topic: q.topic || undefined,
            exam: q.exam,
            tags: q.tags || [],
          },
        })
      )
    );

    return NextResponse.json({ flashcards }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error generating flashcards:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}

