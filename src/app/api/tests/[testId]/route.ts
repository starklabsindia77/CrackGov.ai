import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const test = await prisma.test.findUnique({
      where: { id: params.testId },
      include: {
        questions: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    if (test.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      id: test.id,
      exam: test.exam,
      timeLimit: test.timeLimit,
      questions: test.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options as string[],
        correctOption: q.correctOption,
        explanation: q.explanation,
        topic: q.topic,
      })),
    });
  } catch (error) {
    console.error("Test fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}

