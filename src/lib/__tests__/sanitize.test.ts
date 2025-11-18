import { describe, it, expect } from "vitest";
import {
  sanitizeHtml,
  sanitizeInput,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeFileName,
  isValidFileType,
  isValidFileSize,
  FileValidators,
} from "../sanitize";

describe("sanitize", () => {
  describe("sanitizeHtml", () => {
    it("should remove script tags", () => {
      const input = '<div>Hello</div><script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain("<script");
      expect(result).toContain("Hello");
    });

    it("should remove event handlers", () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain("onclick");
    });

    it("should remove javascript: protocol", () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain("javascript:");
    });
  });

  describe("sanitizeInput", () => {
    it("should trim input", () => {
      expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("should remove angle brackets", () => {
      expect(sanitizeInput("hello<world>")).toBe("helloworld");
    });

    it("should remove SQL injection characters", () => {
      expect(sanitizeInput("hello'; DROP TABLE users;--")).toBe("hello DROP TABLE users");
    });
  });

  describe("sanitizeEmail", () => {
    it("should validate and sanitize valid email", () => {
      expect(sanitizeEmail("test@example.com")).toBe("test@example.com");
    });

    it("should return null for invalid email", () => {
      expect(sanitizeEmail("invalid-email")).toBeNull();
      expect(sanitizeEmail("test@")).toBeNull();
      expect(sanitizeEmail("@example.com")).toBeNull();
    });

    it("should lowercase email", () => {
      expect(sanitizeEmail("TEST@EXAMPLE.COM")).toBe("test@example.com");
    });
  });

  describe("sanitizeUrl", () => {
    it("should validate http URLs", () => {
      expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
    });

    it("should validate https URLs", () => {
      expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
    });

    it("should reject javascript: URLs", () => {
      expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
    });

    it("should reject invalid URLs", () => {
      expect(sanitizeUrl("not-a-url")).toBeNull();
    });
  });

  describe("sanitizeFileName", () => {
    it("should replace invalid characters", () => {
      expect(sanitizeFileName("file name.txt")).toBe("file_name.txt");
    });

    it("should remove path traversal attempts", () => {
      expect(sanitizeFileName("../../../etc/passwd")).toBe("____etc_passwd");
    });

    it("should limit length", () => {
      const longName = "a".repeat(300) + ".txt";
      expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(255);
    });
  });

  describe("isValidFileType", () => {
    it("should validate image types", () => {
      expect(isValidFileType("image.jpg", FileValidators.image.types)).toBe(true);
      expect(isValidFileType("image.png", FileValidators.image.types)).toBe(true);
      expect(isValidFileType("document.pdf", FileValidators.image.types)).toBe(false);
    });

    it("should validate PDF types", () => {
      expect(isValidFileType("document.pdf", FileValidators.pdf.types)).toBe(true);
      expect(isValidFileType("image.jpg", FileValidators.pdf.types)).toBe(false);
    });
  });

  describe("isValidFileSize", () => {
    it("should validate file size", () => {
      expect(isValidFileSize(1024, 2048)).toBe(true);
      expect(isValidFileSize(2048, 1024)).toBe(false);
      expect(isValidFileSize(0, 1024)).toBe(false);
    });
  });
});

