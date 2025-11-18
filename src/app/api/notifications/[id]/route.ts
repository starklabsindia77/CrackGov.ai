import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/cache";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { read } = body;

    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user owns the notification
      },
      data: { read },
    });

    // Invalidate cache for this user's notifications
    await cache.invalidatePattern(`notifications:${session.user.id}*`);
    await cache.del(`notifications:unread-count:${session.user.id}`);

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
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

    await prisma.notification.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    // Invalidate cache for this user's notifications
    await cache.invalidatePattern(`notifications:${session.user.id}*`);
    await cache.del(`notifications:unread-count:${session.user.id}`);

    return NextResponse.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}

