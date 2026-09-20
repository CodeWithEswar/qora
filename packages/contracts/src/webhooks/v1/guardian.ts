/**
 * NXTQR — Customer Outbound Guardian Incident Webhook Data Contracts (V1)
 */

import { z } from "zod";

export const LinkUnhealthyWebhookDataV1Schema = z.object({
  qrId: z.string(),
  destinationUrl: z.string(),
  incidentId: z.string(),
  reason: z.string(),
  observedAt: z.string(),
});
export type LinkUnhealthyWebhookDataV1 = z.infer<typeof LinkUnhealthyWebhookDataV1Schema>;

export const LinkRecoveredWebhookDataV1Schema = z.object({
  qrId: z.string(),
  destinationUrl: z.string(),
  incidentId: z.string(),
  recoveredAt: z.string(),
});
export type LinkRecoveredWebhookDataV1 = z.infer<typeof LinkRecoveredWebhookDataV1Schema>;
