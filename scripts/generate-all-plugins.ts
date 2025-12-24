#!/usr/bin/env tsx

/**
 * Batch Plugin Generator
 * Generates all plugin boilerplate at once
 */

import { execSync } from "child_process";

const plugins = [
    // Phase 1
    "mock-test",
    "doubt-chat",
    "flashcard",

    // Phase 2
    "leaderboard",
    "question-bank",
    "notifications",
    "study-streaks",

    // Phase 3
    "study-groups",
    "cms",
    "email-campaigns",
    "bookmarks-notes",

    // Phase 4
    "pyq-analysis",
    "exam-generator",
    "daily-tasks",
    "study-reminders",

    // Phase 5
    "payment-gateway",
    "file-storage",
    "analytics",
    "search",
    "i18n",
    "pdf-export",
    "image-optimization",
    "accessibility"
];

console.log(`🚀 Generating ${plugins.length} plugins...\n`);

for (const plugin of plugins) {
    try {
        console.log(`📦 Generating ${plugin}...`);
        execSync(`tsx scripts/generate-plugin.ts ${plugin}`, { stdio: "inherit" });
        console.log(`✅ ${plugin} generated\n`);
    } catch (error) {
        console.error(`❌ Failed to generate ${plugin}:`, error);
    }
}

console.log(`\n🎉 All plugins generated successfully!`);
console.log(`\nNext steps:`);
console.log(`1. Implement route handlers in each plugin`);
console.log(`2. Run: npx prisma generate && npx prisma db push`);
console.log(`3. Install plugins via admin API`);
console.log(`4. Enable plugins and test`);
