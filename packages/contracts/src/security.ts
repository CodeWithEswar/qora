/**
 * NXTQR — Security & Enterprise Policy Contracts
 * Data structures for multi-tenant policies, credentials, destination controls, and rate limits.
 */

export type DestinationPolicyMode = "ALLOWLIST" | "DENYLIST" | "LOCKED_DOMAINS" | "NONE";

export interface DestinationPolicy {
  mode: DestinationPolicyMode;
  allowedDomains: string[];
  deniedDomains: string[];
}

export interface OrganizationSecurityPolicy {
  requireSso: boolean;
  shareLinksAllowed: boolean;
  publicExportsAllowed: boolean;
  apiKeysAllowed: boolean;
  webhooksAllowed: boolean;
  destinationPolicy: DestinationPolicy;
  retentionDays: number;
}

export const DEFAULT_SECURITY_POLICY: OrganizationSecurityPolicy = {
  requireSso: false,
  shareLinksAllowed: true,
  publicExportsAllowed: true,
  apiKeysAllowed: true,
  webhooksAllowed: true,
  destinationPolicy: {
    mode: "NONE",
    allowedDomains: [],
    deniedDomains: [],
  },
  retentionDays: 365, // 1 year default retention
};

export interface ApiKeyCreateResult {
  id: string;
  name: string;
  prefix: string; // e.g. "nxtqr_live_••••4f8k"
  rawSecret: string; // Full plaintext secret: shown ONCE to user on creation
  keyHash: string; // SHA-256 hash stored at rest
  scopes: string[];
  createdAt: number;
}

export interface ShareLinkCreateResult {
  id: string;
  rawToken: string; // High-entropy bearer token (shown once / in URL)
  tokenHash: string; // SHA-256 hash stored at rest
  shareUrl: string;
  permission: "view" | "edit";
  expiresAt?: number;
}

export interface RateLimitRule {
  plane:
    | "PUBLIC_REDIRECT"
    | "AUTHENTICATED_DASHBOARD"
    | "PUBLIC_SHARE_LINKS"
    | "DEVELOPER_API"
    | "AUTH_SECURITY"
    | "REPORT_EXPORTS"
    | "WEBHOOK_REPLAY"
    | "INVITATIONS";
  windowSeconds: number;
  maxRequests: number;
}

export const RATE_LIMIT_RULES: Record<RateLimitRule["plane"], RateLimitRule> = {
  PUBLIC_REDIRECT: { plane: "PUBLIC_REDIRECT", windowSeconds: 60, maxRequests: 2000 },
  AUTHENTICATED_DASHBOARD: { plane: "AUTHENTICATED_DASHBOARD", windowSeconds: 60, maxRequests: 300 },
  PUBLIC_SHARE_LINKS: { plane: "PUBLIC_SHARE_LINKS", windowSeconds: 60, maxRequests: 60 },
  DEVELOPER_API: { plane: "DEVELOPER_API", windowSeconds: 60, maxRequests: 600 },
  AUTH_SECURITY: { plane: "AUTH_SECURITY", windowSeconds: 60, maxRequests: 10 },
  REPORT_EXPORTS: { plane: "REPORT_EXPORTS", windowSeconds: 300, maxRequests: 10 },
  WEBHOOK_REPLAY: { plane: "WEBHOOK_REPLAY", windowSeconds: 60, maxRequests: 30 },
  INVITATIONS: { plane: "INVITATIONS", windowSeconds: 300, maxRequests: 20 },
};

export interface DataRetentionPolicy {
  domain: "analytics" | "audit" | "activity" | "webhooks" | "api_logs" | "reports" | "guardian_checks";
  retentionDays: number;
  archiveStrategy?: "R2_COLD" | "PURGE";
}
