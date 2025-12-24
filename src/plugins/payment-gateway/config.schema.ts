/**
 * Payment Gateway Configuration Schema
 */

import { z } from "zod";

export const paymentGatewayConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type PaymentGatewayConfig = z.infer<typeof paymentGatewayConfigSchema>;
