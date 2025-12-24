/**
 * Full-Text Search Configuration Schema
 */

import { z } from "zod";

export const searchConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type SearchConfig = z.infer<typeof searchConfigSchema>;
