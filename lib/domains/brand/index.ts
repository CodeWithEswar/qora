/**
 * NXTQR — 06 Brand Bounded Context
 * Responsibilities: Brand kits, brand assets in R2, approved templates, custom domains, DNS verification.
 * Invariants:
 * - Brand assets stored in R2; ownership metadata stored in D1.
 * - Custom domains are never active on submission; must undergo strict DNS TXT verification.
 */

import { InvalidStateTransitionError, ValidationError } from "../shared/errors";

export type CustomDomainStatus = "PENDING" | "VERIFYING" | "ACTIVE" | "ERROR" | "SUSPENDED";

export interface BrandKitEntity {
  id: string;
  organizationId: string;
  name: string;
  primaryColor: string;
  palette: string[];
  logoR2Key?: string;
  lockedByAdmin: boolean;
  createdAt: number;
}

export interface CustomDomainEntity {
  id: string;
  organizationId: string;
  domain: string;
  status: CustomDomainStatus;
  verificationToken: string;
  sslActive: boolean;
  verifiedAt?: number;
  createdAt: number;
}

const VALID_DOMAIN_TRANSITIONS: Record<CustomDomainStatus, CustomDomainStatus[]> = {
  PENDING: ["VERIFYING", "ERROR", "SUSPENDED"],
  VERIFYING: ["ACTIVE", "ERROR", "PENDING", "SUSPENDED"],
  ACTIVE: ["SUSPENDED", "ERROR"],
  ERROR: ["VERIFYING", "PENDING", "SUSPENDED"],
  SUSPENDED: ["PENDING"],
};

export function assertValidDomainTransition(
  current: CustomDomainStatus,
  target: CustomDomainStatus
): void {
  if (current === target) return;
  const allowed = VALID_DOMAIN_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    throw new InvalidStateTransitionError(`Cannot transition domain from ${current} to ${target}`);
  }
}

export function validateDomainHostname(hostname: string): string {
  const clean = (hostname || "").trim().toLowerCase();
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
  if (!domainRegex.test(clean)) {
    throw new ValidationError(`'${hostname}' is not a valid fully-qualified domain name (FQDN)`);
  }
  return clean;
}

export function generateBrandAssetR2Key(organizationId: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "png";
  const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return `brands/${organizationId}/${uniqueId}.${ext}`;
}
