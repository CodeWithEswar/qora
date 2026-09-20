/**
 * NXTQR — Campaign Internal Domain Event Schemas
 */

import { z } from "zod";

export const CampaignCreatedEventDataSchema = z.object({
  campaignId: z.string(),
  name: z.string(),
  emoji: z.string().nullable().optional(),
  status: z.string().optional(),
  createdBy: z.string(),
});
export type CampaignCreatedEventData = z.infer<typeof CampaignCreatedEventDataSchema>;

export const CampaignUpdatedEventDataSchema = z.object({
  campaignId: z.string(),
  changes: z.record(z.string(), z.any()),
  updatedBy: z.string(),
});
export type CampaignUpdatedEventData = z.infer<typeof CampaignUpdatedEventDataSchema>;

export const CampaignArchivedEventDataSchema = z.object({
  campaignId: z.string(),
  archivedBy: z.string(),
});
export type CampaignArchivedEventData = z.infer<typeof CampaignArchivedEventDataSchema>;

export const CampaignDeletedEventDataSchema = z.object({
  campaignId: z.string(),
  deletedBy: z.string(),
});
export type CampaignDeletedEventData = z.infer<typeof CampaignDeletedEventDataSchema>;

export const CampaignQrAddedEventDataSchema = z.object({
  campaignId: z.string(),
  qrIds: z.array(z.string()),
  addedBy: z.string(),
});
export type CampaignQrAddedEventData = z.infer<typeof CampaignQrAddedEventDataSchema>;

export const CampaignQrRemovedEventDataSchema = z.object({
  campaignId: z.string(),
  qrId: z.string(),
  removedBy: z.string(),
});
export type CampaignQrRemovedEventData = z.infer<typeof CampaignQrRemovedEventDataSchema>;
