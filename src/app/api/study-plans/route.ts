import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studyPlans = await prisma.studyPlan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        exam: true,
        targetDate: true,
        hoursPerDay: true,
        weakTopics: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ studyPlans });
  } catch (error) {
    console.error("Error fetching study plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch study plans" },
      { status: 500 }
    );
  }
}

