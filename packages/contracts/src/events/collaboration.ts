/**
 * NXTQR — Collaboration Internal Domain Event Schemas
 * Minimal payloads; broad consumers load authorized content separately.
 */

import { z } from "zod";

export const CommentCreatedEventDataSchema = z.object({
  commentId: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  authorId: z.string(),
});
export type CommentCreatedEventData = z.infer<typeof CommentCreatedEventDataSchema>;

export const ApprovalRequestedEventDataSchema = z.object({
  approvalRequestId: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  requestedBy: z.string(),
});
export type ApprovalRequestedEventData = z.infer<typeof ApprovalRequestedEventDataSchema>;

export const ApprovalApprovedEventDataSchema = z.object({
  approvalRequestId: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  approvedBy: z.string(),
});
export type ApprovalApprovedEventData = z.infer<typeof ApprovalApprovedEventDataSchema>;
