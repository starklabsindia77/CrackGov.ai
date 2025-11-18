import { describe, it, expect } from "vitest";
import {
  createCsrfToken,
  verifyCsrfToken,
  generateCsrfToken,
} from "../csrf";

describe("CSRF", () => {
  describe("generateCsrfToken", () => {
    it("should generate a token", () => {
      const token = generateCsrfToken();
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate unique tokens", () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("createCsrfToken", () => {
    it("should create a signed token", () => {
      const token = createCsrfToken();
      expect(token).toBeDefined();
      expect(token).toContain(".");
    });

    it("should create unique tokens", () => {
      const token1 = createCsrfToken();
      const token2 = createCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyCsrfToken", () => {
    it("should verify valid token", () => {
      const token = createCsrfToken();
      expect(verifyCsrfToken(token)).toBe(true);
    });

    it("should reject invalid token", () => {
      expect(verifyCsrfToken("invalid.token")).toBe(false);
      expect(verifyCsrfToken("invalid")).toBe(false);
      expect(verifyCsrfToken("")).toBe(false);
    });

    it("should reject tampered token", () => {
      const token = createCsrfToken();
      const [tokenPart, signature] = token.split(".");
      const tamperedToken = `${tokenPart}.tampered${signature}`;
      expect(verifyCsrfToken(tamperedToken)).toBe(false);
    });
  });
});

