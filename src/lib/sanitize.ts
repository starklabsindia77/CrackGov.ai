/**
 * Input sanitization utilities
 * For server-side sanitization, use DOMPurify or similar
 */

/**
 * Sanitize HTML content (client-side)
 * Note: For server-side, use DOMPurify with jsdom
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  // In production, use DOMPurify library
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "") // Remove event handlers
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/data:text\/html/gi, ""); // Remove data URIs
}

/**
 * Sanitize user input for database queries
 * Prisma already handles parameterization, but this adds extra safety
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/['";\\]/g, ""); // Remove SQL injection characters
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace invalid characters
    .replace(/\.\./g, "") // Remove path traversal attempts
    .substring(0, 255); // Limit length
}

/**
 * Validate file type
 */
export function isValidFileType(
  fileName: string,
  allowedTypes: string[]
): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(fileSize: number, maxSize: number): boolean {
  return fileSize > 0 && fileSize <= maxSize;
}

/**
 * Common file type validators
 */
export const FileValidators = {
  image: {
    types: ["jpg", "jpeg", "png", "gif", "webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  pdf: {
    types: ["pdf"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  document: {
    types: ["pdf", "doc", "docx"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
};

