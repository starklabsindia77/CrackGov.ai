/**
 * Question Bank Configuration Schema
 */

import { z } from "zod";

export const questionBankConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type QuestionBankConfig = z.infer<typeof questionBankConfigSchema>;
