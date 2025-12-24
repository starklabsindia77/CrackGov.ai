/**
 * Study Groups Configuration Schema
 */

import { z } from "zod";

export const studyGroupsConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type StudyGroupsConfig = z.infer<typeof studyGroupsConfigSchema>;
