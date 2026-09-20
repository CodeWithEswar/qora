# NXTQR Authorization Architecture & Access Control

This document describes the authorization model, role-based access control (RBAC), and server-side policy enforcement implemented across NXTQR.

---

## 1. The Core Authorization Pipeline

Every organization-scoped mutation and query follows the authoritative Five-Part Server Authorization Decision:

```
REQUEST (Browser / Developer API)
   │
   ▼
[1] AUTHENTICATE
   │── Resolve user session (JWT / Cookie) or API Key
   ▼
[2] RESOLVE TENANT & MEMBERSHIP
   │── Verify actor is an active member of organizationId
   ▼
[3] CHECK RBAC PERMISSION
   │── Verify actor's role grants required PermissionCode (e.g., 'qr.publish')
   ▼
[4] CHECK PLAN ENTITLEMENT
   │── Verify organization's tier (Free, Pro, Business, Enterprise) allows feature
   ▼
[5] CHECK ORGANIZATION SECURITY POLICY
   │── Verify tenant policies (domain allowlist, sharing enabled, IP rules) allow action
   ▼
[6] VALIDATE RESOURCE OWNERSHIP
   │── Ensure target resource.organizationId === authorized organizationId
   ▼
[7] EXECUTE BUSINESS LOGIC
   │
   ▼
[8] AUDIT LOGGING
   └── Record immutable security audit event
```

---

## 2. Invariants & Rules

1. **The browser is never the authorization authority.** Hiding a button, disabling a menu item, or applying client-side route guards is UX convenience, not security.
2. **Permission $\neq$ Tenant Ownership**: An actor possessing `qr.delete` in Organization A cannot delete a QR code belonging to Organization B.
3. **Entitlement $\neq$ Permission**: An Enterprise subscription grants organizational capability (e.g., custom domains), but a user with role `Viewer` still cannot configure domains.
4. **Last-Owner Protection**: Demoting or removing the last active owner of an organization is rejected server-side to prevent orphaned tenants.

---

## 3. Canonical Permission Registry

Permissions are organized into clear domain namespaces:

| Namespace | Example Codes | Description |
| :--- | :--- | :--- |
| `organization.*` | `organization.read`, `organization.update` | Root tenant configuration |
| `members.*` | `members.read`, `members.invite`, `members.remove` | Membership lifecycle & invitations |
| `teams.*` | `teams.read`, `teams.create`, `teams.update`, `teams.delete` | Team group management |
| `roles.*` | `roles.read`, `roles.create`, `roles.update`, `roles.assign` | Custom & system role governance |
| `qr.*` | `qr.read`, `qr.create`, `qr.update`, `qr.delete`, `qr.publish` | QR asset creation, edits, and live KV push |
| `routing.*` | `routing.read`, `routing.update`, `routing.publish` | QR Brain edge condition rules & traffic graphs |
| `campaigns.*` | `campaigns.read`, `campaigns.create`, `campaigns.delete` | Marketing campaign folders |
| `brand.*` | `brand.read`, `brand.manage` | Corporate logos, colors, and templates |
| `analytics.*` | `analytics.read`, `analytics.export` | Scan telemetry access and data downloads |
| `guardian.*` | `guardian.read`, `guardian.manage` | Health probing and failover controls |
| `billing.*` | `billing.read`, `billing.manage` | Cashfree checkout, subscriptions, invoices |
| `api_keys.*` | `api_keys.read`, `api_keys.manage` | Developer API key issuance & revocation |
| `webhooks.*` | `webhooks.read`, `webhooks.manage` | Outbound event webhooks & rotation |
| `reports.*` | `reports.read`, `reports.create`, `reports.share` | Executive intelligence reports & share links |
| `audit.*` | `audit.read` | Immutable security audit log stream |
| `domains.*` | `domains.read`, `domains.manage` | Branded custom domain management |

---

## 4. System Roles & Permission Matrix

| System Role | Primary Responsibilities | Key Granted Permissions |
| :--- | :--- | :--- |
| **Owner** | Full workspace governance & billing authority | All permissions (`*`). Protected against accidental demotion/removal. |
| **Admin** | Full operational administration | All operational permissions excluding root billing deletion and ownership transfer. |
| **Manager** | Day-to-day operations & campaigns | `qr.*`, `routing.*`, `campaigns.*`, `brand.*`, `analytics.*`, `guardian.*`, `reports.*`. |
| **Editor** | Content & draft creation | `qr.read`, `qr.create`, `qr.update`, `routing.read`, `routing.update`, `campaigns.read`. Cannot publish to edge. |
| **Analyst** | Intelligence & reporting | `analytics.read`, `analytics.export`, `reports.read`, `reports.create`, `qr.read`. |
| **Viewer** | Auditor & stakeholder access | Read-only inspection of dashboards, campaigns, and preview assets. |

---

## 5. Usage Example

```typescript
import { authorizeOperation } from "@/lib/domains/security";

export async function publishQrAction(orgId: string, qrId: string, actor: ActorContext) {
  // 1. Fetch resource from D1
  const qr = await db.getQrById(qrId);
  if (!qr) throw new Error("Not found");

  // 2. Authorize operation with full 5-part check
  const auth = await authorizeOperation({
    actorId: actor.id,
    organizationId: orgId,
    permission: "qr.publish",
    membership: actor.membership,
    entitlements: actor.entitlements,
    policy: actor.securityPolicy,
    resource: {
      organizationId: qr.organization_id,
      resourceType: "qr",
      resourceId: qr.id,
    },
  });

  if (!auth.allowed) {
    throw new Error(`Unauthorized: ${auth.denialReason}`);
  }

  // 3. Execute mutation
  await db.publishQrToKv(qrId);

  // 4. Record audit trail
  await db.recordAuditEvent({
    organizationId: orgId,
    actorId: actor.id,
    action: "QR_PUBLISHED",
    resourceType: "qr",
    resourceId: qrId,
    metadata: { version: qr.version },
  });
}
```
