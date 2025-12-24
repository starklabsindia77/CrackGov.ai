/**
 * Email Campaigns Configuration Schema
 */

import { z } from "zod";

export const emailCampaignsConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type EmailCampaignsConfig = z.infer<typeof emailCampaignsConfigSchema>;
