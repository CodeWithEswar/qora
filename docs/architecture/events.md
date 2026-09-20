# NXTQR Internal Event Architecture

Internal Domain Events describe meaningful business facts that have already occurred within the NXTQR core domain.

---

## Architectural Rules

1. **Facts, Not Commands**:
   - Good: `qr.published`, `subscription.activated`.
   - Forbidden: `doQrPublish`, `processBilling`.
2. **Strict Separation of Contracts**:
   - Internal events are **not** public customer webhook payloads.
   - Internal events are **not** Queue execution jobs.
   - Provider webhooks (e.g. Cashfree) are external inputs, never internal domain facts.
3. **Payload Minimization**:
   - Events contain lightweight references and identifying keys, never raw database rows or full historical metrics.
4. **Zero Secrets in Events**:
   - No plaintext API keys, invitation tokens, Cashfree secrets, passwords, or webhook signing material are ever placed in events.
5. **At-Least-Once Delivery**:
   - Event consumers must be idempotent and tolerate duplicate deliveries.

---

## Canonical Event Envelope (`InternalEventV1`)

```json
{
  "eventId": "evt_1789632000_8f9e0b1c",
  "eventType": "qr.published",
  "schemaVersion": 1,
  "occurredAt": "2026-09-17T12:00:00.000Z",
  "organizationId": "org_prod_alpha_2026",
  "actor": {
    "type": "user",
    "id": "usr_991823ab"
  },
  "resource": {
    "type": "qr",
    "id": "qr_01h8x9p3..."
  },
  "data": {
    "qrId": "qr_01h8x9p3...",
    "versionNumber": 4,
    "publishedAt": "2026-09-17T12:00:00.000Z",
    "resolverRevision": 4
  }
}
```

---

## Canonical Event Catalog

### 1. `qr.created`
- **Owner**: QR Core Domain
- **When Emitted**: Directly after a new QR code asset is durably committed to Cloudflare D1.
- **Payload**: `qrId`, `type`, `mode`, `createdBy`.
- **Consumers**: Activity timeline, search indexer, webhook projector.
- **Delivery**: Transactional / At-least-once.

### 2. `qr.published`
- **Owner**: QR Core & Routing Domain
- **When Emitted**: After resolver snapshot is written to KV and published revision is committed in D1.
- **Payload**: `qrId`, `versionNumber`, `publishedAt`, `resolverRevision`.
- **Consumers**: Audit logger, customer webhook projector, edge cache warming.
- **Idempotency**: Consumers check `resolverRevision` to avoid regressing newer state.

### 3. `qr.rule.changed`
- **Owner**: Routing Domain
- **When Emitted**: Complete rule set replaced via `PUT /api/v1/qrs/:id/rules`.
- **Payload**: `qrId`, `ruleCount`, `isDraft`.
- **Consumers**: Audit logger.

### 4. `campaign.created`
- **Owner**: Campaign Domain
- **When Emitted**: When a new organizational campaign container is registered.
- **Payload**: `campaignId`, `name`, `createdBy`.
- **Consumers**: Activity timeline, webhook projector.

### 5. `subscription.activated`
- **Owner**: Billing Domain (Provider-Neutral)
- **When Emitted**: After verified Cashfree webhook signature, payment verification, and state transition to `ACTIVE`.
- **Payload**: `subscriptionId`, `organizationId`, `planCode`, `provider`.
- **Consumers**: Commercial entitlements updater, notification worker, webhook projector.

### 6. `payment.succeeded`
- **Owner**: Billing Domain
- **When Emitted**: After payment transaction is durably recorded in the ledger.
- **Payload**: `paymentId`, `organizationId`, `amountMinor`, `currency`.
- **Consumers**: Invoice generator, customer notification.

### 7. `qr.link.unhealthy`
- **Owner**: Guardian Domain
- **When Emitted**: When consecutive automated health checks exceed failure thresholds.
- **Payload**: `qrId`, `destinationUrl`, `incidentId`, `failureReason`, `observedAt`.
- **Consumers**: Automatic fallback router, email/webhook alert projector.

### 8. `qr.link.recovered`
- **Owner**: Guardian Domain
- **When Emitted**: When a previously degraded or unhealthy destination returns to healthy status.
- **Payload**: `qrId`, `destinationUrl`, `incidentId`, `recoveredAt`.
- **Consumers**: Primary route restorer, incident closure auditor.

### 9. `report.requested`
- **Owner**: Reporting Domain
- **When Emitted**: Upon successful submission of an asynchronous report job.
- **Payload**: `reportId`, `organizationId`, `reportType`, `format`, `requestedBy`.
- **Consumers**: Activity feed, usage meter.

### 10. `report.completed`
- **Owner**: Reporting Domain
- **When Emitted**: When report Worker completes CSV/PDF generation and uploads output to private R2.
- **Payload**: `reportId`, `organizationId`, `outputAssetId`, `completedAt`.
- **Consumers**: User notification, customer webhook projector.
