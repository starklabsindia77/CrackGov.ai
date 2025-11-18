import { createClient, RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

export const redis =
  globalForRedis.redis ??
  createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error("Redis connection failed after 10 retries");
          return new Error("Redis connection failed");
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// Connect to Redis
if (!redis.isOpen) {
  redis.connect().catch((err) => {
    console.error("Failed to connect to Redis:", err);
  });
}

redis.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redis.on("connect", () => {
  console.log("Redis Client Connected");
});

export default redis;

