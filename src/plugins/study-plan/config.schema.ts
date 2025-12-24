/**
 * Study Plan Configuration Schema
 * 
 * Defines the configuration schema for the Study Plan plugin using Zod.
 */

import { z } from "zod";

export const studyPlanConfigSchema = z.object({
    // Maximum number of study plans a user can create
    maxPlansPerUser: z.number().int().min(1).max(100).default(10),

    // AI provider to use (primary, secondary, tertiary)
    aiProvider: z.enum(["primary", "secondary", "tertiary"]).default("primary"),

    // Whether to cache generated plans
    cacheResults: z.boolean().default(true),

    // Cache TTL in seconds
    cacheTTL: z.number().int().min(60).max(86400).default(3600),

    // Default hours per day for study plans
    defaultHoursPerDay: z.number().int().min(1).max(24).default(4),

    // Enable notifications for study plan milestones
    enableNotifications: z.boolean().default(true),
});

export type StudyPlanConfig = z.infer<typeof studyPlanConfigSchema>;
