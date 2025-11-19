import redis from "./redis";
import * as crypto from "crypto";

// In-memory cache fallback for dev mode
const memoryCache = new Map<string, { value: any; expires: number }>();

/**
 * Cache utility with TTL support
 */
export class Cache {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!redis) {
        // Use in-memory cache
        const cached = memoryCache.get(key);
        if (cached && cached.expires > Date.now()) {
          return cached.value as T;
        }
        if (cached) {
          memoryCache.delete(key);
        }
        return null;
      }

      if (!redis.isOpen) {
        await redis.connect();
      }
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      // Fallback to memory cache
      const cached = memoryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.value as T;
      }
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      if (!redis) {
        // Use in-memory cache
        memoryCache.set(key, {
          value,
          expires: Date.now() + ttl * 1000,
        });
        return;
      }

      if (!redis.isOpen) {
        await redis.connect();
      }
      await redis.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      // Fallback to memory cache
      memoryCache.set(key, {
        value,
        expires: Date.now() + ttl * 1000,
      });
    }
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<void> {
    try {
      if (!redis) {
        memoryCache.delete(key);
        return;
      }

      if (!redis.isOpen) {
        await redis.connect();
      }
      await redis.del(key);
    } catch (error) {
      console.error(`Cache del error for key ${key}:`, error);
      memoryCache.delete(key);
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (!redis) {
        // Simple pattern matching for memory cache
        const regex = new RegExp(pattern.replace("*", ".*"));
        for (const key of memoryCache.keys()) {
          if (regex.test(key)) {
            memoryCache.delete(key);
          }
        }
        return;
      }

      if (!redis.isOpen) {
        await redis.connect();
      }
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error(`Cache invalidatePattern error for pattern ${pattern}:`, error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!redis) {
        const cached = memoryCache.get(key);
        return cached ? cached.expires > Date.now() : false;
      }

      if (!redis.isOpen) {
        await redis.connect();
      }
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute fetcher function
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * Generate cache key from object
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join("|");
    const hash = crypto
      .createHash("md5")
      .update(sortedParams)
      .digest("hex")
      .substring(0, 8);
    return `${prefix}:${hash}`;
  }
}

export const cache = new Cache();

/**
 * Cache decorator for API routes
 */
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  return cache.getOrSet(key, fetcher, ttl);
}

/**
 * Predefined cache keys
 */
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  questionBank: (params: string) => `question-bank:${params}`,
  leaderboard: (period: string, exam: string | null) =>
    `leaderboard:${period}:${exam || "all"}`,
  notifications: (userId: string) => `notifications:${userId}`,
  aiResponse: (hash: string) => `ai:response:${hash}`,
  testAttempt: (attemptId: string) => `test-attempt:${attemptId}`,
  studyPlan: (planId: string) => `study-plan:${planId}`,
};

