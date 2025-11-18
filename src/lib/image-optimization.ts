/**
 * Image optimization utilities
 * Provides optimized image loading and lazy loading
 */

import Image from "next/image";
import { ComponentProps } from "react";

/**
 * Optimized Image component props
 */
export interface OptimizedImageProps extends Omit<ComponentProps<typeof Image>, "src"> {
  src: string | StaticImageData;
  alt: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  quality?: number;
  sizes?: string;
}

/**
 * Optimized Image component with defaults
 */
export function OptimizedImage({
  src,
  alt,
  priority = false,
  loading = "lazy",
  quality = 85,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      priority={priority}
      loading={loading}
      quality={quality}
      sizes={sizes}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
      {...props}
    />
  );
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "jpg" | "png";
  }
): string {
  // If using Next.js Image Optimization API
  if (url.startsWith("/") || url.includes(process.env.NEXTAUTH_URL || "")) {
    const params = new URLSearchParams();
    if (options?.width) params.set("w", options.width.toString());
    if (options?.height) params.set("h", options.height.toString());
    if (options?.quality) params.set("q", options.quality.toString());
    if (options?.format) params.set("f", options.format);
    
    return `${url}?${params.toString()}`;
  }

  // For external images, use a CDN or image optimization service
  // Example: Cloudinary, Imgix, etc.
  return url;
}

/**
 * Generate responsive image sizes
 */
export function getResponsiveSizes(breakpoints?: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}): string {
  const { mobile = 100, tablet = 50, desktop = 33 } = breakpoints || {};
  return `(max-width: 768px) ${mobile}vw, (max-width: 1200px) ${tablet}vw, ${desktop}vw`;
}

/**
 * Lazy load images with Intersection Observer
 * Note: This is a client-side hook, use in client components only
 * For server components, use Next.js Image component with loading="lazy"
 */

// Re-export Next.js Image for convenience
export { Image } from "next/image";
export type { StaticImageData } from "next/image";

