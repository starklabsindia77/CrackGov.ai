import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../../register/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(() => Promise.resolve("hashed-password")),
  },
}));

// Mock rate limiter
vi.mock("@/lib/rate-limit", () => ({
  authRateLimiter: vi.fn(() => Promise.resolve(null)),
}));

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register a new user successfully", async () => {
    const mockFindUnique = vi.mocked(prisma.user.findUnique);
    const mockCreate = vi.mocked(prisma.user.create);

    mockFindUnique.mockResolvedValue(null); // User doesn't exist
    mockCreate.mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      passwordHash: "hashed-password",
      role: "user",
      subscriptionStatus: "free",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("User created successfully");
    expect(mockCreate).toHaveBeenCalled();
  });

  it("should reject duplicate email", async () => {
    const mockFindUnique = vi.mocked(prisma.user.findUnique);

    mockFindUnique.mockResolvedValue({
      id: "existing-user",
      email: "test@example.com",
    } as any);

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("User already exists");
  });

  it("should validate input", async () => {
    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "",
        email: "invalid-email",
        password: "123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
  });
});

