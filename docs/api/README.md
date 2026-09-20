# NXTQR REST API V1 Documentation

Welcome to the **NXTQR Developer Platform API (Version 1)**.

The NXTQR API provides programmatic access to enterprise dynamic QR lifecycle management, deterministic routing policies, privacy-safe scan analytics, A/B experiments, asynchronous reports, and outbound event webhooks.

---

## Base URL

```text
https://nxtqr.vercel.app/api/v1
```

All requests must be served over secure HTTPS. Non-HTTPS requests are rejected.

---

## Architectural Principles

1. **Four Separated Contract Families**:
   - **HTTP API Contracts (`/api/v1`)**: Versioned DTOs for external developers and dashboard clients.
   - **Internal Domain Events (`InternalEventV1`)**: Facts describing business transactions that have already completed.
   - **Queue Job Contracts**: Transport contracts for asynchronous Cloudflare Queue workers.
   - **Outbound Customer Webhooks**: Versioned public envelopes signed via HMAC-SHA256.
2. **Server-Authoritative Multi-Tenancy**:
   - Client-submitted `organizationId` is never trusted. The tenant is resolved server-side from the authenticated API key or session.
   - Lookups across tenants return safe `404 RESOURCE_NOT_FOUND` to prevent resource probing.
3. **Strict Boundary Validation**:
   - All input parameters, JSON request bodies, and query parameters are validated at runtime via Zod schemas.
4. **Idempotency**:
   - Mutation endpoints support the `Idempotency-Key` header with canonical SHA-256 payload fingerprinting to protect against duplicate side effects during retries.
5. **Privacy-Preserving Telemetry**:
   - No raw IP addresses, precise GPS coordinates, or raw user-agent strings are stored.

---

## API Resource Overview

| Resource | Base Path | Description | Required Scope |
| :--- | :--- | :--- | :--- |
| **QRs** | `/api/v1/qrs` | Create, read, update, and publish dynamic QR assets | `qrs:read`, `qrs:write` |
| **Rules** | `/api/v1/qrs/:id/rules` | Replace structured, non-executable routing rules | `qrs:write` |
| **Analytics** | `/api/v1/qrs/:id/analytics` | Retrieve privacy-aware aggregate scan metrics | `analytics:read` |
| **Share Links** | `/api/v1/qrs/:id/share-links` | Generate password-protected, temporary preview links | `qrs:write` |
| **Campaigns** | `/api/v1/campaigns` | Manage organizational campaigns and scheduling | `campaigns:read`, `campaigns:write` |
| **Experiments** | `/api/v1/experiments` | Create and evaluate traffic-split A/B experiments | `experiments:read`, `experiments:write` |
| **Conversions** | `/api/v1/conversions` | Record post-scan conversion events with deduplication | `conversions:write` |
| **Reports** | `/api/v1/reports` | Asynchronously enqueue and poll CSV/PDF report jobs | `reports:read`, `reports:write` |
| **Webhooks** | `/api/v1/webhooks` | Configure outbound webhook subscriptions & signing secrets | `webhooks:read`, `webhooks:manage` |

---

## Quick Navigation

- [Authentication & API Keys](./authentication.md)
- [Error Handling & Error Codes](./errors.md)
- [Pagination & Cursors](./pagination.md)
- [Idempotent Mutations](./idempotency.md)
- [Rate Limiting & Headers](./rate-limits.md)
- [Outbound Customer Webhooks](./webhooks.md)
- [Internal Domain Events Architecture](../architecture/events.md)
- [OpenAPI 3.1 Specification](./openapi.yaml)
