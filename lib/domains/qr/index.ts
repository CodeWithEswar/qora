/**
 * NXTQR — 03 QR Core Bounded Context
 * Responsibilities: QR assets, lifecycles, designs, short slugs, revisions, and resolver publication.
 * Invariants:
 * - D1 holds authoritative rich state; KV holds disposable compact resolver snapshots.
 * - Allowed lifecycle transitions are strictly enforced.
 * - Slugs must be normalized, reserved-name protected, and unique.
 */

import { InvalidStateTransitionError, ValidationError } from "../shared/errors";
import {
  QRAsset,
  QRDesignConfig,
  QRDestinationConfig,
  QRLifecycleState,
  QRType,
  RedirectSnapshot,
  QrResolverSnapshotV1,
} from "@nxtqr/contracts";

import {
  assertValidQRTransition,
  normalizeAndValidateSlug,
} from "@nxtqr/qr-core";

export {
  assertValidQRTransition,
  normalizeAndValidateSlug,
};

/**
 * Compiles a rich D1 QR Asset and active routing rules into a minimal, edge-ready RedirectSnapshot for KV.
 */
export function compileResolverSnapshot(
  asset: QRAsset,
  activeRules: Array<{
    id: string;
    name: string;
    priority: number;
    destinationUrl: string;
    matchType: "ALL" | "ANY";
    actionType: string;
    conditions?: any[];
  }> = [],
  guardianHealthy = true,
  publishedRevision = 1
): QrResolverSnapshotV1 {
  return {
    schemaVersion: 1,
    qrId: asset.id,
    organizationId: asset.organizationId,
    orgId: asset.organizationId,
    status: asset.status,
    publishedRevision,
    defaultDestination: asset.destination.defaultUrl,
    fallbackDestination: asset.destination.fallbackUrl || undefined,
    passwordHash: asset.destination.passwordHash,
    guardian: {
      state: guardianHealthy ? "HEALTHY" : "UNHEALTHY",
      observedAt: new Date().toISOString(),
    },
    guardianHealthy,
    schedule: {
      startsAt: asset.destination.startsAt,
      expiresAt: asset.destination.expiresAt,
    },
    startsAt: asset.destination.startsAt,
    expiresAt: asset.destination.expiresAt,
    publishedAt: new Date().toISOString(),
    updatedAt: asset.updatedAt,
    rules: activeRules.map((r) => ({
      id: r.id,
      qrId: asset.id,
      name: r.name,
      priority: r.priority,
      isActive: true,
      matchType: r.matchType,
      conditions: r.conditions || [],
      action: {
        type: r.actionType as any,
        destinationUrl: r.destinationUrl,
      },
    })),
  };
}

/**
 * Centralized, authoritative KV resolver key builder for edge snapshots.
 * Prevents key collision between global NXTQR domain and custom domains.
 * Format: qr:v1:<namespace>:<slug>
 */
export function buildKvResolverKey(slug: string, domain = "global"): string {
  const normalizedDomain = (domain || "global").toLowerCase().trim();
  const normalizedSlug = (slug || "").toLowerCase().trim();
  return `qr:v1:${normalizedDomain}:${normalizedSlug}`;
}


