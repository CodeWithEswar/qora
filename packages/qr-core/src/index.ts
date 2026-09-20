/**
 * @nxtqr/qr-core
 * Flagship QR Core Domain: content encoding, design schema, deterministic matrix & vector SVG,
 * print PDF export, mathematical scanability diagnostics, and edge resolver compilation.
 */

// 1. Content Domain
export * from "./content/schema";
export * from "./content/encoders";
export * from "./content/registry";

// 2. Design Domain
export * from "./design/schema";
export * from "./design/defaults";

// 3. Encoder & Matrix
export * from "./encoder/matrix";

// 4. Renderer
export * from "./renderer/svg";

// 5. Scanability
export * from "./scanability";

// 6. Exports
export * from "./export/presets";
export * from "./export/svg";
export * from "./export/pdf";

// 7. Slugs & Identifier Generation
export * from "./slug";

// 8. Legacy Lifecycle & Resolver Snapshot Compilation (Preserved)
import {
  QRLifecycleState,
  QRAsset,
  QrResolverSnapshotV1,
  InvalidStateTransitionError,
  ValidationError,
} from "@nxtqr/contracts";

const VALID_LIFECYCLE_TRANSITIONS: Record<QRLifecycleState, QRLifecycleState[]> = {
  DRAFT: ["ACTIVE", "SCHEDULED", "ARCHIVED"],
  ACTIVE: ["PAUSED", "EXPIRED", "ARCHIVED"],
  PAUSED: ["ACTIVE", "ARCHIVED"],
  SCHEDULED: ["ACTIVE", "ARCHIVED"],
  EXPIRED: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [], // Terminal
};

export function assertValidQRTransition(
  currentState: QRLifecycleState,
  targetState: QRLifecycleState
): void {
  if (currentState === targetState) return;
  const allowed = VALID_LIFECYCLE_TRANSITIONS[currentState] || [];
  if (!allowed.includes(targetState)) {
    throw new InvalidStateTransitionError(
      `Invalid QR state transition from '${currentState}' to '${targetState}'. Allowed: [${allowed.join(", ")}]`
    );
  }
}

const RESERVED_SLUGS = new Set([
  "api",
  "app",
  "auth",
  "dashboard",
  "health",
  "_health",
  "login",
  "signup",
  "register",
  "logout",
  "admin",
  "static",
  "assets",
  "s",
]);

export function normalizeAndValidateSlug(rawSlug: string): string {
  const normalized = (rawSlug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "");

  if (normalized.length < 3 || normalized.length > 64) {
    throw new ValidationError("QR slug must be between 3 and 64 characters (alphanumeric, dashes, underscores)");
  }

  if (RESERVED_SLUGS.has(normalized)) {
    throw new ValidationError(`The short slug '${normalized}' is reserved by NXTQR system infrastructure`);
  }

  return normalized;
}

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
