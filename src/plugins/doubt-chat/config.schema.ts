/**
 * AI Doubt Resolution Configuration Schema
 */

import { z } from "zod";

export const doubtChatConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type DoubtChatConfig = z.infer<typeof doubtChatConfigSchema>;
