# NXTQR — Analytics Privacy & Data Minimization Model

## 1. Principles of Data Minimization

NXTQR's positioning is **Smart QR Infrastructure**:
> *Create Once. Change Anytime. Route Intelligently. Measure Everything.*

In the analytics pipeline, **"Measure Everything"** means:
> *Measure what the product needs to deliver intelligent routing and honest attribution, NOT collect everything the scanner can reveal.*

For every telemetry field, NXTQR enforces the invariant:
**If the routing or attribution engine does not strictly require the data point, it must not be collected or persisted.**

---

## 2. Scan Telemetry Ingestion Privacy Table

| Field | Collected? | Stored in D1 / AE? | Privacy Transformation | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Raw IP Address** | Transiently observed at edge | **NO** | `SHA-256(IP + Salt + Date)` coarse hash | Daily unique estimation; raw IP discarded immediately |
| **User-Agent Header** | Transiently observed at edge | **NO** | Classified into coarse enums (`DeviceClass`, `OSFamily`, `BrowserFamily`) | Operating system & device compatibility charts |
| **Precise GPS / Coordinates** | **NO** | **NO** | Not requested; scanner location permissions never prompted | Aggregate geographic distribution |
| **Country Code** | Derived from Cloudflare `cf.country` | YES (coarse ISO code) | None needed; coarse country level only | Regional traffic insights |
| **Referrer URL** | Transiently observed at edge | **NO** | Classified into `ReferrerClass` (`DIRECT`, `SOCIAL`, `SEARCH`, `WEB`) | Source attribution without leaking private query tokens |
| **Cookies / Session IDs** | **NO** | **NO** | Scanner requests carry zero persistent tracking cookies | Privacy-first scanning |
| **Advertising IDs / Fingerprints**| **NO** | **NO** | Invasive hardware/canvas fingerprinting strictly prohibited | Ethical measurement |

---

## 3. IP Hashing & Unique Estimation Methodology

### Technical Implementation
At the edge redirect worker:
```typescript
const ipSalt = env.IP_SALT || "nxtqr_salt_2026";
const clientIp = request.headers.get("cf-connecting-ip") || "0.0.0.0";
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const ipHash = await hashString(`${clientIp}-${ipSalt}-${today}`);
```

### Privacy Guarantees
1. **One-Way Salted Hash**: Cannot be inverted to discover the scanner's original IP address.
2. **Daily Salt Rotation**: The date component rotates every 24 hours UTC. A scanner visiting today and tomorrow will have completely distinct hashes, preventing cross-day user profiling.
3. **No Cross-Site Identity**: The hash is used only within hourly and daily rollup buckets to compute `estimated_unique_scans`.

### Product Copy & Labeling Rules
- **Approved**: *Estimated Unique Scans*, *Estimated Unique Scanners*.
- **Strictly Prohibited**: *Unique People*, *Unique Visitors*, *Identified Users*.

---

## 4. Traffic Quality & Automation Classification

NXTQR detects automated requests using **explainable, privacy-preserving signals**:
1. Standard crawler, search spider, and unfurler patterns (e.g. WhatsApp, Slack, Facebook preview crawlers).
2. Known headless automation agents (e.g. curl, python-requests, postman).
3. Lifecycle-blocked traffic (scans targeting drafts, paused QRs, expired campaigns).

NXTQR **never** injects JavaScript fingerprinting scripts, audio context probes, or canvas extractors on redirect endpoints to detect bots.

---

## 5. Cookie Policy Alignment

The redirect worker and scan telemetry pipeline:
- Sets **zero** cookies on the scanner's browser.
- Does not inspect third-party tracking cookies.
- Complies fully with GDPR, ePrivacy Directive, and CCPA without requiring cookie consent banners for scanner redirects.

---

## 6. Retention & Lifecycle Policies

1. **Hourly Rollups (`scan_events_hourly`)**: Kept according to the customer's plan entitlement history limit (e.g. 30 days Free, 90 days Pro, 365 days Enterprise).
2. **Detailed Checks (`link_checks`)**: Pruned automatically after 30 days via `pruneOldGuardianChecks()`.
3. **Organization Deletion**: When a workspace is deleted, all associated `scan_events_hourly`, `conversion_events`, `saved_reports`, and `r2_assets` are deleted in accordance with the deletion lifecycle.
