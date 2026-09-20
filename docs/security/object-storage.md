# NXTQR Object Storage (Cloudflare R2) Security Architecture

This document describes the security policies, access control mechanics, and upload/download guardrails for customer digital assets stored in Cloudflare R2.

---

## 1. Core Principle: Private by Default

All buckets and objects in NXTQR R2 storage are **strictly private by default**:
- R2 public bucket access and direct URL traversal are disabled.
- An R2 object key is **not** an authorization credential.
- Every read or write must pass through an authenticated, tenant-authorized API endpoint.

```
CLIENT (Browser)
   │
   ▼
[ GET /api/assets/download?id=file_123 ]
   │
   ▼
[ NEXT.JS CONTROL PLANE ]
   │── 1. Authenticate user session
   │── 2. Query D1 asset metadata for file_123
   │── 3. Verify asset.organization_id === session.organizationId
   │── 4. Verify user has required permission ('analytics.export' or 'reports.read')
   │── 5. Resolve internal R2 key: org/org_abc/reports/rpt_xyz.pdf
   ▼
[ CLOUDFLARE R2 ]
   │── Stream object bytes to authorized response
   └── Enforce strict headers: Content-Disposition, CSP
```

---

## 2. Object Classification & Policies

| Asset Class | Sensitivity | Storage Path Format | Content-Disposition | Access Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **Branded Brand Kit Logos** | Low / Public | `org/<orgId>/brand/<assetId>.png` | `inline` | Public edge cache after verification |
| **Custom QR Center Logos** | Medium | `org/<orgId>/logos/<assetId>.png` | `inline` | Authenticated proxy or signed URL (max 1h) |
| **Customer PDF Reports** | High / Confidential | `org/<orgId>/reports/<reportId>.pdf` | `attachment; filename="report.pdf"` | Authenticated proxy or short-lived token |
| **Raw Telemetry Exports (CSV)** | High / Confidential | `org/<orgId>/exports/<exportId>.csv` | `attachment; filename="export.csv"` | Authenticated download route with audit log |
| **System Templates** | Public | `templates/<category>/<assetId>.svg` | `inline` | Static immutable edge cache |

---

## 3. Upload Validation & Server-Generated Keys

Client-provided filenames and MIME types are untrusted.

### Key Generation Invariant
Keys are generated strictly on the server using opaque UUIDs to prevent directory traversal and overwrite attacks:
$$\text{key} = \text{"org/"} + \text{tenantId} + \text{"/"} + \text{category} + \text{"/"} + \text{crypto.randomUUID()} + \text{safeExtension}$$

### Validation Rules
1. **Payload Size Bounds**:
   - Logos and images: Max 5 MB.
   - PDF reports: Max 25 MB.
   - Telemetry exports: Max 50 MB.
2. **MIME Verification**: Inspect file signatures / magic numbers rather than blindly trusting the client `Content-Type` header.
3. **Tenant Scoping**: The server verifies that the uploading actor has the `brand.manage` or `reports.create` permission in the target organization.

---

## 4. SVG Security & Active Content Defense

SVG files are XML documents that can embed `<script>`, `<foreignObject>`, or inline JavaScript event handlers (`onload="fetch('...')"`). Serving untrusted SVG inline from the main dashboard origin presents a severe Cross-Site Scripting (XSS) risk.

### NXTQR SVG Mitigations
1. **Never Serve Inline on Main Origin**:
   - All user-uploaded SVGs downloaded or viewed outside the canvas renderer are served with:
     ```http
     Content-Type: image/svg+xml
     Content-Disposition: attachment; filename="sanitized.svg"
     Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'
     X-Content-Type-Options: nosniff
     ```
2. **Canvas Rendering**: For QR generation, SVG assets are parsed through a DOMParser in an isolated sandbox, stripping `<script>` and `on*` event handlers before rasterization onto the canvas.

---

## 5. Deletion & Orphan Cleanup

- When a QR code, brand kit, or report is deleted in the control plane:
  1. The D1 metadata record is marked with `deleted_at = datetime('now')`.
  2. The background retention worker deletes the corresponding R2 object during the daily maintenance cycle.
  3. Deletion events are recorded in the security audit log.
