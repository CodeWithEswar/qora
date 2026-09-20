/**
 * NXTQR — HTTP API V1 Conversion Contracts
 * Privacy-aware conversion occurrence recording with idempotent deduplication.
 * No persistent cross-site fingerprinting or raw IP identity.
 */

import { z } from "zod";

export const RecordConversionRequestV1Schema = z.object({
  qrId: z.string().min(1, "qrId is required"),
  eventName: z
    .string()
    .min(1, "eventName is required")
    .max(64)
    .regex(/^[a-z0-9_.-]+$/i, "eventName must only contain alphanumeric characters, underscores, and dots"),
  eventValue: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  orderId: z.string().max(100).optional(),
  deduplicationId: z.string().max(128).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});
export type RecordConversionRequestV1 = z.infer<typeof RecordConversionRequestV1Schema>;

export const ConversionResponseV1Schema = z.object({
  id: z.string(),
  qrId: z.string(),
  eventName: z.string(),
  eventValue: z.number().optional(),
  currency: z.string().optional(),
  recordedAt: z.string(),
  isDuplicate: z.boolean(),
});
export type ConversionResponseV1 = z.infer<typeof ConversionResponseV1Schema>;
