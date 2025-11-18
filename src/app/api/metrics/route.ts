import { NextResponse } from "next/server";
import { getMetrics } from "@/lib/monitoring";

/**
 * Prometheus metrics endpoint
 * Accessible at /api/metrics
 */
export async function GET() {
  try {
    const metrics = await getMetrics();
    return new NextResponse(metrics, {
      headers: {
        "Content-Type": "text/plain; version=0.0.4",
      },
    });
  } catch (error) {
    console.error("Error generating metrics:", error);
    return NextResponse.json(
      { error: "Failed to generate metrics" },
      { status: 500 }
    );
  }
}

