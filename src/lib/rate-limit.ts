import { LRUCache } from "lru-cache";
import { NextRequest, NextResponse } from "next/server";

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // 1 minute default
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage > limit;

        if (isRateLimited) {
          reject(new Error("Rate limit exceeded"));
        } else {
          resolve();
        }
      }),
  };
}

// Get identifier from request (IP address or user ID)
function getIdentifier(request: NextRequest): string {
  // Try to get IP from headers (works with most proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
  
  return ip;
}

// Rate limit middleware factory
export function createRateLimiter(limit: number, windowMs: number = 60000) {
  const limiter = rateLimit({
    interval: windowMs,
    uniqueTokenPerInterval: 1000,
  });

  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      const identifier = getIdentifier(request);
      await limiter.check(limit, identifier);
      return null; // No rate limit exceeded
    } catch {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  };
}

// Pre-configured rate limiters
export const apiRateLimiter = createRateLimiter(10, 60000); // 10 requests per minute
export const authRateLimiter = createRateLimiter(5, 60000); // 5 requests per minute (stricter for auth)
export const aiRateLimiter = createRateLimiter(20, 60000); // 20 requests per minute for AI endpoints

