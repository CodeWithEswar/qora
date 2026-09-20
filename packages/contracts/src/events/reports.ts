/**
 * NXTQR — Report Internal Domain Event Schemas
 * Low-volume domain facts distinct from asynchronous Queue execution jobs.
 */

import { z } from "zod";

export const ReportRequestedEventDataSchema = z.object({
  reportId: z.string(),
  organizationId: z.string(),
  reportType: z.string(),
  format: z.string(),
  requestedBy: z.string(),
});
export type ReportRequestedEventData = z.infer<typeof ReportRequestedEventDataSchema>;

export const ReportCompletedEventDataSchema = z.object({
  reportId: z.string(),
  organizationId: z.string(),
  outputAssetId: z.string(),
  completedAt: z.string(),
});
export type ReportCompletedEventData = z.infer<typeof ReportCompletedEventDataSchema>;
