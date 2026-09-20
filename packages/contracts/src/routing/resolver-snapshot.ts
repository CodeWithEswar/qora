/**
 * NXTQR — Edge Resolver Snapshot Contract (V1)
 * Data plane contract optimized for sub-10ms deterministic resolution in Cloudflare KV.
 * Key format: resolver:v1:<normalized-host>:<slug>
 */

import { z } from "zod";
import { QRLifecycleState } from "../qr";
import { RoutingRule } from "../routing";

export interface ResolverIdentity {
  host?: string;
  slug: string;
}

/**
 * Authoritative, centralized Cloudflare KV key builder for resolver snapshots.
 * Normalized to lowercase, strips ports, and namespaces custom domains.
 * Format: resolver:v1:<host>:<slug>
 */
export function buildResolverKvKey(identity: ResolverIdentity | { host?: string; slug: string }): string {
  const normHost = (identity.host || "global").toLowerCase().trim().replace(/:\d+$/, "");
  const normSlug = identity.slug.toLowerCase().trim();
  return `resolver:v1:${normHost}:${normSlug}`;
}

/**
 * Legacy key builder for backward-compatible edge lookups.
 * Format: qr:v1:<namespace>:<slug>
 */
export function buildLegacyQrResolverKey(slug: string, namespace = "global"): string {
  const normNamespace = namespace.toLowerCase().trim().replace(/:\d+$/, "");
  const normSlug = slug.toLowerCase().trim();
  return `qr:v1:${normNamespace}:${normSlug}`;
}

export interface DestinationRef {
  id: string;
  url: string;
  isLocked?: boolean;
}

export interface SnapshotSchedule {
  startsAt?: number; // Epoch timestamp ms
  expiresAt?: number; // Epoch timestamp ms
  timezone?: string;
}

export interface GuardianSnapshotState {
  destinationId?: string;
  state: "HEALTHY" | "DEGRADED" | "UNHEALTHY" | "UNKNOWN";
  observedAt?: string;
  policyVersion?: number;
}

export interface ExperimentVariantSnapshot {
  id: string;
  name: string;
  destinationUrl: string;
  trafficWeight: number; // Integer basis points (sum = 10000) or percentage (sum = 100)
}

export interface ExperimentSnapshot {
  id: string;
  status: "ACTIVE" | "PAUSED";
  variants: ExperimentVariantSnapshot[];
}

export interface QrResolverSnapshotV1 {
  schemaVersion: 1;
  qrId: string;
  organizationId: string;
  orgId?: string; // Backward compatible alias
  resolver?: ResolverIdentity;
  status: QRLifecycleState;
  lifecycle?: {
    status: QRLifecycleState;
    startsAt?: number;
    expiresAt?: number;
  };
  publishedRevision: number;

  defaultDestination: DestinationRef | string;
  fallbackDestination?: DestinationRef | string;

  routing?: {
    rules: RoutingRule[];
    timezone?: string;
  };
  rules?: RoutingRule[]; // Backward compatible alias

  experiment?: ExperimentSnapshot;
  guardian?: GuardianSnapshotState;
  guardianHealthy?: boolean; // Backward compatible boolean

  schedule?: SnapshotSchedule;
  startsAt?: number;
  expiresAt?: number;
  passwordHash?: string;

  publishedAt: string;
  updatedAt?: number;
}

export type RedirectSnapshot = QrResolverSnapshotV1;

/**
 * Defensive runtime validator for Edge Workers
 */
export function isValidResolverSnapshot(data: unknown): data is QrResolverSnapshotV1 {
  if (!data || typeof data !== "object") return false;
  const s = data as Partial<QrResolverSnapshotV1>;

  if (s.schemaVersion !== 1) return false;
  if (typeof s.qrId !== "string" || !s.qrId) return false;
  if (typeof s.organizationId !== "string" && typeof s.orgId !== "string") return false;
  if (!s.status || typeof s.status !== "string") return false;

  // Validate default destination
  if (typeof s.defaultDestination === "string") {
    if (!s.defaultDestination) return false;
  } else if (s.defaultDestination && typeof s.defaultDestination === "object") {
    const destObj = s.defaultDestination as DestinationRef;
    if (typeof destObj.url !== "string" || !destObj.url.trim()) return false;
  } else {
    return false;
  }

  return true;
}

export function resolveDestinationUrl(dest: DestinationRef | string | undefined | null): string | undefined {
  if (!dest) return undefined;
  if (typeof dest === "string") return dest;
  return dest.url;
}

export function resolveDestinationId(dest: DestinationRef | string | undefined | null): string | undefined {
  if (!dest) return undefined;
  if (typeof dest === "string") return dest;
  return dest.id;
}
