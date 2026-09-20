# NXTQR Resolver Snapshot Contract V1

Published edge resolver state contract stored in Cloudflare KV key: `qr:v1:<namespace>:<slug>`.

---

## 1. Schema Specification

```typescript
export interface QrResolverSnapshotV1 {
  /** Schema version identifier. Only version 1 is accepted by the Phase 7 edge worker. */
  schemaVersion: 1;

  /** Stable identifier for the QR asset. */
  qrId: string;

  /** Organization tenancy identifier. */
  organizationId: string;

  /** Lifecycle state: ACTIVE, DRAFT, PAUSED, SCHEDULED, EXPIRED, ARCHIVED. */
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "SCHEDULED" | "EXPIRED" | "ARCHIVED";

  /** Monotonically increasing revision number for cache validation and rollback tracking. */
  publishedRevision: number;

  /** Authoritative default destination reference. */
  defaultDestination: {
    id: string;
    url: string;
    isLocked?: boolean;
  } | string;

  /** Approved fallback destination triggered on Guardian health failure. */
  fallbackDestination?: {
    id: string;
    url: string;
  } | string;

  /** Compiled routing rules. Evaluated in priority ASC order with stable ID tie-breakers. */
  routing?: {
    rules: RoutingRule[];
    timezone?: string;
  };
  rules?: RoutingRule[]; // Backward compatibility alias

  /** Active A/B experiment configuration with integer basis point weights. */
  experiment?: {
    id: string;
    status: "ACTIVE" | "PAUSED";
    variants: Array<{
      id: string;
      name: string;
      destinationUrl: string;
      trafficWeight: number; // Basis points: sum across variants = 10000 or 100
    }>;
  };

  /** Compact Guardian health state updated asynchronously by background check workers. */
  guardian?: {
    destinationId?: string;
    state: "HEALTHY" | "DEGRADED" | "UNHEALTHY" | "UNKNOWN";
    observedAt?: string;
    policyVersion?: number;
  };
  guardianHealthy?: boolean; // Backward compatibility boolean

  /** Campaign scheduling constraints evaluated in UTC against epoch timestamps. */
  schedule?: {
    startsAt?: number; // Epoch timestamp ms
    expiresAt?: number; // Epoch timestamp ms
    timezone?: string;
  };

  /** Optional password protection hash for restricted campaigns. */
  passwordHash?: string;

  /** ISO 8601 publication timestamp. */
  publishedAt: string;

  /** Last modification timestamp in ms. */
  updatedAt?: number;
}
```

---

## 2. Validation Invariant

The Edge Redirect Worker validates `schemaVersion === 1` and structure with `isValidResolverSnapshot(data)`.
Corrupted KV entries or unknown future schema versions immediately trigger a safe D1 fallback query and asynchronous KV repair.
