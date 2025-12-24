/**
 * PDF Export Configuration Schema
 */

import { z } from "zod";

export const pdfExportConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type PdfExportConfig = z.infer<typeof pdfExportConfigSchema>;
