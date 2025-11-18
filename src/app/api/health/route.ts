import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

/**
 * Health check endpoint
 * Returns system health status
 */
export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      redis: "unknown",
    },
    version: process.env.npm_package_version || "1.0.0",
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = "healthy";
  } catch (error) {
    health.services.database = "unhealthy";
    health.status = "degraded";
  }

  // Check Redis
  try {
    await redis.ping();
    health.services.redis = "healthy";
  } catch (error) {
    health.services.redis = "unhealthy";
    health.status = "degraded";
  }

  // If any critical service is down, mark as unhealthy
  if (
    health.services.database === "unhealthy" ||
    health.services.redis === "unhealthy"
  ) {
    health.status = "unhealthy";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

