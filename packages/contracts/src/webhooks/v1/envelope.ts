/**
 * NXTQR — Customer Outbound Webhook Envelope Contract (V1)
 * Public customer contract delivered to customer endpoints.
 * Crucial Invariant: DO NOT send internal domain events directly; transform through projection.
 */

import { z } from "zod";

export const CustomerWebhookEnvelopeSchema = z.object({
  id: z.string().regex(/^evt_/, "Webhook event ID must start with evt_"),
  type: z.string(),
  version: z.literal("1"),
  createdAt: z.string().datetime({ message: "createdAt must be valid ISO 8601 UTC" }),
  data: z.record(z.string(), z.unknown()),
});
export type CustomerWebhookEnvelope<T = Record<string, unknown>> = Omit<
  z.infer<typeof CustomerWebhookEnvelopeSchema>,
  "data"
> & {
  data: T;
};

/**
 * Creates a public customer webhook envelope
 */
export function createCustomerWebhookEnvelope<T extends Record<string, unknown>>(params: {
  type: string;
  data: T;
  id?: string;
  createdAt?: string;
}): CustomerWebhookEnvelope<T> {
  return {
    id: params.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: params.type,
    version: "1",
    createdAt: params.createdAt || new Date().toISOString(),
    data: params.data,
  };
}
