import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  exam: z.string().optional(),
  isPublic: z.boolean().optional(),
  maxMembers: z.number().min(2).max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const exam = searchParams.get("exam");
    const myGroups = searchParams.get("myGroups") === "true";

    const where: any = {};
    if (exam) where.exam = exam;
    if (myGroups) {
      where.members = {
        some: { userId: session.user.id },
      };
    } else {
      where.isPublic = true;
    }

    const groups = await prisma.studyGroup.findMany({
      where,
      include: {
        _count: {
          select: { members: true },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      groups: groups.map((g) => ({
        ...g,
        memberCount: g._count.members,
      })),
    });
  } catch (error) {
    console.error("Error fetching study groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch study groups" },
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
    const data = createGroupSchema.parse(body);

    // Create group and add creator as admin
    const group = await prisma.studyGroup.create({
      data: {
        name: data.name,
        description: data.description,
        exam: data.exam,
        isPublic: data.isPublic ?? true,
        maxMembers: data.maxMembers ?? 50,
        createdById: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return NextResponse.json(
      {
        group: {
          ...group,
          memberCount: group._count.members,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating study group:", error);
    return NextResponse.json(
      { error: "Failed to create study group" },
      { status: 500 }
    );
  }
}

