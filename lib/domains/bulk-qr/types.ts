/**
 * NXTQR — Bulk QR Operations Studio (Types & Domain Contracts)
 */

import { QrDesignV1 } from "@nxtqr/qr-core";

export type BulkSourceType = "csv" | "manual_grid";

export type BulkBatchStatus =
  | "DRAFT"
  | "VALIDATING"
  | "READY"
  | "QUEUED"
  | "PROCESSING"
  | "PARTIALLY_COMPLETED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type BulkCreationMode = "DRAFT" | "PUBLISH";

export type BulkValidationStatus = "READY" | "WARNING" | "BLOCKED";

export type BulkExecutionStatus = "PENDING" | "PROCESSING" | "CREATED" | "FAILED" | "SKIPPED";

export interface BulkColumnMapping {
  sourceHeader: string;
  targetField: CanonicalBulkField | "ignore";
  confidence: "exact" | "suggested" | "manual" | "unmapped";
  sampleValues: string[];
}

export type CanonicalBulkField =
  | "name"
  | "destination"
  | "type"
  | "campaign"
  | "folder"
  | "fallbackUrl"
  | "slug"
  | "notes"
  | "ignore";

export interface RawParsedSource {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  fileName?: string;
  fileSize?: number;
}

export interface RowValidationError {
  field: string;
  message: string;
  severity: "warning" | "block";
  code: string;
}

export interface ValidatedBulkRow {
  id: string; // Temporary client row ID or DB row ID
  sourceRowNumber: number;
  name: string;
  type: string;
  destinationUrl: string;
  fallbackUrl?: string;
  campaignId?: string;
  campaignName?: string;
  folderId?: string;
  folderName?: string;
  customSlug?: string;
  notes?: string;
  rawPayload?: Record<string, any>;
  
  // Validation State
  validationStatus: BulkValidationStatus;
  errors: RowValidationError[];
  
  // Scanability Diagnostics
  scanabilityScore?: number;
  scanabilityGrade?: "A" | "B" | "C" | "D" | "F";
  scanabilityIssues?: string[];

  // Execution State
  executionStatus?: BulkExecutionStatus;
  qrId?: string;
  slug?: string;
  resolverUrl?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface BatchManifest {
  sourceType: BulkSourceType;
  fileName?: string;
  totalRows: number;
  readyRows: number;
  warningRows: number;
  blockedRows: number;
  typeBreakdown: Record<string, number>;
  campaignId?: string;
  campaignName?: string;
  folderId?: string;
  folderName?: string;
  designPolicy: "default" | "brand_kit" | "template" | "custom";
  brandKitId?: string;
  brandKitName?: string;
  design: QrDesignV1;
  creationMode: BulkCreationMode;
  publishedAt?: string;
}

export interface BulkBatchSummary {
  id: string;
  organizationId: string;
  createdBy?: string;
  creatorName?: string;
  name: string;
  sourceType: BulkSourceType;
  status: BulkBatchStatus;
  creationMode: BulkCreationMode;
  totalRows: number;
  readyRows: number;
  warningRows: number;
  blockedRows: number;
  processedRows: number;
  createdRows: number;
  failedRows: number;
  campaignId?: string;
  campaignName?: string;
  folderId?: string;
  folderName?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

export interface BulkBatchDetail extends BulkBatchSummary {
  manifest: BatchManifest;
  design: QrDesignV1;
  rows: ValidatedBulkRow[];
}

// UI Pipeline Steps
export type BulkPipelineStep =
  | "SOURCE"
  | "MAP"
  | "VALIDATE"
  | "DESIGN"
  | "ORGANIZE"
  | "REVIEW"
  | "CREATE"
  | "RESULT";

export type RowValidationStatus = BulkValidationStatus;

export type ColumnMapping = Record<string, string>;

export interface BulkRowPayload {
  name: string;
  qr_type: string;
  destination_url: string;
  content?: Record<string, any>;
  campaign_id?: string;
  folder_id?: string;
  custom_slug?: string;
}

export interface BulkRowValidationResult {
  rowNumber: number;
  row: BulkRowPayload;
  validationStatus: BulkValidationStatus;
  errors: RowValidationError[];
  scanabilityScore?: number;
}

export interface BulkValidationGateMetrics {
  totalRows: number;
  readyRows: number;
  warningRows: number;
  blockedRows: number;
}

export interface BulkManifestSummary {
  totalRows: number;
  readyRows: number;
  warningRows: number;
  blockedRows: number;
  qrTypesBreakdown: Record<string, number>;
}

export interface BulkBatchEntity {
  id: string;
  organization_id: string;
  created_by?: string | null;
  name: string;
  source_type: string;
  status: BulkBatchStatus;
  creation_mode: BulkCreationMode;
  total_rows: number;
  ready_rows: number;
  warning_rows: number;
  blocked_rows: number;
  processed_rows: number;
  created_rows: number;
  failed_rows: number;
  campaign_id?: string | null;
  folder_id?: string | null;
  design?: any;
  created_at: string;
  updated_at: string;
}

export interface BulkBatchRowEntity {
  id: string;
  organization_id: string;
  batch_id: string;
  source_row_number: number;
  normalized_payload: any;
  validation_status: BulkValidationStatus;
  validation_errors?: any[];
  execution_status: BulkExecutionStatus;
  qr_id?: string | null;
  error_code?: string | null;
  created_at: string;
  updated_at: string;
}
