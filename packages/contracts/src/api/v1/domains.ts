/**
 * NXTQR — Custom Domain Infrastructure & Brand Routing Contracts (V1)
 * Enforces strict typing for domain lifecycles, DNS requirements,
 * edge namespace mappings, and cascade impact analysis.
 */

import { z } from "zod";

// 1. Domain Enums
export const DomainStatusSchema = z.enum([
  "PENDING",
  "VERIFYING",
  "ACTIVE",
  "FAILED",
  "ARCHIVED",
]);
export type DomainStatus = z.infer<typeof DomainStatusSchema>;

export const DomainVerificationStatusSchema = z.enum([
  "PENDING",
  "VERIFYING",
  "VERIFIED",
  "FAILED",
]);
export type DomainVerificationStatus = z.infer<typeof DomainVerificationStatusSchema>;

export const DomainVerificationMethodSchema = z.enum([
  "DNS_TXT",
  "DNS_CNAME",
]);
export type DomainVerificationMethod = z.infer<typeof DomainVerificationMethodSchema>;

export const DomainCertificateStatusSchema = z.enum([
  "PENDING",
  "PROVISIONING",
  "READY",
  "ERROR",
]);
export type DomainCertificateStatus = z.infer<typeof DomainCertificateStatusSchema>;

export const DomainRoutingStatusSchema = z.enum([
  "READY",
  "NOT_CONFIGURED",
  "DISABLED",
  "ERROR",
]);
export type DomainRoutingStatus = z.infer<typeof DomainRoutingStatusSchema>;

// 2. DNS Record Schema
export const DomainDnsRecordSchema = z.object({
  type: z.enum(["TXT", "CNAME"]),
  name: z.string().min(1),
  value: z.string().min(1),
  status: z.enum(["VERIFIED", "PENDING", "INVALID"]),
  ttl: z.number().optional().default(300),
  description: z.string().optional(),
});
export type DomainDnsRecord = z.infer<typeof DomainDnsRecordSchema>;

// 3. Verification Attempt Schema
export const DomainVerificationAttemptV1Schema = z.object({
  id: z.string().uuid(),
  method: z.string(),
  status: z.enum(["SUCCESS", "FAILED"]),
  details: z.record(z.string(), z.unknown()).default({}),
  attemptedAt: z.string(),
});
export type DomainVerificationAttemptV1 = z.infer<typeof DomainVerificationAttemptV1Schema>;

// 4. Domain Summary Schema (List View)
export const CustomDomainSummaryV1Schema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  hostname: z.string().min(1),
  status: DomainStatusSchema,
  verificationStatus: DomainVerificationStatusSchema,
  verificationMethod: DomainVerificationMethodSchema,
  certificateStatus: DomainCertificateStatusSchema,
  routingStatus: DomainRoutingStatusSchema,
  isPrimary: z.boolean(),
  assignedQrsCount: z.number().int().nonnegative(),
  assignedCampaignsCount: z.number().int().nonnegative(),
  assignedLandingPagesCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  verifiedAt: z.string().nullable().optional(),
  activatedAt: z.string().nullable().optional(),
  archivedAt: z.string().nullable().optional(),
});
export type CustomDomainSummaryV1 = z.infer<typeof CustomDomainSummaryV1Schema>;

// 5. Domain Detail Schema (Inspector View)
export const CustomDomainDetailV1Schema = CustomDomainSummaryV1Schema.extend({
  verificationToken: z.string(),
  verificationRecords: z.array(DomainDnsRecordSchema),
  lastCheckedAt: z.string().nullable().optional(),
  updatedAt: z.string(),
  createdBy: z.string().nullable().optional(),
  recentAttempts: z.array(DomainVerificationAttemptV1Schema).optional().default([]),
});
export type CustomDomainDetailV1 = z.infer<typeof CustomDomainDetailV1Schema>;

// 6. Pulse & Summary Metrics
export const DomainPulseMetricsV1Schema = z.object({
  totalDomains: z.number().int().nonnegative(),
  activeDomains: z.number().int().nonnegative(),
  pendingDomains: z.number().int().nonnegative(),
  issuesDomains: z.number().int().nonnegative(),
  totalAssignedAssets: z.number().int().nonnegative(),
});
export type DomainPulseMetricsV1 = z.infer<typeof DomainPulseMetricsV1Schema>;

// 7. Domain Dependency Impact Schema
export const DomainImpactV1Schema = z.object({
  domainId: z.string().uuid(),
  hostname: z.string(),
  connectedQrs: z.number().int().nonnegative(),
  connectedCampaigns: z.number().int().nonnegative(),
  connectedLandingPages: z.number().int().nonnegative(),
  isPrimary: z.boolean(),
  canSafelyDisconnect: z.boolean(),
});
export type DomainImpactV1 = z.infer<typeof DomainImpactV1Schema>;

// 8. Safe Domain Projection for QR Studio / Redirection
export const DomainProjectionV1Schema = z.object({
  domainId: z.string().uuid(),
  hostname: z.string(),
  status: DomainStatusSchema,
  routingReady: z.boolean(),
  isPrimary: z.boolean(),
});
export type DomainProjectionV1 = z.infer<typeof DomainProjectionV1Schema>;

// 9. API Request Schemas
export const CreateCustomDomainRequestV1Schema = z.object({
  hostname: z.string().min(3).max(253),
  verificationMethod: DomainVerificationMethodSchema.optional().default("DNS_TXT"),
});
export type CreateCustomDomainRequestV1 = z.infer<typeof CreateCustomDomainRequestV1Schema>;

export const UpdateCustomDomainRequestV1Schema = z.object({
  isPrimary: z.boolean().optional(),
  routingStatus: z.enum(["READY", "DISABLED"]).optional(),
});
export type UpdateCustomDomainRequestV1 = z.infer<typeof UpdateCustomDomainRequestV1Schema>;

export const VerifyCustomDomainResponseV1Schema = z.object({
  verified: z.boolean(),
  message: z.string(),
  domain: CustomDomainDetailV1Schema,
});
export type VerifyCustomDomainResponseV1 = z.infer<typeof VerifyCustomDomainResponseV1Schema>;
