/**
 * NXTQR — HTTP API V1 Campaign Resource Contracts
 * Operational orchestration schemas for QR grouping, lifecycle, and analytics.
 */

import { z } from "zod";
import { PaginationQuerySchema } from "./pagination";
import { SortOrderSchema } from "./common";

export const CampaignStatusSchema = z.enum(["draft", "active", "paused", "completed", "archived"]);
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;

export const CreateCampaignRequestV1Schema = z.object({
  name: z.string().trim().min(1, "Campaign name is required").max(100),
  description: z.string().trim().max(500).optional(),
  emoji: z.string().trim().max(16).nullable().optional(),
  status: CampaignStatusSchema.default("draft"),
  startsAt: z.string().datetime({ message: "startsAt must be a valid ISO 8601 UTC timestamp" }).optional(),
  endsAt: z.string().datetime({ message: "endsAt must be a valid ISO 8601 UTC timestamp" }).optional(),
  qrIds: z.array(z.string()).max(100).optional(),
});
export type CreateCampaignRequestV1 = z.infer<typeof CreateCampaignRequestV1Schema>;

export const UpdateCampaignRequestV1Schema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  emoji: z.string().trim().max(16).nullable().optional(),
  status: CampaignStatusSchema.optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
});
export type UpdateCampaignRequestV1 = z.infer<typeof UpdateCampaignRequestV1Schema>;

export const CampaignCollectionQuerySchema = PaginationQuerySchema.extend({
  search: z.string().max(100).optional(),
  status: CampaignStatusSchema.optional(),
  hasQrs: z.enum(["true", "false", "all"]).optional(),
  hasScans: z.enum(["true", "false", "all"]).optional(),
  dateRange: z.enum(["today", "7d", "30d", "all"]).optional(),
  sortBy: z.enum(["updatedAt", "createdAt", "name", "totalScans"]).default("updatedAt"),
  order: SortOrderSchema.default("desc"),
});
export type CampaignCollectionQueryParams = z.infer<typeof CampaignCollectionQuerySchema>;

export const CampaignResponseV1Schema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().nullable().optional(),
  status: CampaignStatusSchema,
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  qrCount: z.number().default(0),
  totalScans: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable().optional(),
  creatorName: z.string().optional(),
});
export type CampaignResponseV1 = z.infer<typeof CampaignResponseV1Schema>;

export const CampaignSummarySignalV1Schema = z.object({
  activeCampaigns: z.number(),
  qrAssetsInCampaigns: z.number(),
  scanActivity: z.number(),
  destinations: z.number(),
});
export type CampaignSummarySignalV1 = z.infer<typeof CampaignSummarySignalV1Schema>;

export const CampaignQrAssetV1Schema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  qrType: z.string(),
  status: z.string(),
  destinationUrl: z.string(),
  totalScans: z.number(),
  uniqueScans: z.number().optional(),
  updatedAt: z.string(),
  design: z.any().optional(),
});
export type CampaignQrAssetV1 = z.infer<typeof CampaignQrAssetV1Schema>;

export const CampaignConstellationNodeV1Schema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  type: z.string(),
  destinationUrl: z.string(),
  totalScans: z.number(),
});
export type CampaignConstellationNodeV1 = z.infer<typeof CampaignConstellationNodeV1Schema>;

export const CampaignDestinationNodeV1Schema = z.object({
  domain: z.string(),
  destinationUrl: z.string(),
  qrCount: z.number(),
  qrIds: z.array(z.string()),
});
export type CampaignDestinationNodeV1 = z.infer<typeof CampaignDestinationNodeV1Schema>;

export const CampaignAnalyticsV1Schema = z.object({
  period: z.enum(["7d", "30d", "90d", "all"]),
  totalScans: z.number(),
  uniqueScans: z.number(),
  activeQrs: z.number(),
  timeSeries: z.array(
    z.object({
      date: z.string(),
      scans: z.number(),
      uniqueScans: z.number(),
    })
  ),
  topQrAssets: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      destinationUrl: z.string(),
      scans: z.number(),
      share: z.number(),
    })
  ),
  destinationDistribution: z.array(
    z.object({
      domain: z.string(),
      count: z.number(),
      qrCount: z.number(),
    })
  ),
  routingSummary: z.object({
    defaultRoutesCount: z.number(),
    conditionalRulesCount: z.number(),
    monitoredCount: z.number(),
  }),
});
export type CampaignAnalyticsV1 = z.infer<typeof CampaignAnalyticsV1Schema>;

export const CampaignDetailResponseV1Schema = z.object({
  campaign: CampaignResponseV1Schema,
  metrics: z.object({
    totalScans: z.number(),
    uniqueScans: z.number(),
    qrCount: z.number(),
    destinationCount: z.number(),
    routesCount: z.number(),
  }),
  constellation: z.object({
    totalQrCount: z.number(),
    nodes: z.array(CampaignConstellationNodeV1Schema),
  }),
  recentQrs: z.array(CampaignQrAssetV1Schema),
});
export type CampaignDetailResponseV1 = z.infer<typeof CampaignDetailResponseV1Schema>;

export const AssignCampaignQrsRequestV1Schema = z.object({
  qrIds: z.array(z.string()).min(1, "At least one QR code ID must be provided").max(100),
});
export type AssignCampaignQrsRequestV1 = z.infer<typeof AssignCampaignQrsRequestV1Schema>;
