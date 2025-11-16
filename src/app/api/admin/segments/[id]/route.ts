import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSegmentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  criteria: z.record(z.any()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const segment = await prisma.userSegment.findUnique({
      where: { id: params.id },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                subscriptionStatus: true,
                role: true,
              },
            },
          },
          take: 50,
        },
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    return NextResponse.json({
      segment: {
        ...segment,
        userCount: segment._count.memberships,
      },
    });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: error.status });
    }
    console.error("Error fetching segment:", error);
    return NextResponse.json(
      { error: "Failed to fetch segment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = updateSegmentSchema.parse(body);

    const segment = await prisma.userSegment.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        criteria: data.criteria,
      },
    });

    // Re-populate if criteria changed
    if (data.criteria) {
      // Clear existing memberships
      await prisma.userSegmentMembership.deleteMany({
        where: { segmentId: params.id },
      });

      // Re-populate
      const where: any = {};
      if (data.criteria.subscriptionStatus) {
        where.subscriptionStatus = data.criteria.subscriptionStatus;
      }
      if (data.criteria.role) {
        where.role = data.criteria.role;
      }
      if (data.criteria.emailVerified !== undefined) {
        where.emailVerified = data.criteria.emailVerified;
      }

      const users = await prisma.user.findMany({
        where,
        select: { id: true },
      });

      await prisma.userSegmentMembership.createMany({
        data: users.map((user) => ({
          userId: user.id,
          segmentId: params.id,
        })),
        skipDuplicates: true,
      });

      await prisma.userSegment.update({
        where: { id: params.id },
        data: { userCount: users.length },
      });
    }

    return NextResponse.json({ segment });
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
    console.error("Error updating segment:", error);
    return NextResponse.json(
      { error: "Failed to update segment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    await prisma.userSegment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Segment deleted" });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: error.status });
    }
    console.error("Error deleting segment:", error);
    return NextResponse.json(
      { error: "Failed to delete segment" },
      { status: 500 }
    );
  }
}

