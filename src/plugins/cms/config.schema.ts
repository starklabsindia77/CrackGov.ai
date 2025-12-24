/**
 * Content Management System Configuration Schema
 */

import { z } from "zod";

export const cmsConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type CmsConfig = z.infer<typeof cmsConfigSchema>;
