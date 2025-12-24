/**
 * Accessibility Features Configuration Schema
 */

import { z } from "zod";

export const accessibilityConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type AccessibilityConfig = z.infer<typeof accessibilityConfigSchema>;
