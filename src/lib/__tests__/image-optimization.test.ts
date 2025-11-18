import { describe, it, expect } from "vitest";
import { getResponsiveSizes, getOptimizedImageUrl } from "../image-optimization";

describe("image-optimization", () => {
  describe("getResponsiveSizes", () => {
    it("should return default responsive sizes", () => {
      const sizes = getResponsiveSizes();
      expect(sizes).toContain("768px");
      expect(sizes).toContain("1200px");
    });

    it("should use custom breakpoints", () => {
      const sizes = getResponsiveSizes({
        mobile: 100,
        tablet: 75,
        desktop: 50,
      });
      expect(sizes).toContain("100vw");
      expect(sizes).toContain("75vw");
      expect(sizes).toContain("50vw");
    });
  });

  describe("getOptimizedImageUrl", () => {
    it("should add query parameters for local images", () => {
      const url = getOptimizedImageUrl("/image.jpg", {
        width: 800,
        quality: 90,
        format: "webp",
      });
      expect(url).toContain("w=800");
      expect(url).toContain("q=90");
      expect(url).toContain("f=webp");
    });

    it("should return original URL for external images", () => {
      const url = "https://example.com/image.jpg";
      const optimized = getOptimizedImageUrl(url);
      expect(optimized).toBe(url);
    });
  });
});

