/**
 * NXTQR — Outbound Webhook Delivery Queue Job Contract
 * Dispatched to Cloudflare Queues for asynchronous delivery to customer endpoints.
 * Invariant: Signing secret is NEVER stored in Queue messages; retrieved from durable store by consumer.
 */

import { z } from "zod";

export const WebhookDeliveryJobV1Schema = z.object({
  schemaVersion: z.literal(1),
  jobId: z.string(),
  deliveryId: z.string(),
  endpointId: z.string(),
  webhookEventId: z.string(),
  organizationId: z.string(),
  eventType: z.string(),
  targetUrl: z.string().url(),
  attemptNumber: z.number().int().positive(),
  enqueuedAt: z.number(),
});
export type WebhookDeliveryJobV1 = z.infer<typeof WebhookDeliveryJobV1Schema>;
