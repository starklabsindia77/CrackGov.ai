import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSegmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  criteria: z.record(z.any()),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const segments = await prisma.userSegment.findMany({
      include: {
        _count: {
          select: { memberships: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Update user counts
    const segmentsWithCounts = segments.map((segment) => ({
      ...segment,
      userCount: segment._count.memberships,
    }));

    return NextResponse.json({ segments: segmentsWithCounts });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: error.status });
    }
    console.error("Error fetching segments:", error);
    return NextResponse.json(
      { error: "Failed to fetch segments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = createSegmentSchema.parse(body);

    // Create segment
    const segment = await prisma.userSegment.create({
      data: {
        name: data.name,
        description: data.description,
        criteria: data.criteria,
      },
    });

    // Auto-populate segment based on criteria
    await populateSegment(segment.id, data.criteria);

    return NextResponse.json({ segment }, { status: 201 });
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
    console.error("Error creating segment:", error);
    return NextResponse.json(
      { error: "Failed to create segment" },
      { status: 500 }
    );
  }
}

async function populateSegment(segmentId: string, criteria: any) {
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

  // Find matching users
  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  });

  // Add users to segment
  await prisma.userSegmentMembership.createMany({
    data: users.map((user) => ({
      userId: user.id,
      segmentId,
    })),
    skipDuplicates: true,
  });

  // Update segment count
  await prisma.userSegment.update({
    where: { id: segmentId },
    data: { userCount: users.length },
  });
}

