/**
 * NXTQR — HTTP API V1 Report Resource Contracts
 * Asynchronous job submission (HTTP 202 Accepted) and controlled status inquiry.
 * Raw R2 keys are never exposed directly to public clients.
 */

import { z } from "zod";

export const REPORT_TYPE_ENUM = ["scans", "conversions", "audit", "guardian"] as const;
export const REPORT_FORMAT_ENUM = ["csv", "pdf", "json"] as const;
export const REPORT_STATUS_ENUM = ["queued", "processing", "completed", "failed"] as const;

export const CreateReportRequestV1Schema = z.object({
  reportType: z.enum(REPORT_TYPE_ENUM),
  format: z.enum(REPORT_FORMAT_ENUM).default("csv"),
  from: z.string().datetime({ message: "from must be a valid ISO 8601 UTC timestamp" }),
  to: z.string().datetime({ message: "to must be a valid ISO 8601 UTC timestamp" }),
  qrId: z.string().optional(),
  campaignId: z.string().optional(),
});
export type CreateReportRequestV1 = z.infer<typeof CreateReportRequestV1Schema>;

export const ReportJobCreatedResponseV1Schema = z.object({
  jobId: z.string(),
  status: z.enum(REPORT_STATUS_ENUM),
  reportType: z.enum(REPORT_TYPE_ENUM),
  format: z.enum(REPORT_FORMAT_ENUM),
  enqueuedAt: z.string(),
  checkStatusUrl: z.string(),
});
export type ReportJobCreatedResponseV1 = z.infer<typeof ReportJobCreatedResponseV1Schema>;

export const ReportStatusResponseV1Schema = z.object({
  jobId: z.string(),
  status: z.enum(REPORT_STATUS_ENUM),
  reportType: z.enum(REPORT_TYPE_ENUM),
  format: z.enum(REPORT_FORMAT_ENUM),
  downloadUrl: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  createdAt: z.string(),
  completedAt: z.string().nullable().optional(),
});
export type ReportStatusResponseV1 = z.infer<typeof ReportStatusResponseV1Schema>;
