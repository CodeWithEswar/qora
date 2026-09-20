# NXTQR Threat Model & Security Architecture

This document formalizes the threat model, security boundaries, and defense-in-depth architecture of NXTQR — Enterprise Smart QR Infrastructure.

---

## 1. Core Security Invariants

1. **The browser is never the authorization authority.** All mutations and data access operations evaluate server-side authorization.
2. **Every organization-scoped command is authorized server-side** using the Five-Part Authorization Decision:
   $$\text{ALLOW} = \text{Actor} \land \text{Membership} \land \text{Permission} \land \text{Entitlement} \land \text{Policy} \land \text{Resource Ownership}$$
3. **Multi-tenant isolation is strictly enforced** at the database, edge resolver, and object storage boundaries.
4. **Zero plaintext credentials at rest**: API keys, share tokens, invitation tokens, and webhook secrets are stored exclusively as one-way SHA-256 hashes.
5. **Fail closed**: Missing secrets, missing permissions, or degraded authorization services terminate operations safely without granting elevated access.

---

## 2. Assets & Sensitivity Classification

| Asset Class | Sensitivity | Storage Location | Threat Scenarios | Primary Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| **API Keys & Webhook Secrets** | Critical | Cloudflare D1 (Hashed) | Key leakage, credential reuse, replay attacks | Cryptographic random entropy (256-bit), SHA-256 hashing at rest, show-once reveal, scoped permissions. |
| **Cashfree Webhook Payload** | Critical | In-Transit / D1 Ledger | Forged payment confirmation, replay, out-of-order state corruption | HMAC-SHA256 signature verification on raw request body, unique `provider_event_key` idempotency. |
| **QR Published Resolver State** | High | Cloudflare KV | Cache poisoning, unauthorized redirects, routing hijack | Control-plane write isolation, schema validation prior to KV push, edge read-only access. |
| **Private Customer Assets (PDF, SVG, Reports)** | High | Cloudflare R2 | Direct URL guessing, cross-tenant file scraping, XSS via SVG | Private bucket default, authenticated short-lived signed delivery, Content-Disposition: attachment, MIME validation. |
| **Audit Logs** | High | Cloudflare D1 | Tampering, audit deletion, log injection, PII leak | Immutable insert-only design, automatic credential redaction, actor correlation IDs. |
| **Scan Telemetry & Aggregations** | Medium | Analytics Engine / D1 | Deanonymization, traffic surveillance | IP hashing (never raw IP in storage), user-agent classification, scoped queries. |

---

## 3. Actors & Trust Boundaries

```
[ UNTRUSTED INTERNET ]
        │
        ├── Mobile Scanners (QR Scans) ──► [ EDGE REDIRECT WORKER ] ──► Validated KV Resolver
        │                                         │
        │                                         └──► Async Analytics Engine (Fire-and-Forget)
        │
        ├── Dashboard Users (Browsers) ──► [ NEXT.JS CONTROL PLANE ] ──► D1 / Sessions / RBAC
        │                                         │
        │                                         └──► R2 Private Object Gate
        │
        ├── API Consumers (Developers) ──► [ DEVELOPER API ] ─────────► Key Verification + Rate Limit
        │
        ├── Cashfree Servers ────────────► [ PAYMENT WEBHOOK ] ───────► Raw HMAC Verification + Ledger
        │
        └── Customer Webhook Receivers ◄── [ OUTBOUND WORKER ] ───────► SSRF Defense + Bounded Retries
```

---

## 4. Threat Surface Analysis & Mitigations

### 4.1. Tenant Isolation & IDOR
- **Threat**: An authenticated user in Organization A submits requests modifying or viewing resources (QRs, rules, API keys, audit logs) owned by Organization B.
- **Mitigation**: Every database query verifies `WHERE organization_id = :authorizedOrgId`. Authorization checks query the database record and verify its `organizationId` matches the validated tenant context from the session or API token before mutation.

### 4.2. Redirect Abuse & Dangerous Schemes
- **Threat**: Attackers create QR codes pointing to `javascript:`, `data:`, `file:`, or malformed URLs that execute malicious scripts or exploit local client vulnerabilities upon scan.
- **Mitigation**: Centralized `validateDestinationSecurity()` strictly allows only `https:` and `http:` protocols. Schemes like `javascript:`, `data:`, `blob:`, `file:`, and `about:` are rejected during creation and editing.
- **Mitigation**: Automated redirect loop detection prevents QR self-referencing and direct cyclic redirects.

### 4.3. SSRF (Server-Side Request Forgery) in Link Guardian & Webhooks
- **Threat**: User-supplied destination URLs or webhook endpoints cause the NXTQR backend to make requests to internal network services (`169.254.169.254` AWS/GCP metadata, `127.0.0.1`, RFC 1918 private subnets `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- **Mitigation**: Outbound probes resolve DNS prior to connect, filter out private IP CIDRs and loopback ranges, disallow internal metadata IPs, enforce strict request timeouts (5000ms), and cap response payloads (64KB).

### 4.4. Cashfree Payment Spoofing & Replay
- **Threat**: Malicious actors POST simulated payment completion events to `/api/webhooks/cashfree` to obtain unpaid Pro/Enterprise entitlements.
- **Mitigation**:
  1. Verification runs on raw request bytes using HMAC-SHA256 before any JSON parsing.
  2. Idempotency enforced via `payment_events.provider_event_key` unique constraint. Duplicate payloads are acknowledged with 200 OK but discarded without state mutations.
  3. Client redirect URLs (`/checkout/success`) never activate entitlements; activation is strictly driven by verified webhook events.

### 4.5. API Keys & Share Links
- **Threat**: Compromised API keys or brute-forced share tokens grant indefinite access to sensitive data.
- **Mitigation**:
  - API keys are generated with 256-bit cryptographically secure entropy, formatted with a public prefix (`nxtqr_live_xxxx...`), and stored exclusively as SHA-256 hashes.
  - Plaintext is returned exactly once at creation time.
  - Share links use high-entropy random tokens, SHA-256 token hashing, optional password protection, server-side expiration checks, and granular permissions (`VIEW` vs `DOWNLOAD`).

### 4.6. SVG & File Upload Security
- **Threat**: Uploaded SVG logos containing embedded `<script>` or event handlers (`onload=...`) execute malicious code when served inline.
- **Mitigation**:
  - Uploaded files are assigned server-generated opaque keys: `org/<orgId>/<resource>/<uuid>`.
  - SVGs are served with `Content-Disposition: attachment` or strict `Content-Security-Policy: default-src 'none'` headers.
  - File size limits (5MB for images, 50MB for exports) and MIME type validation are enforced server-side.

### 4.7. Rate Limiting Boundaries
- Public redirects, authenticated dashboard mutations, developer API calls, public share links, and webhook deliveries have separate rate-limiting buckets.
- High-volume QR scan spikes are not penalized by dashboard API rate limits.

---

## 5. Security Responsibilities Matrix

| Boundary | NXTQR Application | Cloudflare Edge / Infrastructure | Customer / Tenant Admin |
| :--- | :--- | :--- | :--- |
| **Authentication** | Session validation, CSRF checks, fail-closed secrets | Edge SSL/TLS termination, DDoS mitigation | User password hygiene, Google account security |
| **Authorization** | 5-part authorization, RBAC, tenant checks | Workers runtime isolation | Correct role assignments, member lifecycle |
| **API Keys** | Hashing, show-once reveal, scope validation | Rate limiting at edge | Secure secret storage, immediate key revocation on leak |
| **Destinations** | Scheme allowlists, SSRF guardrails, loop checks | Caching, DNS resolution | Accurate destination URLs, domain ownership |
| **Payments** | Signature verification, idempotent ledger | Webhook ingress protection | Cashfree portal credential security |
