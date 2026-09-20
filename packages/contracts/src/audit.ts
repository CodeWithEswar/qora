/**
 * NXTQR — Forensic Security Audit Log Contracts
 * Immutable audit events recording forensic evidence of all security, governance, and tenancy mutations.
 */

export type CanonicalAuditEventCode =
  // Roles & RBAC Governance
  | "ROLE_CREATED"
  | "ROLE_UPDATED"
  | "ROLE_DELETED"
  | "ROLE_ASSIGNED"

  // Members & Invitations
  | "MEMBER_INVITED"
  | "MEMBER_REMOVED"
  | "MEMBER_ROLE_CHANGED"
  | "member.invited" // Backward compatible alias
  | "member.removed" // Backward compatible alias
  | "role.changed"   // Backward compatible alias

  // API Keys
  | "API_KEY_CREATED"
  | "API_KEY_REVOKED"
  | "api_key.created" // Backward compatible alias
  | "api_key.revoked" // Backward compatible alias

  // Webhooks
  | "WEBHOOK_CREATED"
  | "WEBHOOK_UPDATED"
  | "WEBHOOK_DISABLED"
  | "WEBHOOK_SECRET_ROTATED"

  // Custom Domains
  | "CUSTOM_DOMAIN_ADDED"
  | "CUSTOM_DOMAIN_VERIFIED"
  | "CUSTOM_DOMAIN_REMOVED"
  | "domain.added"    // Backward compatible alias
  | "domain.verified" // Backward compatible alias

  // QR Asset Lifecycle
  | "QR_CREATED"
  | "QR_UPDATED"
  | "QR_DELETED"
  | "QR_DESTINATION_CHANGED"
  | "QR_PUBLISHED"
  | "QR_PAUSED"
  | "QR_RESUMED"
  | "QR_ARCHIVED"
  | "qr.created"   // Backward compatible alias
  | "qr.updated"   // Backward compatible alias
  | "qr.deleted"   // Backward compatible alias
  | "qr.published" // Backward compatible alias

  // Routing Policies
  | "ROUTING_CHANGED"
  | "ROUTING_PUBLISHED"
  | "route.changed"   // Backward compatible alias
  | "route.published" // Backward compatible alias

  // Experiments
  | "EXPERIMENT_ACTIVATED"
  | "EXPERIMENT_CHANGED"

  // Reports & Exports
  | "REPORT_EXPORTED"
  | "REPORT_SHARED"

  // Share Links
  | "SHARE_LINK_CREATED"
  | "SHARE_LINK_REVOKED"

  // Billing & Subscriptions
  | "BILLING_PLAN_CHANGE_REQUESTED"
  | "SUBSCRIPTION_CHANGED"
  | "billing.plan_changed" // Backward compatible alias

  // Enterprise Security Policy
  | "SECURITY_POLICY_CHANGED"

  // Brand Kits Identity System
  | "BRAND_KIT_CREATED"
  | "BRAND_KIT_UPDATED"
  | "BRAND_KIT_DELETED"
  | "BRAND_KIT_ARCHIVED"
  | "BRAND_KIT_PUBLISHED"

  // Link Guardian
  | "guardian.fallback_triggered";

export type AuditActionCode = CanonicalAuditEventCode;

export type AuditResourceType =
  | "qr"
  | "route"
  | "domain"
  | "member"
  | "role"
  | "billing"
  | "api_key"
  | "webhook"
  | "report"
  | "share_link"
  | "policy"
  | "brand_kit"
  | "organization";

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  actorId: string; // User ID or 'system' / 'api_key:{id}'
  action: AuditActionCode;
  resourceType: AuditResourceType;
  resourceId: string;
  metadata?: Record<string, unknown>; // Minimized, zero secrets
  ipHash?: string; // Daily salted hash (privacy compliant)
  timestamp: number; // Unix epoch ms
  createdAt?: string; // ISO 8601 string
}
