# NXTQR Physical Monorepo Architecture

## 1. Overview
NXTQR is organized as a high-performance monorepo using **pnpm workspaces** and **Turborepo** task orchestration. It strictly separates deployable runtime boundaries (`apps/*`) from reusable, runtime-neutral domain packages (`packages/*`) and shared build standards (`tooling/*`).

```
                         NXTQR MONOREPO
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
          APPS              PACKAGES           TOOLING
            │                  │                  │
      Deployable units    Domain/shared      Build standards
            │              capabilities
            │
    ┌───────┼────────┬──────────┐
    ▼       ▼        ▼          ▼
   WEB   REDIRECT   EVENT     COLLAB
          WORKER    WORKER     WORKER
```

---

## 2. Workspace Topology

### Applications (`apps/`)
Deployable runtime boundaries containing HTTP handlers, Cloudflare bindings, or Next.js React UI:
- **`apps/web`** (Control Plane): Next.js 16.3.5, React 19, Auth.js session security, Tailwind CSS v4, dynamic dashboards, marketing, billing UI.
- **`apps/redirect-worker`** (Edge Scanner): Cloudflare Worker, sub-10ms QR redirect data plane, KV snapshot lookup, pure `@nxtqr/routing-engine` policy evaluation, non-blocking scan event telemetry via Cloudflare Queues.
- **`apps/event-worker`** (Async Telemetry & Jobs): Cloudflare Queue consumer for `nxtqr-scan-telemetry`, batch analytics updates to Cloudflare Analytics Engine and D1.
- **`apps/collab-worker`** (Real-Time Coordination): Cloudflare Durable Object (`PresenceRoom`), WebSocket/HTTP polling presence, active cursors, and temporary section locks.

### Domain Packages (`packages/`)
Reusable domain capabilities adhering to Domain-Driven Design (DDD). **Runtime-neutral**: zero dependencies on `NextRequest`, `NextResponse`, React, or raw Cloudflare bindings. Pure domain logic does not depend on `packages/db`.
- **`@nxtqr/contracts`**: Canonical schemas (`ScanEventV1`, `QrResolverSnapshotV1`), DTOs, and typed domain errors (`DomainError`, `ValidationError`, etc.).
- **`@nxtqr/routing-engine`**: Pure deterministic condition evaluator (`DEVICE`, `OS`, `COUNTRY`, `LANGUAGE`, `QUERY`, `COOKIE`, `TIME_RANGE`) and policy routing logic.
- **`@nxtqr/qr-core`**: QR asset lifecycle state machine (`DRAFT` → `ACTIVE` ⇄ `PAUSED` → `ARCHIVED`), slug grammar validation, and KV resolver key generation.
- **`@nxtqr/billing`**: Plan catalog (`free`, `pro`, `business`), integer minor units (paise), subscription state machine, and quota projection.
- **`@nxtqr/cashfree`**: Provider adapter for Cashfree Payments. HMAC-SHA256 signature verification, webhook timestamp freshness checks, and PG API requests.
- **`@nxtqr/permissions`**: RBAC role matrix (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`, `BILLING_ADMIN`) and capability authorization.
- **`@nxtqr/entitlements`**: Commercial quotas and downgrade enforcement.
- **`@nxtqr/collaboration`**: Brand governance rules, portal validation, comments, mentions, approvals, and version diff generators.
- **`@nxtqr/config`**: Brand constants, canonical URLs, and environment schema tokens.
- **`@nxtqr/observability`**: Structured logging and PII/secret data redaction.
- **`@nxtqr/db`**: Authoritative D1 migrations (`0001` through `0004`), schema definitions, and seed scripts.

### Tooling (`tooling/`)
- **`@nxtqr/typescript-config`**: Shared `tsconfig` definitions (`base.json`, `worker.json`, `nextjs.json`, `library.json`).
- **`@nxtqr/eslint-config`**: Shared linting rules.

---

## 3. Dependency Rules & Invariants
1. **Unidirectional Flow**: `apps` → `packages` → `tooling`.
2. **Absolute Rule**: No package under `packages/` may import from `apps/`.
3. **Runtime Neutrality**: Pure domain packages never import `next/*`, `react`, or raw Cloudflare bindings (`D1Database`, `KVNamespace`, `R2Bucket`, `Queue`).
4. **Decoupled Database**: Pure domain packages (`routing-engine`, `billing`, `qr-core`) do NOT depend on `db`. They accept pure typed data structures and return pure decisions.
5. **No Cross-Package Cycles**: Turborepo pipeline validates acyclic dependency graph on every build.
