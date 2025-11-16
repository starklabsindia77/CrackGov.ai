import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit } from "../rate-limit";

describe("Rate Limiter", () => {
  let limiter: ReturnType<typeof rateLimit>;

  beforeEach(() => {
    limiter = rateLimit({
      interval: 1000, // 1 second for testing
      uniqueTokenPerInterval: 100,
    });
  });

  it("should allow requests within limit", async () => {
    const token = "test-token";
    const limit = 5;

    // Make 5 requests (within limit)
    for (let i = 0; i < limit; i++) {
      await expect(limiter.check(limit, token)).resolves.not.toThrow();
    }
  });

  it("should reject requests exceeding limit", async () => {
    const token = "test-token-2";
    const limit = 3;

    // Make requests within limit
    await expect(limiter.check(limit, token)).resolves.not.toThrow();
    await expect(limiter.check(limit, token)).resolves.not.toThrow();
    await expect(limiter.check(limit, token)).resolves.not.toThrow();

    // This should fail
    await expect(limiter.check(limit, token)).rejects.toThrow();
  });

  it("should track different tokens separately", async () => {
    const limit = 2;

    // Token 1 uses its limit
    await expect(limiter.check(limit, "token1")).resolves.not.toThrow();
    await expect(limiter.check(limit, "token1")).resolves.not.toThrow();
    await expect(limiter.check(limit, "token1")).rejects.toThrow();

    // Token 2 should still have its limit
    await expect(limiter.check(limit, "token2")).resolves.not.toThrow();
    await expect(limiter.check(limit, "token2")).resolves.not.toThrow();
  });
});

