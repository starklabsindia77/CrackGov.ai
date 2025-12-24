/**
 * Flashcard System Configuration Schema
 */

import { z } from "zod";

export const flashcardConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type FlashcardConfig = z.infer<typeof flashcardConfigSchema>;
