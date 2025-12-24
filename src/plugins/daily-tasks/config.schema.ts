/**
 * Daily Tasks & Goals Configuration Schema
 */

import { z } from "zod";

export const dailyTasksConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type DailyTasksConfig = z.infer<typeof dailyTasksConfigSchema>;
