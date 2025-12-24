/**
 * PYQ Analysis Configuration Schema
 */

import { z } from "zod";

export const pyqAnalysisConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type PyqAnalysisConfig = z.infer<typeof pyqAnalysisConfigSchema>;
