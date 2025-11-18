/**
 * CSRF protection utilities
 * Generates and validates CSRF tokens
 */

import crypto from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || "csrf-secret";

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create CSRF token with signature
 */
export function createCsrfToken(): string {
  const token = generateCsrfToken();
  const signature = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(token)
    .digest("hex");
  return `${token}.${signature}`;
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token: string): boolean {
  try {
    const [tokenPart, signature] = token.split(".");
    if (!tokenPart || !signature) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", CSRF_SECRET)
      .update(tokenPart)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Get CSRF token from request
 */
export function getCsrfTokenFromRequest(request: Request): string | null {
  // Try header first
  const headerToken = request.headers.get("X-CSRF-Token");
  if (headerToken) {
    return headerToken;
  }

  // Try form data
  // Note: This is a simplified version. In production, you'd parse the body
  return null;
}

/**
 * CSRF protection middleware helper
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  // Skip CSRF for GET, HEAD, OPTIONS
  const method = request.method;
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true;
  }

  const token = getCsrfTokenFromRequest(request);
  if (!token) {
    return false;
  }

  return verifyCsrfToken(token);
}

