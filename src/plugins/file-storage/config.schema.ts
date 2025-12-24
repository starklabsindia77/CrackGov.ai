/**
 * File Storage Configuration Schema
 */

import { z } from "zod";

export const fileStorageConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type FileStorageConfig = z.infer<typeof fileStorageConfigSchema>;
