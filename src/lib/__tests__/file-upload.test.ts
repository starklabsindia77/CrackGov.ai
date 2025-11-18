import { describe, it, expect, vi } from "vitest";
import {
  validateFileUpload,
  validateImageUpload,
  validatePdfUpload,
  scanFile,
  FileValidators,
} from "../file-upload";

// Mock File class
class MockFile extends File {
  constructor(
    bits: BlobPart[],
    name: string,
    options?: FilePropertyBag
  ) {
    super(bits, name, options);
  }
}

describe("file-upload", () => {
  describe("validateFileUpload", () => {
    it("should validate image file", () => {
      const file = new MockFile(["test"], "image.jpg", {
        type: "image/jpeg",
      });
      const result = validateFileUpload(file, FileValidators.image);
      expect(result.valid).toBe(true);
      expect(result.sanitizedFileName).toBeDefined();
    });

    it("should reject invalid file type", () => {
      const file = new MockFile(["test"], "document.pdf", {
        type: "application/pdf",
      });
      const result = validateFileUpload(file, FileValidators.image);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file type");
    });

    it("should reject file that is too large", () => {
      const largeContent = new Array(6 * 1024 * 1024).fill("a");
      const file = new MockFile(largeContent, "large.jpg", {
        type: "image/jpeg",
      });
      const result = validateFileUpload(file, FileValidators.image);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("too large");
    });
  });

  describe("validateImageUpload", () => {
    it("should validate valid image", () => {
      const file = new MockFile(["test"], "image.png", {
        type: "image/png",
      });
      const result = validateImageUpload(file);
      expect(result.valid).toBe(true);
    });

    it("should reject non-image file", () => {
      const file = new MockFile(["test"], "document.pdf", {
        type: "application/pdf",
      });
      const result = validateImageUpload(file);
      expect(result.valid).toBe(false);
    });
  });

  describe("validatePdfUpload", () => {
    it("should validate PDF file", () => {
      const file = new MockFile(["test"], "document.pdf", {
        type: "application/pdf",
      });
      const result = validatePdfUpload(file);
      expect(result.valid).toBe(true);
    });

    it("should reject non-PDF file", () => {
      const file = new MockFile(["test"], "image.jpg", {
        type: "image/jpeg",
      });
      const result = validatePdfUpload(file);
      expect(result.valid).toBe(false);
    });
  });

  describe("scanFile", () => {
    it("should detect executable files", async () => {
      // PE executable signature
      const peSignature = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]);
      const file = new MockFile([peSignature], "malware.exe", {
        type: "application/x-msdownload",
      });
      const result = await scanFile(file);
      expect(result.safe).toBe(false);
      expect(result.reason).toContain("executable");
    });

    it("should detect script tags in HTML", async () => {
      const htmlContent = '<div>Hello<script>alert("xss")</script></div>';
      const file = new MockFile([htmlContent], "malicious.html", {
        type: "text/html",
      });
      const result = await scanFile(file);
      expect(result.safe).toBe(false);
      expect(result.reason).toContain("scripts");
    });

    it("should allow safe files", async () => {
      const safeContent = "This is a safe text file";
      const file = new MockFile([safeContent], "safe.txt", {
        type: "text/plain",
      });
      const result = await scanFile(file);
      expect(result.safe).toBe(true);
    });
  });
});

