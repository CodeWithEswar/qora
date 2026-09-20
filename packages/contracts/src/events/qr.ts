/**
 * NXTQR — QR Internal Domain Event Schemas
 * Facts describing QR lifecycle events. Contains minimal payloads, no secrets.
 */

import { z } from "zod";

export const QrCreatedEventDataSchema = z.object({
  qrId: z.string(),
  type: z.string(),
  mode: z.string(),
  createdBy: z.string(),
});
export type QrCreatedEventData = z.infer<typeof QrCreatedEventDataSchema>;

export const QrVersionCreatedEventDataSchema = z.object({
  qrId: z.string(),
  versionNumber: z.number().int().positive(),
  revisionId: z.string(),
  createdBy: z.string(),
});
export type QrVersionCreatedEventData = z.infer<typeof QrVersionCreatedEventDataSchema>;

export const QrPublishedEventDataSchema = z.object({
  qrId: z.string(),
  versionNumber: z.number().int().positive(),
  publishedAt: z.string(),
  resolverRevision: z.number().int().positive(),
});
export type QrPublishedEventData = z.infer<typeof QrPublishedEventDataSchema>;

export const QrDestinationChangedEventDataSchema = z.object({
  qrId: z.string(),
  destinationId: z.string(),
  destinationUrl: z.string(),
  isDraft: z.boolean(),
});
export type QrDestinationChangedEventData = z.infer<typeof QrDestinationChangedEventDataSchema>;

export const QrRuleChangedEventDataSchema = z.object({
  qrId: z.string(),
  ruleCount: z.number().int().nonnegative(),
  isDraft: z.boolean(),
});
export type QrRuleChangedEventData = z.infer<typeof QrRuleChangedEventDataSchema>;
