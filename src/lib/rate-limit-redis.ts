import redis from "./redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Redis-based distributed rate limiting using sliding window
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }

    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Use Redis sorted set for sliding window
    const pipeline = redis.multi();
    
    // Remove expired entries
    pipeline.zRemRangeByScore(key, 0, windowStart);
    
    // Count current entries
    pipeline.zCard(key);
    
    // Add current request
    pipeline.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
    
    // Set expiration
    pipeline.expire(key, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();
    
    if (!results) {
      // Fallback: allow request if Redis fails
      return {
        allowed: true,
        remaining: limit - 1,
        reset: now + windowMs,
      };
    }

    const count = (results[1]?.[1] as number) || 0;
    const allowed = count < limit;
    const remaining = Math.max(0, limit - count - 1);
    const reset = now + windowMs;

    return {
      allowed,
      remaining,
      reset,
      retryAfter: allowed ? undefined : Math.ceil((reset - now) / 1000),
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open - allow request if Redis fails
    return {
      allowed: true,
      remaining: limit - 1,
      reset: Date.now() + windowMs,
    };
  }
}

/**
 * Rate limit middleware factory for Next.js API routes
 */
export function createRateLimiter(limit: number, windowMs: number = 60000) {
  return async (request: Request): Promise<Response | null> => {
    try {
      // Get identifier (IP address or user ID)
      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded
        ? forwarded.split(",")[0].trim()
        : request.headers.get("x-real-ip") || "unknown";

      // Try to get user ID from session if available
      let identifier = ip;
      try {
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import(
          "@/app/api/auth/[...nextauth]/route"
        );
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
          identifier = `user:${session.user.id}`;
        }
      } catch {
        // If session check fails, use IP
      }

      const result = await rateLimit(identifier, limit, windowMs);

      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: "Too many requests. Please try again later.",
            retryAfter: result.retryAfter,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": result.retryAfter?.toString() || "60",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.reset.toString(),
            },
          }
        );
      }

      // Add rate limit headers to response
      return null; // Continue with request
    } catch (error) {
      console.error("Rate limiter error:", error);
      return null; // Fail open
    }
  };
}

// Pre-configured rate limiters
export const apiRateLimiter = createRateLimiter(10, 60000); // 10 requests per minute
export const authRateLimiter = createRateLimiter(5, 60000); // 5 requests per minute (stricter for auth)
export const aiRateLimiter = createRateLimiter(20, 60000); // 20 requests per minute for AI endpoints
export const aiRateLimiterStrict = createRateLimiter(10, 60000); // 10 requests per minute for expensive AI calls

