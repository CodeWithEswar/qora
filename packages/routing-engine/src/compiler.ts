/**
 * NXTQR — Route Snapshot Compiler
 * Compiles rich editable D1 rule definitions into compact, edge-optimized QrResolverSnapshotV1 for Cloudflare KV.
 * Ensures zero editor-bloat on the redirect data plane.
 */

import {
  RoutingRule,
  QrResolverSnapshotV1,
  MAX_SNAPSHOT_BYTES,
} from "@nxtqr/contracts";
import { normalizeFieldName } from "./registry";

export interface CompileSnapshotOptions {
  qrId: string;
  organizationId: string;
  slug: string;
  host?: string;
  publishedRevision: number;
  defaultDestinationUrl: string;
  defaultDestinationId?: string;
  fallbackDestinationUrl?: string;
  fallbackDestinationId?: string;
  timezone?: string;
  status?: "ACTIVE" | "PAUSED" | "DRAFT" | "ARCHIVED";
}

export interface CompileResult {
  snapshot: QrResolverSnapshotV1;
  byteSize: number;
  rulesCount: number;
}

/**
 * Compiles rules into compact edge snapshot.
 */
export function compileResolverSnapshot(
  rules: RoutingRule[],
  options: CompileSnapshotOptions
): CompileResult {
  // Filter active rules and clean up fields
  const compiledRules: RoutingRule[] = rules
    .filter((r) => r.isActive)
    .sort((a, b) => (a.priority === b.priority ? a.id.localeCompare(b.id) : a.priority - b.priority))
    .map((r) => ({
      id: r.id,
      qrId: options.qrId,
      name: r.name.slice(0, 64),
      priority: r.priority,
      isActive: true,
      matchType: r.matchType || "ALL",
      conditions: (r.conditions || []).map((c) => ({
        id: c.id,
        type: normalizeFieldName((c as any).field || (c as any).type) as any,
        operator: (c.operator === "not_in" ? "nin" : c.operator) as any,
        value: c.value,
        paramName: c.paramName,
      })),
      action: {
        type: r.action?.type || "redirect",
        destinationUrl: r.action?.destinationUrl,
        destinationId: r.action?.destinationId,
      },
    }));

  const snapshot: QrResolverSnapshotV1 = {
    schemaVersion: 1,
    qrId: options.qrId,
    organizationId: options.organizationId,
    resolver: {
      host: options.host || "global",
      slug: options.slug,
    },
    status: (options.status as any) || "ACTIVE",
    lifecycle: {
      status: (options.status as any) || "ACTIVE",
    },
    publishedRevision: options.publishedRevision,
    defaultDestination: {
      id: options.defaultDestinationId || `dest_${options.qrId.slice(-8)}`,
      url: options.defaultDestinationUrl,
    },
    fallbackDestination: options.fallbackDestinationUrl
      ? {
          id: options.fallbackDestinationId || `fb_${options.qrId.slice(-8)}`,
          url: options.fallbackDestinationUrl,
        }
      : undefined,
    routing: {
      rules: compiledRules,
      timezone: options.timezone || "UTC",
    },
    publishedAt: new Date().toISOString(),
  };

  const jsonStr = JSON.stringify(snapshot);
  const byteSize = new TextEncoder().encode(jsonStr).length;

  if (byteSize > MAX_SNAPSHOT_BYTES) {
    throw new Error(
      `Compiled resolver snapshot size (${byteSize} bytes) exceeds maximum limit of ${MAX_SNAPSHOT_BYTES} bytes.`
    );
  }

  return {
    snapshot,
    byteSize,
    rulesCount: compiledRules.length,
  };
}
