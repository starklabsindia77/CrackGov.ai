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

    const group = await prisma.studyGroup.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        posts: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user is member
    const isMember = group.members.some((m) => m.userId === session.user.id);

    if (!group.isPublic && !isMember) {
      return NextResponse.json(
        { error: "Group is private" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      group: {
        ...group,
        memberCount: group._count.members,
        isMember,
      },
    });
  } catch (error) {
    console.error("Error fetching study group:", error);
    return NextResponse.json(
      { error: "Failed to fetch study group" },
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

    const group = await prisma.studyGroup.findUnique({
      where: { id: params.id },
      include: {
        members: {
          where: { userId: session.user.id, role: "admin" },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.createdById !== session.user.id && group.members.length === 0) {
      return NextResponse.json(
        { error: "Only group creator can delete" },
        { status: 403 }
      );
    }

    await prisma.studyGroup.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Group deleted" });
  } catch (error) {
    console.error("Error deleting study group:", error);
    return NextResponse.json(
      { error: "Failed to delete study group" },
      { status: 500 }
    );
  }
}

