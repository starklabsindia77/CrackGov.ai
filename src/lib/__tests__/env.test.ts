import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("env validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should validate required environment variables", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test";
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.NEXTAUTH_SECRET = "test-secret";
    process.env.ENCRYPTION_KEY = Buffer.from("a".repeat(32)).toString("base64");

    // Should not throw
    expect(() => {
      require("../env");
    }).not.toThrow();
  });

  it("should throw on missing required variables", () => {
    delete process.env.DATABASE_URL;

    expect(() => {
      require("../env");
    }).toThrow();
  });

  it("should validate encryption key format", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test";
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.NEXTAUTH_SECRET = "test-secret";
    process.env.ENCRYPTION_KEY = "invalid-key";

    expect(() => {
      require("../env");
    }).toThrow("32-byte");
  });
});

