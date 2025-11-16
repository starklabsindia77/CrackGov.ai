import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../encryption";

describe("Encryption", () => {
  it("should encrypt and decrypt text correctly", () => {
    const originalText = "test-api-key-12345";
    const encrypted = encrypt(originalText);
    const decrypted = decrypt(encrypted);

    expect(encrypted).not.toBe(originalText);
    expect(decrypted).toBe(originalText);
  });

  it("should produce different encrypted values for same input", () => {
    const text = "same-text";
    const encrypted1 = encrypt(text);
    const encrypted2 = encrypt(text);

    // Should be different due to random IV
    expect(encrypted1).not.toBe(encrypted2);
    
    // But both should decrypt to same value
    expect(decrypt(encrypted1)).toBe(text);
    expect(decrypt(encrypted2)).toBe(text);
  });

  it("should handle empty string", () => {
    const text = "";
    const encrypted = encrypt(text);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(text);
  });
});

