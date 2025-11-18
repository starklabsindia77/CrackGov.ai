import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { trackError as trackErrorMetric } from "@/lib/monitoring";

/**
 * Analytics tracking endpoint
 * Stores user events for analytics
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const { event, properties, timestamp } = body;

    // Store analytics event (you can create an AnalyticsEvent model if needed)
    // For now, we'll just log it and track metrics
    if (session?.user?.id) {
      // Track in monitoring
      trackErrorMetric({
        name: event,
        message: JSON.stringify(properties),
      } as any, "low");

      // In production, store in database or send to analytics service
      // await prisma.analyticsEvent.create({
      //   data: {
      //     userId: session.user.id,
      //     event,
      //     properties,
      //     timestamp: timestamp ? new Date(timestamp) : new Date(),
      //   },
      // });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}

