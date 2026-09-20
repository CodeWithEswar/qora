import { z } from "zod";

/**
 * NXTQR — Brand Kits Domain Contracts (V1)
 * Authoritative schemas and contracts for the Brand Identity System:
 * color tokens, typography, logo assets, QR style presets, guidelines,
 * immutable version snapshots, and governance guardrails.
 */

/* =========================================================================
   1. COLOR TOKEN SCHEMAS
   ========================================================================= */

export const BrandColorRoleSchema = z.enum([
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
  "foreground",
  "muted",
  "border",
  "qr_foreground",
  "qr_background",
  "frame",
]);
export type BrandColorRole = z.infer<typeof BrandColorRoleSchema>;

export const BrandColorTokenSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Token name is required"),
  role: BrandColorRoleSchema,
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hex code (e.g. #FA520F)"),
  description: z.string().optional(),
  rgb: z.string().optional(),
  hsl: z.string().optional(),
});
export type BrandColorToken = z.infer<typeof BrandColorTokenSchema>;

/* =========================================================================
   2. TYPOGRAPHY SCHEMAS
   ========================================================================= */

export const BrandTypographyFontSchema = z.object({
  fontFamily: z.string().min(1),
  label: z.string().min(1),
  sampleText: z.string().optional(),
});
export type BrandTypographyFont = z.infer<typeof BrandTypographyFontSchema>;

export const BrandTypographyConfigSchema = z.object({
  display: BrandTypographyFontSchema.default({
    fontFamily: "var(--font-editorial, 'Instrument Serif', Georgia, serif)",
    label: "Instrument Serif",
    sampleText: "Intelligence behind every scan.",
  }),
  ui: BrandTypographyFontSchema.default({
    fontFamily: "var(--font-sans, 'Inter', -apple-system, sans-serif)",
    label: "Inter",
    sampleText: "Dynamic QR Routing & Digital Infrastructure",
  }),
  mono: BrandTypographyFontSchema.default({
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    label: "JetBrains Mono",
    sampleText: "HEX #FA520F | 28.00mm x 28.00mm",
  }),
});
export type BrandTypographyConfig = z.infer<typeof BrandTypographyConfigSchema>;

/* =========================================================================
   3. LOGO ASSET SCHEMAS
   ========================================================================= */

export const BrandLogoVariantSchema = z.enum([
  "primary",
  "secondary",
  "monochrome",
  "mark",
  "light",
  "dark",
]);
export type BrandLogoVariant = z.infer<typeof BrandLogoVariantSchema>;

export const BrandLogoAssetSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  variant: BrandLogoVariantSchema.default("primary"),
  url: z.string().url("Valid logo URL is required"),
  fileId: z.string().optional(),
  format: z.string().default("svg"),
  width: z.number().optional(),
  height: z.number().optional(),
  sizeBytes: z.number().optional(),
  isPrimary: z.boolean().default(false),
  safeAreaPadding: z.number().min(0).max(64).default(8),
});
export type BrandLogoAsset = z.infer<typeof BrandLogoAssetSchema>;

/* =========================================================================
   4. QR STYLE PRESETS SCHEMAS
   ========================================================================= */

export const BrandQrPresetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Preset name is required"),
  description: z.string().default(""),
  isDefault: z.boolean().default(false),
  design: z.record(z.string(), z.any()), // Valid QrDesignV1 structure
  createdAt: z.string().optional(),
});
export type BrandQrPreset = z.infer<typeof BrandQrPresetSchema>;

/* =========================================================================
   5. GUIDELINES SCHEMAS
   ========================================================================= */

export const BrandGuidelinesSchema = z.object({
  brandVoice: z.string().default(""),
  logoUsage: z.string().default(""),
  colorUsage: z.string().default(""),
  qrUsage: z.string().default(""),
  doRules: z.array(z.string()).default([]),
  dontRules: z.array(z.string()).default([]),
});
export type BrandGuidelines = z.infer<typeof BrandGuidelinesSchema>;

/* =========================================================================
   6. GOVERNANCE & GUARDRAILS SCHEMAS
   ========================================================================= */

export const CANONICAL_BRAND_GUIDELINES_DEFAULTS: BrandGuidelines = {
  brandVoice: "",
  logoUsage: "",
  colorUsage: "",
  qrUsage: "",
  doRules: [],
  dontRules: [],
};

export const BrandGovernanceSchema = z.object({
  allowCustomColors: z.boolean().default(true),
  allowCustomLogos: z.boolean().default(true),
  allowQrStyleOverrides: z.boolean().default(true),
  requireApprovedTemplate: z.boolean().default(false),
  enforceScanabilityLevel: z.enum(["none", "warning", "strict"]).default("warning"),
  lockedFields: z.array(z.string()).default([]),
});
export type BrandGovernance = z.infer<typeof BrandGovernanceSchema>;

export const CANONICAL_BRAND_GOVERNANCE_DEFAULTS: BrandGovernance = {
  allowCustomColors: true,
  allowCustomLogos: true,
  allowQrStyleOverrides: true,
  requireApprovedTemplate: false,
  enforceScanabilityLevel: "warning",
  lockedFields: [],
};

/* =========================================================================
   7. BRAND KIT SUMMARY & DETAIL ENTITIES
   ========================================================================= */

export const BrandResourceAssignmentSummarySchema = z.object({
  connectedQrs: z.number().default(0),
  connectedLandingPages: z.number().default(0),
  connectedCampaigns: z.number().default(0),
  connectedAssets: z.number().default(0),
});
export type BrandResourceAssignmentSummary = z.infer<typeof BrandResourceAssignmentSummarySchema>;

export const BrandKitSummaryV1Schema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]),
  isDefault: z.boolean(),
  primaryColor: z.string(),
  logoUrl: z.string().nullable().optional(),
  publishedRevision: z.number(),
  qrCount: z.number().default(0),
  assetCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable().optional(),
});
export type BrandKitSummaryV1 = z.infer<typeof BrandKitSummaryV1Schema>;

export const BrandKitDetailV1Schema = BrandKitSummaryV1Schema.extend({
  colors: z.array(BrandColorTokenSchema).default([]),
  typography: BrandTypographyConfigSchema.default({} as any),
  logos: z.array(BrandLogoAssetSchema).default([]),
  qrPresets: z.array(BrandQrPresetSchema).default([]),
  guidelines: BrandGuidelinesSchema.default({} as any),
  governance: BrandGovernanceSchema.default({} as any),
  resourceSummary: BrandResourceAssignmentSummarySchema.default({} as any),
});
export type BrandKitDetailV1 = z.infer<typeof BrandKitDetailV1Schema>;

/* =========================================================================
   8. IMMUTABLE VERSION SNAPSHOT SCHEMAS
   ========================================================================= */

export const BrandKitVersionV1Schema = z.object({
  id: z.string(),
  organizationId: z.string(),
  brandKitId: z.string(),
  versionNumber: z.number(),
  name: z.string(),
  snapshot: z.record(z.string(), z.any()),
  changeSummary: z.string(),
  createdBy: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type BrandKitVersionV1 = z.infer<typeof BrandKitVersionV1Schema>;

/* =========================================================================
   9. WORKSPACE PULSE METRICS
   ========================================================================= */

export const BrandKitPulseMetricsSchema = z.object({
  totalKits: z.number(),
  activeKits: z.number(),
  totalAssignedQrs: z.number(),
  totalBrandAssets: z.number(),
  totalQrPresets: z.number(),
});
export type BrandKitPulseMetrics = z.infer<typeof BrandKitPulseMetricsSchema>;

/* =========================================================================
   10. REQUEST DTO SCHEMAS
   ========================================================================= */

export const CreateBrandKitRequestV1Schema = z.object({
  name: z.string().min(1, "Brand kit name is required").max(100),
  description: z.string().max(500).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hex code")
    .default("#FA520F"),
  secondaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hex code")
    .optional(),
  logoUrl: z.string().url().optional(),
  isDefault: z.boolean().default(false),
  initialTemplate: z.enum(["blank", "starter"]).default("blank"),
});
export type CreateBrandKitRequestV1 = z.infer<typeof CreateBrandKitRequestV1Schema>;

export const UpdateBrandKitRequestV1Schema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  logoUrl: z.string().url().nullable().optional(),
  isDefault: z.boolean().optional(),
  colors: z.array(BrandColorTokenSchema).optional(),
  typography: BrandTypographyConfigSchema.optional(),
  logos: z.array(BrandLogoAssetSchema).optional(),
  qrPresets: z.array(BrandQrPresetSchema).optional(),
  guidelines: BrandGuidelinesSchema.optional(),
  governance: BrandGovernanceSchema.optional(),
});
export type UpdateBrandKitRequestV1 = z.infer<typeof UpdateBrandKitRequestV1Schema>;

export const PublishBrandKitRequestV1Schema = z.object({
  changeSummary: z
    .string()
    .min(1, "Please describe the changes in this published revision")
    .max(500),
});
export type PublishBrandKitRequestV1 = z.infer<typeof PublishBrandKitRequestV1Schema>;

export const DuplicateBrandKitRequestV1Schema = z.object({
  name: z.string().min(1, "Name is required for the duplicate kit").max(100),
});
export type DuplicateBrandKitRequestV1 = z.infer<typeof DuplicateBrandKitRequestV1Schema>;

export const BrandKitCollectionQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["all", "active", "archived"]).default("active"),
  isDefault: z.boolean().optional(),
  sortBy: z.enum(["updatedAt", "createdAt", "name"]).default("updatedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});
export type BrandKitCollectionQuery = z.infer<typeof BrandKitCollectionQuerySchema>;

/* =========================================================================
   11. BRAND KIT ↔ QR STUDIO PROJECTION CONTRACT
   ========================================================================= */

export const BrandKitQrProjectionSchema = z.object({
  brandKitId: z.string(),
  name: z.string(),
  versionNumber: z.number(),
  palette: z.array(BrandColorTokenSchema),
  approvedLogos: z.array(BrandLogoAssetSchema),
  qrPresets: z.array(BrandQrPresetSchema),
  governance: BrandGovernanceSchema,
});
export type BrandKitQrProjection = z.infer<typeof BrandKitQrProjectionSchema>;
