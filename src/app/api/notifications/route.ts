import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prismaRead, prisma } from "@/lib/prisma";
import { cache, CacheKeys } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = { userId: session.user.id };
    if (unreadOnly) {
      where.read = false;
    }

    // Generate cache key
    const cacheKey = `${CacheKeys.notifications(session.user.id)}:${unreadOnly ? "unread" : "all"}:${limit}`;
    const unreadCountKey = `notifications:unread-count:${session.user.id}`;

    // Try cache first (cache for 30 seconds for notifications)
    const cached = await cache.get<any>(cacheKey);
    const cachedUnreadCount = await cache.get<number>(unreadCountKey);

    if (cached && cachedUnreadCount !== null) {
      return NextResponse.json({
        notifications: cached.notifications,
        unreadCount: cachedUnreadCount,
      });
    }

    // Use read replica for queries
    const notifications = await prismaRead.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const unreadCount = await prismaRead.notification.count({
      where: { userId: session.user.id, read: false },
    });

    const response = {
      notifications,
      unreadCount,
    };

    // Cache for 30 seconds (notifications change frequently)
    await cache.set(cacheKey, response, 30);
    await cache.set(unreadCountKey, unreadCount, 30);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
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
    const { title, message, type = "info", link } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        title,
        message,
        type,
        link,
      },
    });

    // Invalidate cache for this user's notifications
    await cache.invalidatePattern(`notifications:${session.user.id}*`);
    await cache.del(`notifications:unread-count:${session.user.id}`);

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

