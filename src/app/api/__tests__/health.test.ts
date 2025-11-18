import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../health/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: {
    ping: vi.fn(),
  },
}));

describe("/api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return healthy status when all services are up", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);
    vi.mocked(redis.ping).mockResolvedValue("PONG");

    const request = new NextRequest("http://localhost:3000/api/health");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.services.database).toBe("healthy");
    expect(data.services.redis).toBe("healthy");
  });

  it("should return degraded status when database is down", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("Connection failed"));
    vi.mocked(redis.ping).mockResolvedValue("PONG");

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.services.database).toBe("unhealthy");
  });

  it("should return degraded status when redis is down", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);
    vi.mocked(redis.ping).mockRejectedValue(new Error("Connection failed"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.services.redis).toBe("unhealthy");
  });
});

