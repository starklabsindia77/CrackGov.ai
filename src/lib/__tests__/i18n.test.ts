import { describe, it, expect } from "vitest";
import { t, formatDate, formatNumber, formatCurrency } from "../i18n";

describe("i18n", () => {
  describe("t", () => {
    it("should return translation for English", () => {
      expect(t("welcome", "en")).toBe("Welcome");
    });

    it("should return translation for Hindi", () => {
      expect(t("welcome", "hi")).toBe("स्वागत है");
    });

    it("should return key if translation not found", () => {
      expect(t("nonexistent_key", "en")).toBe("nonexistent_key");
    });
  });

  describe("formatDate", () => {
    it("should format date in English", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date, "en");
      expect(formatted).toContain("2024");
    });

    it("should format date in Hindi locale", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date, "hi");
      expect(formatted).toBeDefined();
    });
  });

  describe("formatNumber", () => {
    it("should format number", () => {
      expect(formatNumber(1234567, "en")).toBe("12,34,567");
    });

    it("should format number in different locale", () => {
      const formatted = formatNumber(1234567, "hi");
      expect(formatted).toBeDefined();
    });
  });

  describe("formatCurrency", () => {
    it("should format currency", () => {
      const formatted = formatCurrency(199, "en");
      expect(formatted).toContain("₹");
      expect(formatted).toContain("199");
    });
  });
});

