import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id: params.id },
    });

    if (!studyPlan) {
      return NextResponse.json(
        { error: "Study plan not found" },
        { status: 404 }
      );
    }

    if (studyPlan.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ studyPlan });
  } catch (error) {
    console.error("Error fetching study plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch study plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id: params.id },
    });

    if (!studyPlan) {
      return NextResponse.json(
        { error: "Study plan not found" },
        { status: 404 }
      );
    }

    if (studyPlan.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.studyPlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Study plan deleted" });
  } catch (error) {
    console.error("Error deleting study plan:", error);
    return NextResponse.json(
      { error: "Failed to delete study plan" },
      { status: 500 }
    );
  }
}

