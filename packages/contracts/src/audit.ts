/**
 * NXTQR — Forensic Security Audit Log & Evidence Ledger Contracts
 * Immutable audit events recording forensic evidence of all security, governance, and tenancy mutations.
 */

import { z } from "zod";

export type CanonicalAuditEventCode =
  // Roles & RBAC Governance
  | "ROLE_CREATED"
  | "ROLE_UPDATED"
  | "ROLE_DELETED"
  | "ROLE_ASSIGNED"
  | "role.created"
  | "role.updated"
  | "role.deleted"
  | "role.assigned"

  // Members & Invitations
  | "MEMBER_INVITED"
  | "MEMBER_REMOVED"
  | "MEMBER_ROLE_CHANGED"
  | "member.invited"
  | "member.removed"
  | "member.role_changed"
  | "member.status_changed"

  // API Keys & Developer Tokens
  | "API_KEY_CREATED"
  | "API_KEY_REVOKED"
  | "API_KEY_UPDATED"
  | "api_key.created"
  | "api_key.revoked"

  // Webhooks & Integrations
  | "WEBHOOK_CREATED"
  | "WEBHOOK_UPDATED"
  | "WEBHOOK_DISABLED"
  | "WEBHOOK_SECRET_ROTATED"
  | "webhook.created"
  | "webhook.updated"
  | "webhook.deleted"

  // Custom Domains Governance
  | "CUSTOM_DOMAIN_ADDED"
  | "CUSTOM_DOMAIN_VERIFIED"
  | "CUSTOM_DOMAIN_REMOVED"
  | "CUSTOM_DOMAIN_PRIMARY_CHANGED"
  | "domain.added"
  | "domain.verified"
  | "domain.removed"

  // QR Asset Lifecycle & Operations
  | "QR_CREATED"
  | "QR_UPDATED"
  | "QR_DELETED"
  | "QR_DESTINATION_CHANGED"
  | "QR_PUBLISHED"
  | "QR_PAUSED"
  | "QR_RESUMED"
  | "QR_ARCHIVED"
  | "qr.created"
  | "qr.updated"
  | "qr.deleted"
  | "qr.published"

  // Routing Policies & QR Brain
  | "ROUTING_CHANGED"
  | "ROUTING_PUBLISHED"
  | "route.changed"
  | "route.published"

  // Brand Kits Identity System
  | "BRAND_KIT_CREATED"
  | "BRAND_KIT_UPDATED"
  | "BRAND_KIT_DELETED"
  | "BRAND_KIT_ARCHIVED"
  | "BRAND_KIT_PUBLISHED"

  // Teams & Resource Boundaries
  | "TEAM_CREATED"
  | "TEAM_UPDATED"
  | "TEAM_DELETED"
  | "TEAM_MEMBER_ADDED"
  | "TEAM_MEMBER_REMOVED"
  | "TEAM_RESOURCE_ASSIGNED"

  // Workspace Settings & Ownership
  | "WORKSPACE_GENERAL_UPDATED"
  | "WORKSPACE_COLLABORATION_UPDATED"
  | "WORKSPACE_OWNERSHIP_TRANSFERRED"
  | "WORKSPACE_DELETED"

  // Billing & Subscriptions
  | "BILLING_PLAN_CHANGE_REQUESTED"
  | "SUBSCRIPTION_CHANGED"
  | "billing.plan_changed"

  // Link Guardian
  | "guardian.fallback_triggered"
  | "guardian.monitor_updated"

  // Fallback string for extensible events
  | (string & {});

export type AuditActionCode = CanonicalAuditEventCode;

export type AuditResourceType =
  | "qr"
  | "route"
  | "domain"
  | "member"
  | "role"
  | "team"
  | "billing"
  | "api_key"
  | "webhook"
  | "report"
  | "share_link"
  | "policy"
  | "brand_kit"
  | "organization"
  | (string & {});

export type AuditActorType =
  | "user"
  | "api_key"
  | "system"
  | "webhook"
  | "scheduled_job"
  | "service";

export type AuditEventResult =
  | "success"
  | "failed"
  | "denied"
  | "partial"
  | "pending";

export type AuditCategory =
  | "all"
  | "access"
  | "content"
  | "infrastructure"
  | "billing"
  | "developer"
  | "security"
  | "system";

export interface AuditActorSnapshot {
  id: string;
  type: AuditActorType;
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string | null;
}

export interface AuditTargetSnapshot {
  type: string;
  id: string;
  name: string;
  identifier?: string;
}

export interface AuditChangeItem {
  field: string;
  label?: string;
  before: unknown;
  after: unknown;
}

export interface AuditAuthorizationContext {
  permission?: string;
  decision: "allowed" | "denied";
  role?: string;
  reason?: string;
  entitlement?: string;
}

export interface AuditRequestContext {
  requestId?: string;
  correlationId?: string;
  method?: string;
  route?: string;
  source?: string;
  ipHash?: string;
  userAgentSummary?: string;
}

export interface AuditEvidenceRecord {
  id: string;
  organizationId: string;
  occurredAt: string; // ISO 8601
  timestamp: number;  // Epoch ms
  action: string;
  actionLabel: string;
  category: AuditCategory;
  actor: AuditActorSnapshot;
  target: AuditTargetSnapshot;
  result: AuditEventResult;
  source: string;
  summary: string;
  changes: AuditChangeItem[];
  authorization?: AuditAuthorizationContext;
  request?: AuditRequestContext;
  rawMetadata?: Record<string, unknown>;
  correlationCount?: number;
  hasDiff: boolean;
}

export interface AuditSignalMetrics {
  totalEvents: number;
  totalActors: number;
  totalResources: number;
  failedOperations: number;
  timeRange: string;
}

export interface AuditDensityPoint {
  timeBucket: string;
  timestamp: number;
  count: number;
  categories: Record<string, number>;
}

export interface AuditLedgerOverview {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  metrics: AuditSignalMetrics;
  density: AuditDensityPoint[];
  lensCounts: Record<string, number>; // all, access, content, infra, billing, dev
  events: AuditEvidenceRecord[];
  nextCursor: string | null;
  hasMore: boolean;
  actors: Array<{ id: string; name: string; email?: string; type: string }>;
  actions: Array<{ code: string; label: string; category: string }>;
  resourceTypes: Array<{ type: string; label: string; count: number }>;
}

// Backward-compatible entry
export interface AuditLogEntry {
  id: string;
  organizationId: string;
  actorId: string;
  action: AuditActionCode;
  resourceType: AuditResourceType;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipHash?: string;
  timestamp: number;
  createdAt?: string;
}

// Zod Schemas
export const AuditFilterParamsSchema = z.object({
  range: z.enum(["today", "24h", "7d", "30d", "90d", "custom"]).optional().default("30d"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  lens: z.enum(["all", "access", "content", "infrastructure", "billing", "developer"]).optional().default("all"),
  actorId: z.string().optional(),
  actorType: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  result: z.enum(["all", "success", "failed", "denied"]).optional().default("all"),
  search: z.string().optional(),
  myActions: z.boolean().optional(),
  hasChanges: z.boolean().optional(),
  correlationId: z.string().optional(),
  eventId: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(25),
});
export type AuditFilterParams = z.infer<typeof AuditFilterParamsSchema>;

export const ExportAuditLogsDtoSchema = z.object({
  format: z.enum(["csv", "json"]).default("csv"),
  range: z.enum(["today", "24h", "7d", "30d", "90d", "custom"]).default("30d"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  lens: z.string().optional(),
  category: z.string().optional(),
  action: z.string().optional(),
  actorId: z.string().optional(),
  resourceType: z.string().optional(),
  result: z.string().optional(),
});
export type ExportAuditLogsDto = z.infer<typeof ExportAuditLogsDtoSchema>;
