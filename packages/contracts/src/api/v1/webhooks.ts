/**
 * NXTQR — HTTP API V1 Outbound Webhook Management Contracts
 * Secure registration, SSRF defense, and one-time signing secret disclosure.
 */

import { z } from "zod";

export const ALLOWED_WEBHOOK_EVENT_TYPES = [
  "qr.created",
  "qr.published",
  "qr.link.unhealthy",
  "qr.link.recovered",
  "campaign.created",
  "report.completed",
] as const;

export const CreateWebhookEndpointRequestV1Schema = z.object({
  url: z
    .string()
    .url("url must be a valid URL")
    .refine((u) => u.startsWith("https://"), {
      message: "Webhook target URL must use secure HTTPS",
    }),
  description: z.string().max(250).optional(),
  subscribedEvents: z
    .array(z.enum(ALLOWED_WEBHOOK_EVENT_TYPES))
    .min(1, "Must subscribe to at least one event type"),
});
export type CreateWebhookEndpointRequestV1 = z.infer<typeof CreateWebhookEndpointRequestV1Schema>;

export const UpdateWebhookEndpointRequestV1Schema = z.object({
  url: z
    .string()
    .url()
    .refine((u) => u.startsWith("https://"), {
      message: "Webhook target URL must use secure HTTPS",
    })
    .optional(),
  description: z.string().max(250).optional(),
  subscribedEvents: z.array(z.enum(ALLOWED_WEBHOOK_EVENT_TYPES)).optional(),
  status: z.enum(["active", "disabled"]).optional(),
});
export type UpdateWebhookEndpointRequestV1 = z.infer<typeof UpdateWebhookEndpointRequestV1Schema>;

/**
 * Public response returned on endpoint creation
 * Contains signingSecret ONLY ONCE!
 */
export const WebhookEndpointCreatedResponseV1Schema = z.object({
  id: z.string(),
  url: z.string(),
  description: z.string().optional(),
  subscribedEvents: z.array(z.string()),
  status: z.enum(["active", "disabled"]),
  signingSecret: z.string(), // Revealed ONCE on creation
  createdAt: z.string(),
});
export type WebhookEndpointCreatedResponseV1 = z.infer<typeof WebhookEndpointCreatedResponseV1Schema>;

/**
 * Normal public response DTO (signingSecret is omitted/masked)
 */
export const WebhookEndpointResponseV1Schema = z.object({
  id: z.string(),
  url: z.string(),
  description: z.string().optional(),
  subscribedEvents: z.array(z.string()),
  status: z.enum(["active", "disabled"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type WebhookEndpointResponseV1 = z.infer<typeof WebhookEndpointResponseV1Schema>;
