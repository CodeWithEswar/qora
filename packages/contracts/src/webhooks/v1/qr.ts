/**
 * NXTQR — Customer Outbound QR Webhook Data Contracts (V1)
 */

import { z } from "zod";

export const QrCreatedWebhookDataV1Schema = z.object({
  qrId: z.string(),
  name: z.string(),
  type: z.string(),
  mode: z.string(),
  destinationUrl: z.string(),
  scanUrl: z.string(),
});
export type QrCreatedWebhookDataV1 = z.infer<typeof QrCreatedWebhookDataV1Schema>;

export const QrPublishedWebhookDataV1Schema = z.object({
  qrId: z.string(),
  name: z.string(),
  version: z.number().int().positive(),
  destinationUrl: z.string(),
  scanUrl: z.string(),
  publishedAt: z.string(),
});
export type QrPublishedWebhookDataV1 = z.infer<typeof QrPublishedWebhookDataV1Schema>;
