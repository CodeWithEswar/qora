/**
 * NXTQR — Asynchronous Report Generation Queue Job Contract
 * Dispatched to Cloudflare Queues for heavy PDF/CSV export generation.
 */

import { z } from "zod";

export const ReportJobV1Schema = z.object({
  schemaVersion: z.literal(1),
  jobId: z.string(),
  organizationId: z.string(),
  reportId: z.string(),
  reportType: z.enum(["scans", "conversions", "audit", "guardian"]),
  format: z.enum(["csv", "pdf", "json"]),
  dateRange: z.object({
    start: z.number(),
    end: z.number(),
  }),
  filters: z.record(z.string(), z.unknown()).optional(),
  requestedBy: z.string(),
  enqueuedAt: z.number(),
});
export type ReportJobV1 = z.infer<typeof ReportJobV1Schema>;
