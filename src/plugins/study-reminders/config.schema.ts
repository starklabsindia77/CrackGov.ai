/**
 * Study Reminders Configuration Schema
 */

import { z } from "zod";

export const studyRemindersConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type StudyRemindersConfig = z.infer<typeof studyRemindersConfigSchema>;
