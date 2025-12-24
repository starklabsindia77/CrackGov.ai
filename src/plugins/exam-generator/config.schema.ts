/**
 * AI Exam Generator Configuration Schema
 */

import { z } from "zod";

export const examGeneratorConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type ExamGeneratorConfig = z.infer<typeof examGeneratorConfigSchema>;
