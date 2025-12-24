/**
 * Image Optimization Configuration Schema
 */

import { z } from "zod";

export const imageOptimizationConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type ImageOptimizationConfig = z.infer<typeof imageOptimizationConfigSchema>;
