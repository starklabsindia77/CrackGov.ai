/**
 * Analytics & Tracking Configuration Schema
 */

import { z } from "zod";

export const analyticsConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type AnalyticsConfig = z.infer<typeof analyticsConfigSchema>;
