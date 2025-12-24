/**
 * Internationalization Configuration Schema
 */

import { z } from "zod";

export const i18nConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type I18nConfig = z.infer<typeof i18nConfigSchema>;
