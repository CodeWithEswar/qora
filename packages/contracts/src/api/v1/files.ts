/**
 * NXTQR — HTTP API V1 Files & Asset Vault Contracts
 * Operational schemas for media infrastructure, dependency tracking, and asset management.
 */

import { z } from "zod";
import { PaginationQuerySchema } from "./pagination";
import { SortOrderSchema } from "./common";

export const FILE_CATEGORIES = [
  "IMAGE",
  "DOCUMENT",
  "VIDEO",
  "AUDIO",
  "ARCHIVE",
  "EXPORT",
  "BRAND",
  "OTHER",
] as const;

export const FileCategorySchema = z.enum(FILE_CATEGORIES);
export type FileCategory = z.infer<typeof FileCategorySchema>;

export const FILE_STATUSES = [
  "UPLOADING",
  "READY",
  "PROCESSING",
  "FAILED",
  "ARCHIVED",
] as const;

export const FileStatusSchema = z.enum(FILE_STATUSES);
export type FileStatus = z.infer<typeof FileStatusSchema>;

export const FILE_USAGE_ROLES = [
  "LOGO",
  "HERO_IMAGE",
  "BACKGROUND",
  "DOWNLOAD",
  "SOCIAL_IMAGE",
  "CAMPAIGN_ASSET",
  "BRAND_LOGO",
  "REPORT_OUTPUT",
  "OTHER",
] as const;

export const FileUsageRoleSchema = z.enum(FILE_USAGE_ROLES);
export type FileUsageRole = z.infer<typeof FileUsageRoleSchema>;

export const FILE_RESOURCE_TYPES = [
  "QR_CODE",
  "LANDING_PAGE",
  "CAMPAIGN",
  "BRAND_KIT",
  "REPORT",
] as const;

export const FileResourceTypeSchema = z.enum(FILE_RESOURCE_TYPES);
export type FileResourceType = z.infer<typeof FileResourceTypeSchema>;

export const FileUsageV1Schema = z.object({
  id: z.string(),
  fileId: z.string(),
  resourceType: FileResourceTypeSchema,
  resourceId: z.string(),
  resourceName: z.string(),
  usageRole: FileUsageRoleSchema,
  createdAt: z.string(),
  resourceHref: z.string().optional(),
});
export type FileUsageV1 = z.infer<typeof FileUsageV1Schema>;

export const FileSummaryV1Schema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  originalName: z.string(),
  category: FileCategorySchema,
  mimeType: z.string(),
  extension: z.string().nullable().optional(),
  sizeBytes: z.number().int().nonnegative(),
  dimensions: z
    .object({
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .nullable()
    .optional(),
  status: FileStatusSchema,
  publicUrl: z.string(),
  bucket: z.string().optional(),
  storagePath: z.string().optional(),
  usageCount: z.number().int().nonnegative(),
  uploadedBy: z
    .object({
      id: z.string(),
      displayName: z.string(),
      avatarUrl: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable().optional(),
});
export type FileSummaryV1 = z.infer<typeof FileSummaryV1Schema>;

export const FileDetailV1Schema = FileSummaryV1Schema.extend({
  bucket: z.string(),
  storagePath: z.string(),
  usages: z.array(FileUsageV1Schema),
});
export type FileDetailV1 = z.infer<typeof FileDetailV1Schema>;

export const AssetPulseMetricsV1Schema = z.object({
  totalFiles: z.number().int().nonnegative(),
  totalImages: z.number().int().nonnegative(),
  totalDocuments: z.number().int().nonnegative(),
  inUseCount: z.number().int().nonnegative(),
  usedStorageBytes: z.number().int().nonnegative(),
  storageLimitBytes: z.number().int().positive().optional(),
});
export type AssetPulseMetricsV1 = z.infer<typeof AssetPulseMetricsV1Schema>;

export const FileCollectionQuerySchema = PaginationQuerySchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  search: z.string().max(100).optional(),
  category: z.enum(["ALL", ...FILE_CATEGORIES]).default("ALL"),
  usage: z.enum(["all", "in_use", "unused"]).default("all"),
  status: z.enum(["all", "READY", "ARCHIVED"]).default("all"),
  sortBy: z
    .enum(["updatedAt", "createdAt", "name", "sizeBytes", "usageCount"])
    .default("updatedAt"),
  order: SortOrderSchema.default("desc"),
});
export type FileCollectionQueryParams = z.infer<typeof FileCollectionQuerySchema>;

export const RenameFileRequestV1Schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "File display name is required")
    .max(120, "File display name cannot exceed 120 characters"),
});
export type RenameFileRequestV1 = z.infer<typeof RenameFileRequestV1Schema>;

export const AttachFileUsageRequestV1Schema = z.object({
  resourceType: FileResourceTypeSchema,
  resourceId: z.string(),
  resourceName: z.string(),
  usageRole: FileUsageRoleSchema.default("OTHER"),
});
export type AttachFileUsageRequestV1 = z.infer<typeof AttachFileUsageRequestV1Schema>;

export const UploadFileResponseV1Schema = z.object({
  file: FileSummaryV1Schema,
  message: z.string().optional(),
});
export type UploadFileResponseV1 = z.infer<typeof UploadFileResponseV1Schema>;
