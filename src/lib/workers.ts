import { Worker } from "bullmq";
import { queueConnection, AIJobData, EmailJobData, LeaderboardJobData, NotificationJobData } from "./queue";
import { callAI } from "./ai-orchestrator";
import { sendEmail } from "./email";
import { prisma } from "./prisma";
import { cache } from "./cache";

// AI Worker - Process AI requests asynchronously
export const aiWorker = new Worker(
  "ai-processing",
  async (job) => {
    const data = job.data as AIJobData;
    console.log(`Processing AI job ${job.id} for feature: ${data.featureCode}`);

    const result = await callAI({
      featureCode: data.featureCode,
      prompt: data.prompt,
      messages: data.messages,
      model: data.model,
      temperature: data.temperature,
      maxTokens: data.maxTokens,
      responseFormat: data.responseFormat,
    });

    if (!result.success) {
      throw new Error(result.error || "AI call failed");
    }

    return result;
  },
  {
    connection: queueConnection,
    concurrency: 10, // Process 10 AI requests concurrently
    limiter: {
      max: 50,
      duration: 60000, // 50 jobs per minute
    },
  }
);

aiWorker.on("completed", (job) => {
  console.log(`AI job ${job.id} completed`);
});

aiWorker.on("failed", (job, err) => {
  console.error(`AI job ${job?.id} failed:`, err);
});

// Email Worker
export const emailWorker = new Worker(
  "email",
  async (job) => {
    const data = job.data as EmailJobData;
    console.log(`Sending email to ${data.to}`);

    // Handle different email templates
    if (data.template === "test-result") {
      const { sendTestResultEmail } = await import("./email");
      await sendTestResultEmail(data.to, data.data);
    } else if (data.template === "welcome") {
      const { sendWelcomeEmail } = await import("./email");
      await sendWelcomeEmail(data.to, data.data.name);
    } else if (data.template === "password-reset") {
      const { sendPasswordResetEmail } = await import("./email");
      await sendPasswordResetEmail(data.to, data.data.token);
    } else if (data.template === "verification") {
      const { sendVerificationEmail } = await import("./email");
      await sendVerificationEmail(data.to, data.data.token);
    } else {
      // Generic email sending
      console.log(`Email (${data.template}):`, {
        to: data.to,
        subject: data.subject,
        data: data.data,
      });
    }

    return { success: true };
  },
  {
    connection: queueConnection,
    concurrency: 5, // Process 5 emails concurrently
    limiter: {
      max: 100,
      duration: 60000, // 100 emails per minute
    },
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err);
});

// Leaderboard Worker
export const leaderboardWorker = new Worker(
  "leaderboard",
  async (job) => {
    const data = job.data as LeaderboardJobData;
    console.log(`Updating leaderboard for user ${data.userId}`);

    // Import leaderboard update logic
    const { updateLeaderboard } = await import("./leaderboard-update");
    await updateLeaderboard(data.userId, data.testId, data.score, data.exam);

    // Invalidate leaderboard cache
    await cache.invalidatePattern("leaderboard:*");

    return { success: true };
  },
  {
    connection: queueConnection,
    concurrency: 20, // Process 20 leaderboard updates concurrently
    limiter: {
      max: 200,
      duration: 60000, // 200 updates per minute
    },
  }
);

leaderboardWorker.on("completed", (job) => {
  console.log(`Leaderboard job ${job.id} completed`);
});

leaderboardWorker.on("failed", (job, err) => {
  console.error(`Leaderboard job ${job?.id} failed:`, err);
});

// Notification Worker
export const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    const data = job.data as NotificationJobData;
    console.log(`Creating notification for user ${data.userId}`);

    await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || "info",
        link: data.link,
      },
    });

    // Invalidate notification cache
    await cache.invalidatePattern(`notifications:${data.userId}*`);

    return { success: true };
  },
  {
    connection: queueConnection,
    concurrency: 50, // Process 50 notifications concurrently
    limiter: {
      max: 500,
      duration: 60000, // 500 notifications per minute
    },
  }
);

notificationWorker.on("completed", (job) => {
  console.log(`Notification job ${job.id} completed`);
});

notificationWorker.on("failed", (job, err) => {
  console.error(`Notification job ${job?.id} failed:`, err);
});

