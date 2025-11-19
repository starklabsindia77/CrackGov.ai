import { createClient, RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

// Check if Redis should be disabled
// In production, Redis is always enabled unless explicitly disabled
// In development, Redis is disabled only if REDIS_URL is not set
const isRedisDisabled = process.env.DISABLE_REDIS === "true" || 
  (process.env.NODE_ENV === "development" && !process.env.REDIS_URL);

const isProduction = process.env.NODE_ENV === "production";

let redisClient: RedisClientType | null = null;

if (!isRedisDisabled) {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  
  redisClient =
    globalForRedis.redis ??
    createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("Redis connection failed after 10 retries");
            // In production, throw error to fail fast
            if (isProduction) {
              throw new Error("Redis connection failed after 10 retries");
            }
            return new Error("Redis connection failed");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

  if (!isProduction) {
    globalForRedis.redis = redisClient;
  }

  // Connect to Redis
  if (!redisClient.isOpen) {
    redisClient.connect().catch((err) => {
      console.error("Failed to connect to Redis:", err);
      if (isProduction) {
        // In production, log error but don't crash - let the app continue
        // The app will use fallbacks if Redis is unavailable
        console.error("⚠️  Redis connection failed in production. Some features may be degraded.");
      } else {
        console.warn("⚠️  Redis connection failed. Running without Redis (dev mode).");
      }
    });
  }

  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
    if (isProduction) {
      // In production, log but don't crash
      console.error("⚠️  Redis error in production. Some features may be degraded.");
    }
  });

  redisClient.on("connect", () => {
    if (isProduction) {
      console.log("✅ Redis Client Connected (Production)");
    } else {
      console.log("✅ Redis Client Connected");
    }
  });
} else {
  if (isProduction) {
    console.warn("⚠️  Redis is disabled in production. This is not recommended for production use.");
  } else {
    console.log("⚠️  Redis is disabled (dev mode). Using in-memory fallbacks.");
  }
}

// Export redis (can be null in dev mode)
export const redis: RedisClientType | null = redisClient;

// Default export
export default redisClient;

