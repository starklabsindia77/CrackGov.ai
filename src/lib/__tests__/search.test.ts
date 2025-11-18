import { describe, it, expect, vi } from "vitest";
import { highlightSearchTerms } from "../search";

describe("search", () => {
  describe("highlightSearchTerms", () => {
    it("should highlight search terms", () => {
      const text = "This is a test string";
      const query = "test";
      const result = highlightSearchTerms(text, query);
      expect(result).toContain("<mark>test</mark>");
    });

    it("should be case insensitive", () => {
      const text = "This is a Test string";
      const query = "test";
      const result = highlightSearchTerms(text, query);
      expect(result).toContain("<mark>Test</mark>");
    });

    it("should highlight multiple occurrences", () => {
      const text = "test test test";
      const query = "test";
      const result = highlightSearchTerms(text, query);
      const matches = result.match(/<mark>test<\/mark>/gi);
      expect(matches?.length).toBe(3);
    });
  });
});

