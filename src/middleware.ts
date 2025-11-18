import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiRateLimiter, authRateLimiter } from "@/lib/rate-limit-redis";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to API routes
  if (pathname.startsWith("/api/")) {
    // Stricter rate limiting for auth routes
    if (pathname.startsWith("/api/auth/")) {
      const rateLimitResponse = await authRateLimiter(request as any);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    } else {
      // Standard rate limiting for other API routes
      const rateLimitResponse = await apiRateLimiter(request as any);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

