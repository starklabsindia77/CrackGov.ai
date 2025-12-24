/**
 * Notification System Configuration Schema
 */

import { z } from "zod";

export const notificationsConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type NotificationsConfig = z.infer<typeof notificationsConfigSchema>;
