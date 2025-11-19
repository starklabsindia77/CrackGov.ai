import { Queue, Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";

// Check if Redis is disabled
// In production, Redis is always enabled unless explicitly disabled
// In development, Redis is disabled only if REDIS_URL is not set
const isRedisDisabled = process.env.DISABLE_REDIS === "true" || 
  (process.env.NODE_ENV === "development" && !process.env.REDIS_URL);

const isProduction = process.env.NODE_ENV === "production";

// Redis connection for BullMQ
let connection: IORedis | null = null;
if (!isRedisDisabled) {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  
  connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 10) {
        if (isProduction) {
          console.error("⚠️  Queue Redis connection failed after 10 retries in production");
        }
        return null; // Stop retrying
      }
      return Math.min(times * 100, 3000);
    },
  });
  
  connection.on("error", (err) => {
    console.error("Queue Redis connection error:", err);
    if (isProduction) {
      console.error("⚠️  Queue Redis error in production. Background jobs may not work.");
    }
  });

  connection.on("connect", () => {
    if (isProduction) {
      console.log("✅ Queue Redis Connected (Production)");
    } else {
      console.log("✅ Queue Redis Connected");
    }
  });
} else {
  if (isProduction) {
    console.warn("⚠️  Queue Redis is disabled in production. Background jobs will not work.");
  }
}

// Create queues only if Redis is available
export const aiQueue = connection ? new Queue("ai-processing", { connection }) : null;
export const emailQueue = connection ? new Queue("email", { connection }) : null;
export const leaderboardQueue = connection ? new Queue("leaderboard", { connection }) : null;
export const notificationQueue = connection ? new Queue("notifications", { connection }) : null;

// Queue events for monitoring
export const aiQueueEvents = connection ? new QueueEvents("ai-processing", { connection }) : null;
export const emailQueueEvents = connection ? new QueueEvents("email", { connection }) : null;
export const leaderboardQueueEvents = connection ? new QueueEvents("leaderboard", { connection }) : null;

// Job types
export interface AIJobData {
  featureCode: string;
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" } | { type: "text" };
  userId?: string;
  testId?: string;
}

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface LeaderboardJobData {
  userId: string;
  testId: string;
  score: number;
  exam?: string;
}

export interface NotificationJobData {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}

// Helper function to add jobs with retry
export async function addJob<T>(
  queue: Queue | null,
  jobName: string,
  data: T,
  options?: {
    attempts?: number;
    backoff?: { type: "exponential" | "fixed"; delay: number };
    priority?: number;
    delay?: number;
  }
) {
  if (!queue) {
    console.warn(`⚠️  Queue not available (Redis disabled). Job ${jobName} would be queued.`);
    return null;
  }
  return await queue.add(jobName, data, {
    attempts: options?.attempts || 3,
    backoff: options?.backoff || { type: "exponential", delay: 2000 },
    priority: options?.priority,
    delay: options?.delay,
  });
}

// Enqueue AI request
export async function enqueueAIRequest(data: AIJobData) {
  return await addJob(aiQueue, "process-ai", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    priority: 1,
  });
}

// Enqueue email
export async function enqueueEmail(data: EmailJobData) {
  return await addJob(emailQueue, "send-email", data, {
    attempts: 3,
    backoff: { type: "fixed", delay: 5000 },
  });
}

// Enqueue leaderboard update
export async function enqueueLeaderboardUpdate(data: LeaderboardJobData) {
  return await addJob(leaderboardQueue, "update-leaderboard", data, {
    attempts: 2,
    backoff: { type: "fixed", delay: 1000 },
    priority: 5, // Lower priority, can be delayed
  });
}

// Enqueue notification
export async function enqueueNotification(data: NotificationJobData) {
  return await addJob(notificationQueue, "send-notification", data, {
    attempts: 2,
    backoff: { type: "fixed", delay: 1000 },
  });
}

export { connection as queueConnection };

