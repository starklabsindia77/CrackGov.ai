import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const segment = await prisma.userSegment.findUnique({
      where: { id: params.id },
    });

    if (!segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    const criteria = segment.criteria as any;
    const where: any = {};

    if (criteria.subscriptionStatus) {
      where.subscriptionStatus = criteria.subscriptionStatus;
    }

    if (criteria.role) {
      where.role = criteria.role;
    }

    if (criteria.emailVerified !== undefined) {
      where.emailVerified = criteria.emailVerified;
    }

    // Clear existing memberships
    await prisma.userSegmentMembership.deleteMany({
      where: { segmentId: params.id },
    });

    // Find matching users
    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    // Add users to segment
    await prisma.userSegmentMembership.createMany({
      data: users.map((user) => ({
        userId: user.id,
        segmentId: params.id,
      })),
      skipDuplicates: true,
    });

    // Update segment count
    await prisma.userSegment.update({
      where: { id: params.id },
      data: { userCount: users.length },
    });

    return NextResponse.json({
      message: "Segment populated",
      userCount: users.length,
    });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: error.status });
    }
    console.error("Error populating segment:", error);
    return NextResponse.json(
      { error: "Failed to populate segment" },
      { status: 500 }
    );
  }
}

