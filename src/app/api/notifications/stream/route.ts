import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prismaRead } from "@/lib/prisma";
import { cache } from "@/lib/cache";

/**
 * Server-Sent Events (SSE) endpoint for real-time notifications
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      controller.enqueue(encoder.encode(": connected\n\n"));

      // Send initial notifications
      try {
        const notifications = await prismaRead.notification.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
        });

        const unreadCount = await prismaRead.notification.count({
          where: { userId: session.user.id, read: false },
        });

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "initial", notifications, unreadCount })}\n\n`
          )
        );
      } catch (error) {
        console.error("Error fetching initial notifications:", error);
      }

      let lastCheck = Date.now();
      const checkInterval = 5000; // Check every 5 seconds
      let isActive = true;

      // Poll for new notifications
      const interval = setInterval(async () => {
        if (!isActive) {
          clearInterval(interval);
          return;
        }

        try {
          // Check for new notifications created after last check
          const newNotifications = await prismaRead.notification.findMany({
            where: {
              userId: session.user.id,
              createdAt: {
                gt: new Date(lastCheck),
              },
            },
            orderBy: { createdAt: "desc" },
          });

          if (newNotifications.length > 0) {
            const unreadCount = await prismaRead.notification.count({
              where: { userId: session.user.id, read: false },
            });

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "new",
                  notifications: newNotifications,
                  unreadCount,
                })}\n\n`
              )
            );
          }

          // Send heartbeat every 30 seconds
          if (Date.now() - lastCheck > 30000) {
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
          }

          lastCheck = Date.now();
        } catch (error) {
          console.error("Error checking for new notifications:", error);
        }
      }, checkInterval);

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        isActive = false;
        clearInterval(interval);
        controller.close();
      });

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (!isActive) {
          clearInterval(pingInterval);
          return;
        }
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch (error) {
          clearInterval(pingInterval);
          clearInterval(interval);
          controller.close();
        }
      }, 30000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

