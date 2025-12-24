/**
 * Bookmarks & Notes Configuration Schema
 */

import { z } from "zod";

export const bookmarksNotesConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type BookmarksNotesConfig = z.infer<typeof bookmarksNotesConfigSchema>;
