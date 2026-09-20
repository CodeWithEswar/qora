/**
 * NXTQR — HTTP API V1 QR Resource Contracts
 * Explicit request DTOs, response schemas, and query parameters for QR operations.
 */

import { z } from "zod";
import { PaginationQuerySchema } from "./pagination";
import { SortOrderSchema } from "./common";

export const QR_TYPE_ENUM = [
  "url",
  "vcard",
  "wifi",
  "email",
  "phone",
  "sms",
  "whatsapp",
  "app",
  "payment",
  "location",
  "pdf",
  "text",
  "event",
] as const;

export const QR_MODE_ENUM = ["dynamic", "static"] as const;
export const QR_STATUS_ENUM = ["DRAFT", "ACTIVE", "PAUSED", "SCHEDULED", "EXPIRED", "ARCHIVED"] as const;

/**
 * QR Visual Design schema
 */
export const QrDesignInputSchema = z.object({
  pixelStyle: z.enum(["squares", "rounded", "dots"]).default("squares"),
  eyeStyle: z.enum(["square", "rounded", "leaf"]).default("square"),
  fgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "fgColor must be a 6-digit hex code").default("#000000"),
  bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "bgColor must be a 6-digit hex code").default("#FFFFFF"),
  eyeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "eyeColor must be a 6-digit hex code").optional(),
  errorCorrection: z.enum(["L", "M", "Q", "H"]).default("M"),
}).passthrough();
export type QrDesignInput = z.infer<typeof QrDesignInputSchema>;

/**
 * POST /api/v1/qrs — Request DTO
 * Organization is NEVER accepted from request body; derived from authenticated principal.
 */
export const CreateQrRequestV1Schema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Name cannot exceed 120 characters"),
  type: z.enum(QR_TYPE_ENUM).default("url"),
  mode: z.enum(QR_MODE_ENUM).default("static"),
  destinationUrl: z
    .string()
    .url("destinationUrl must be a valid URL")
    .refine((u) => /^https?:\/\//i.test(u), {
      message: "destinationUrl must use http or https scheme",
    }),
  fallbackUrl: z
    .string()
    .url("fallbackUrl must be a valid URL")
    .refine((u) => /^https?:\/\//i.test(u), {
      message: "fallbackUrl must use http or https scheme",
    })
    .optional(),
  campaignId: z.string().optional(),
  folderId: z.string().optional(),
  design: QrDesignInputSchema.optional(),
});
export type CreateQrRequestV1 = z.infer<typeof CreateQrRequestV1Schema>;

/**
 * PATCH /api/v1/qrs/:id — Metadata update request DTO
 * Does NOT mutate routing, published destination, or security policy.
 */
export const UpdateQrMetadataRequestV1Schema = z.object({
  name: z.string().min(1).max(120).optional(),
  status: z.enum(QR_STATUS_ENUM).optional(),
  campaignId: z.string().nullable().optional(),
  folderId: z.string().nullable().optional(),
  tags: z.array(z.string().min(1).max(32)).optional(),
});
export type UpdateQrMetadataRequestV1 = z.infer<typeof UpdateQrMetadataRequestV1Schema>;

/**
 * POST /api/v1/qrs/:id/publish — Publish command request DTO
 */
export const PublishQrRequestV1Schema = z.object({
  expectedVersion: z.number().int().positive().optional(),
  changeSummary: z.string().max(250).optional(),
});
export type PublishQrRequestV1 = z.infer<typeof PublishQrRequestV1Schema>;

/**
 * Controlled routing rule condition (non-executable)
 */
export const RoutingConditionInputSchema = z.object({
  id: z.string().optional(),
  field: z.string().min(1),
  operator: z.enum(["eq", "neq", "contains", "in", "nin", "not_in", "between", "starts_with", "exists", "not_exists"]),
  value: z.union([z.string(), z.number(), z.array(z.string()), z.array(z.number())]).optional(),
  paramName: z.string().optional(),
  key: z.string().optional(),
});
export type RoutingConditionInput = z.infer<typeof RoutingConditionInputSchema>;

/**
 * Controlled routing rule
 */
export const RoutingRuleInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(64),
  priority: z.number().int().min(1).max(1000),
  destinationUrl: z.string().url("destinationUrl must be a valid URL"),
  destinationId: z.string().optional(),
  isActive: z.boolean().default(true),
  matchMode: z.enum(["ALL", "ANY"]).default("ALL"),
  conditions: z.array(RoutingConditionInputSchema).min(1, "At least one condition is required"),
});
export type RoutingRuleInput = z.infer<typeof RoutingRuleInputSchema>;

/**
 * PUT /api/v1/qrs/:id/rules — Rule replacement request DTO
 */
export const ReplaceQrRulesRequestV1Schema = z.object({
  rules: z.array(RoutingRuleInputSchema),
  expectedRevision: z.number().optional(),
  timezone: z.string().optional(),
});
export type ReplaceQrRulesRequestV1 = z.infer<typeof ReplaceQrRulesRequestV1Schema>;

/**
 * POST /api/v1/qrs/:id/share-links — Request DTO
 */
export const CreateShareLinkRequestV1Schema = z.object({
  permission: z.enum(["view", "edit"]).default("view"),
  expiresAt: z.string().datetime({ message: "expiresAt must be valid ISO 8601 UTC" }).optional(),
  password: z.string().min(4, "Password must be at least 4 characters").max(64).optional(),
});
export type CreateShareLinkRequestV1 = z.infer<typeof CreateShareLinkRequestV1Schema>;

/**
 * GET /api/v1/qrs — Collection query params
 */
export const QrCollectionQuerySchema = PaginationQuerySchema.extend({
  search: z.string().max(100).optional(),
  status: z.enum(QR_STATUS_ENUM).optional(),
  type: z.enum(QR_TYPE_ENUM).optional(),
  campaignId: z.string().optional(),
  ownerId: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "totalScans"]).default("updatedAt"),
  order: SortOrderSchema.default("desc"),
});
export type QrCollectionQueryParams = z.infer<typeof QrCollectionQuerySchema>;

/**
 * POST /api/v1/qrs/bulk — Bulk QR operations
 */
export const BulkQrActionRequestV1Schema = z.object({
  qrIds: z.array(z.string()).min(1, "At least one QR ID is required").max(100, "Maximum 100 QR IDs per batch"),
  action: z.enum(["pause", "resume", "archive", "delete", "move_campaign"]),
  campaignId: z.string().nullable().optional(),
});
export type BulkQrActionRequestV1 = z.infer<typeof BulkQrActionRequestV1Schema>;

/**
 * POST /api/v1/qrs/:id/duplicate — Duplicate QR
 */
export const DuplicateQrRequestV1Schema = z.object({
  name: z.string().min(1).max(120).optional(),
});
export type DuplicateQrRequestV1 = z.infer<typeof DuplicateQrRequestV1Schema>;

/**
 * GET /api/v1/qrs/:id/analytics — Query params
 */
export const QrAnalyticsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  granularity: z.enum(["hour", "day", "week", "month"]).default("day"),
  timezone: z.string().default("UTC"),
});
export type QrAnalyticsQueryParams = z.infer<typeof QrAnalyticsQuerySchema>;

/**
 * Public QR Response V1 DTO
 * Does NOT leak raw database row or internal fields.
 */
export const QrResponseV1Schema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.string(),
  mode: z.string(),
  status: z.string(),
  destinationUrl: z.string(),
  draftDestination: z.string().optional(),
  hasUnpublishedChanges: z.boolean().optional(),
  fallbackUrl: z.string().optional(),
  scanUrl: z.string(),
  campaignId: z.string().optional(),
  campaignName: z.string().optional(),
  folderId: z.string().optional(),
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),
  ownerEmail: z.string().optional(),
  ownerAvatarUrl: z.string().optional(),
  currentVersion: z.number().int().optional(),
  publishedVersion: z.number().int().optional(),
  scans: z.number().int().optional(),
  uniqueScans: z.number().int().optional(),
  design: z.record(z.string(), z.any()).optional().default({}),
  createdAt: z.string(), // ISO-8601 UTC
  updatedAt: z.string(), // ISO-8601 UTC
});
export type QrResponseV1 = z.infer<typeof QrResponseV1Schema>;

/**
 * Public Share Link Response V1 DTO
 */
export const ShareLinkResponseV1Schema = z.object({
  id: z.string(),
  qrId: z.string(),
  permission: z.string(),
  shareUrl: z.string(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
});
export type ShareLinkResponseV1 = z.infer<typeof ShareLinkResponseV1Schema>;

/**
 * Public Analytics Aggregate Response V1 DTO
 * Uses estimatedUniqueScans (NOT uniquePeople).
 */
export const QrAnalyticsResponseV1Schema = z.object({
  qrId: z.string(),
  period: z.object({
    from: z.string(),
    to: z.string(),
    granularity: z.string(),
    timezone: z.string(),
  }),
  metrics: z.object({
    totalScans: z.number().int().nonnegative(),
    estimatedUniqueScans: z.number().int().nonnegative(),
  }),
  timeseries: z.array(
    z.object({
      timestamp: z.string(),
      scans: z.number().int().nonnegative(),
      estimatedUniqueScans: z.number().int().nonnegative(),
    })
  ),
  breakdowns: z.object({
    devices: z.record(z.string(), z.number()),
    countries: z.record(z.string(), z.number()),
    operatingSystems: z.record(z.string(), z.number()),
  }),
});
export type QrAnalyticsResponseV1 = z.infer<typeof QrAnalyticsResponseV1Schema>;

/**
 * QR Studio Draft Save Request DTO (with optimistic concurrency token)
 */
export const SaveQrDraftRequestV1Schema = z.object({
  expectedDraftVersion: z.number().int().nonnegative().optional(),
  name: z.string().min(1).max(100).optional(),
  isDynamic: z.boolean().optional(),
  content: z.record(z.string(), z.any()),
  design: z.record(z.string(), z.any()),
  destination: z.record(z.string(), z.any()).optional(),
});
export type SaveQrDraftRequestV1 = z.infer<typeof SaveQrDraftRequestV1Schema>;

/**
 * QR Studio Immutable Version Creation DTO
 */
export const CreateQrVersionRequestV1Schema = z.object({
  changeSummary: z.string().min(1, "Change summary is required").max(250),
  content: z.record(z.string(), z.any()).optional(),
  design: z.record(z.string(), z.any()).optional(),
});
export type CreateQrVersionRequestV1 = z.infer<typeof CreateQrVersionRequestV1Schema>;

/**
 * QR Studio Version Restore Request DTO
 */
export const RestoreQrVersionRequestV1Schema = z.object({
  versionNumber: z.number().int().positive().optional(),
});
export type RestoreQrVersionRequestV1 = z.infer<typeof RestoreQrVersionRequestV1Schema>;

/**
 * QR Studio Export Request DTO
 */
export const QrExportRequestV1Schema = z.object({
  format: z.enum(["svg", "png", "pdf"]).default("svg"),
  presetId: z.string().optional(),
  versionNumber: z.number().int().positive().optional(),
  useDraft: z.boolean().default(true),
  size: z.number().int().min(256).max(4096).default(1024),
});
export type QrExportRequestV1 = z.infer<typeof QrExportRequestV1Schema>;

