/**
 * Study Streaks Configuration Schema
 */

import { z } from "zod";

export const studyStreaksConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type StudyStreaksConfig = z.infer<typeof studyStreaksConfigSchema>;
