/**
 * Leaderboard & Rankings Configuration Schema
 */

import { z } from "zod";

export const leaderboardConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type LeaderboardConfig = z.infer<typeof leaderboardConfigSchema>;
