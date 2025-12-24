/**
 * Mock Test Generator Configuration Schema
 */

import { z } from "zod";

export const mockTestConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type MockTestConfig = z.infer<typeof mockTestConfigSchema>;
