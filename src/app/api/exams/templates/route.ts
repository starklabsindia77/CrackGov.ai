import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Get all active exam templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.examTemplate.findMany({
      where: { isActive: true },
      orderBy: { examName: "asc" },
      select: {
        id: true,
        examName: true,
        examCode: true,
        description: true,
        totalQuestions: true,
        timeLimit: true,
        sections: true,
        markingScheme: true,
        instructions: true,
      },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching exam templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam templates" },
      { status: 500 }
    );
  }
}

