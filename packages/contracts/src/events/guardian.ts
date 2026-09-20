/**
 * NXTQR — Guardian Link Health Internal Domain Event Schemas
 * Emitted only on state transitions (HEALTHY -> UNHEALTHY or UNHEALTHY -> HEALTHY),
 * not on individual transient probe failures.
 */

import { z } from "zod";

export const QrLinkUnhealthyEventDataSchema = z.object({
  qrId: z.string(),
  destinationUrl: z.string(),
  incidentId: z.string(),
  failureReason: z.string(),
  observedAt: z.string(),
});
export type QrLinkUnhealthyEventData = z.infer<typeof QrLinkUnhealthyEventDataSchema>;

export const QrLinkRecoveredEventDataSchema = z.object({
  qrId: z.string(),
  destinationUrl: z.string(),
  incidentId: z.string(),
  recoveredAt: z.string(),
});
export type QrLinkRecoveredEventData = z.infer<typeof QrLinkRecoveredEventDataSchema>;
