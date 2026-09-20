/**
 * NXTQR — HTTP API V1 Folder Resource Contracts
 * Operational schemas for QR Asset Organization Workspace.
 */

import { z } from "zod";
import { PaginationQuerySchema } from "./pagination";
import { SortOrderSchema } from "./common";

export const FOLDER_ACCENTS = [
  "Ember",
  "Amber",
  "Sun",
  "Graphite",
  "Sand",
  "Sage",
  "Ocean",
] as const;

export const FolderAccentKeySchema = z.enum(FOLDER_ACCENTS);
export type FolderAccentKey = z.infer<typeof FolderAccentKeySchema>;

export const FolderStatusSchema = z.enum(["active", "archived"]);
export type FolderStatus = z.infer<typeof FolderStatusSchema>;

export const CreateFolderRequestV1Schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(80, "Folder name cannot exceed 80 characters"),
  description: z.string().trim().max(300).nullable().optional(),
  emoji: z.string().trim().max(16).nullable().optional(),
  accentKey: FolderAccentKeySchema.default("Graphite"),
});
export type CreateFolderRequestV1 = z.infer<typeof CreateFolderRequestV1Schema>;

export const UpdateFolderRequestV1Schema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(300).nullable().optional(),
  emoji: z.string().trim().max(16).nullable().optional(),
  accentKey: FolderAccentKeySchema.optional(),
  status: FolderStatusSchema.optional(),
});
export type UpdateFolderRequestV1 = z.infer<typeof UpdateFolderRequestV1Schema>;

export const MoveQrsRequestV1Schema = z.object({
  qrIds: z
    .array(z.string().uuid("Invalid QR ID"))
    .min(1, "At least one QR code must be specified")
    .max(100),
  targetFolderId: z.string().uuid("Invalid folder ID").nullable().optional(),
});
export type MoveQrsRequestV1 = z.infer<typeof MoveQrsRequestV1Schema>;

export const FolderCollectionQuerySchema = PaginationQuerySchema.extend({
  search: z.string().max(80).optional(),
  status: z.enum(["active", "archived", "all"]).default("active"),
  sortBy: z.enum(["updatedAt", "createdAt", "name", "qrCount"]).default("updatedAt"),
  order: SortOrderSchema.default("desc"),
  offset: z.coerce.number().min(0).optional(),
});
export type FolderCollectionQueryParams = z.infer<typeof FolderCollectionQuerySchema>;

export const FolderAssetCollectionQuerySchema = PaginationQuerySchema.extend({
  search: z.string().max(80).optional(),
  status: z.string().optional(),
  qrType: z.string().optional(),
  isDynamic: z.enum(["true", "false", "all"]).optional(),
  campaignId: z.string().optional(),
  sortBy: z.enum(["updatedAt", "createdAt", "name", "totalScans"]).default("updatedAt"),
  order: SortOrderSchema.default("desc"),
  offset: z.coerce.number().min(0).optional(),
});
export type FolderAssetCollectionQueryParams = z.infer<typeof FolderAssetCollectionQuerySchema>;

export const FolderResponseV1Schema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  emoji: z.string().nullable().optional(),
  accentKey: FolderAccentKeySchema.default("Graphite"),
  status: FolderStatusSchema,
  qrCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
});
export type FolderResponseV1 = z.infer<typeof FolderResponseV1Schema>;

export const FolderPulseMetricsSchema = z.object({
  qrCount: z.number().default(0),
  dynamicCount: z.number().default(0),
  staticCount: z.number().default(0),
  destinationCount: z.number().default(0),
  scanCount: z.number().default(0),
});
export type FolderPulseMetrics = z.infer<typeof FolderPulseMetricsSchema>;

export const FolderSummarySignalSchema = z.object({
  totalFolders: z.number().default(0),
  totalFiledQrs: z.number().default(0),
  totalUnfiledQrs: z.number().default(0),
  activeFolders: z.number().default(0),
});
export type FolderSummarySignal = z.infer<typeof FolderSummarySignalSchema>;

export const FolderQrAssetV1Schema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  qrType: z.string(),
  isDynamic: z.boolean(),
  status: z.string(),
  destinationUrl: z.string(),
  totalScans: z.number(),
  uniqueScans: z.number(),
  currentFolderId: z.string().nullable().optional(),
  currentFolderName: z.string().nullable().optional(),
  updatedAt: z.string(),
});
export type FolderQrAssetV1 = z.infer<typeof FolderQrAssetV1Schema>;
