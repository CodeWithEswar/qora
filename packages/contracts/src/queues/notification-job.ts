/**
 * NXTQR — Notification Queue Job Contract
 */

import { z } from "zod";

export const NotificationJobV1Schema = z.object({
  schemaVersion: z.literal(1),
  jobId: z.string(),
  organizationId: z.string(),
  recipientUserId: z.string(),
  notificationType: z.string(),
  subject: z.string(),
  eventReferenceId: z.string().optional(),
  enqueuedAt: z.number(),
});
export type NotificationJobV1 = z.infer<typeof NotificationJobV1Schema>;
