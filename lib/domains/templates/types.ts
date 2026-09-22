/**
 * NXTQR — QR Templates & Design Library
 * Domain Contracts, Types, and Filter Specifications
 */

import { QrDesignV1 } from "@nxtqr/qr-core";

export type TemplateScope = "organization" | "system";
export type TemplateStatus = "active" | "archived";
export type TemplateScanabilityStatus = "PASS" | "WARNING" | "FAIL";

export type CanonicalQrCompatibilityType =
  | "UNIVERSAL"
  | "URL"
  | "TEXT"
  | "WIFI"
  | "VCARD"
  | "APP"
  | "FILE";

export interface QrTemplateSummary {
  id: string;
  organization_id: string;
  created_by?: string | null;
  creator_name?: string | null;
  name: string;
  description?: string | null;
  scope: TemplateScope;
  status: TemplateStatus;
  brand_kit_id?: string | null;
  brand_kit_name?: string | null;
  brand_kit_slug?: string | null;
  brand_kit_colors?: string[];
  compatibility: string[];
  is_brand_locked: boolean;
  locked_fields: string[];
  current_version: number;
  design_json: QrDesignV1;
  scanability_score: number;
  scanability_status: TemplateScanabilityStatus;
  usage_count: number;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
}

export interface QrTemplateVersion {
  id: string;
  organization_id: string;
  template_id: string;
  version: number;
  change_summary?: string | null;
  design_json: QrDesignV1;
  scanability_score: number;
  scanability_status: TemplateScanabilityStatus;
  created_by?: string | null;
  creator_name?: string | null;
  created_at: string;
}

export interface QrTemplateDetail extends QrTemplateSummary {
  versions: QrTemplateVersion[];
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  brand_kit_id?: string | null;
  compatibility?: string[];
  is_brand_locked?: boolean;
  locked_fields?: string[];
  design: QrDesignV1;
  change_summary?: string;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  brand_kit_id?: string | null;
  compatibility?: string[];
  is_brand_locked?: boolean;
  locked_fields?: string[];
  design?: QrDesignV1;
  change_summary?: string;
}

export interface TemplateFilters {
  search?: string;
  type?: string; // 'all', 'universal', 'url', etc.
  brandKitId?: string;
  ownership?: "all" | "mine" | "org";
  governance?: "all" | "editable" | "locked";
  scanability?: "all" | "pass" | "warning";
  status?: "active" | "archived" | "all";
  sort?:
    | "updated_desc"
    | "created_desc"
    | "name_asc"
    | "name_desc"
    | "usage_desc";
}

export interface TemplateUsageInfo {
  templateId: string;
  totalQrCount: number;
  totalBatchCount: number;
  qrCodes: Array<{
    id: string;
    name: string;
    slug: string;
    updated_at: string;
  }>;
}

export interface ExportedTemplateBundle {
  schemaVersion: 1;
  format: "nxtqr-template-bundle";
  exportedAt: string;
  template: {
    name: string;
    description?: string | null;
    compatibility: string[];
    is_brand_locked: boolean;
    locked_fields: string[];
    design: QrDesignV1;
  };
}
