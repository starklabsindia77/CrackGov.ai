import { Queue, Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";

// Redis connection for BullMQ
const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Job queues
export const aiQueue = new Queue("ai-processing", { connection });
export const emailQueue = new Queue("email", { connection });
export const leaderboardQueue = new Queue("leaderboard", { connection });
export const notificationQueue = new Queue("notifications", { connection });

// Queue events for monitoring
export const aiQueueEvents = new QueueEvents("ai-processing", { connection });
export const emailQueueEvents = new QueueEvents("email", { connection });
export const leaderboardQueueEvents = new QueueEvents("leaderboard", { connection });

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
  queue: Queue,
  jobName: string,
  data: T,
  options?: {
    attempts?: number;
    backoff?: { type: "exponential" | "fixed"; delay: number };
    priority?: number;
    delay?: number;
  }
) {
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

