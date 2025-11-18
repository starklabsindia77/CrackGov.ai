#!/usr/bin/env tsx

/**
 * Start all BullMQ workers
 * Run with: tsx scripts/start-workers.ts
 * Or with PM2: pm2 start scripts/start-workers.ts --name workers
 */

import "../src/lib/workers";

console.log("🚀 All workers started successfully!");
console.log("Workers running:");
console.log("  - AI Processing Worker");
console.log("  - Email Worker");
console.log("  - Leaderboard Worker");
console.log("  - Notification Worker");

// Keep process alive
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

