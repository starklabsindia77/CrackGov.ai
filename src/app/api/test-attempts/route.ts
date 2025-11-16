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

    const attempts = await prisma.testAttempt.findMany({
      where: { userId: session.user.id },
      include: {
        test: {
          select: {
            id: true,
            exam: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("Error fetching test attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch test attempts" },
      { status: 500 }
    );
  }
}

