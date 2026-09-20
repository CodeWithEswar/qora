/**
 * NXTQR — Outbound Webhook Projection Registry
 * Maps internal domain events to public customer webhook envelopes.
 * Protects customer contracts from leaking internal database columns or private telemetry.
 */

import { CustomerWebhookEnvelope, createCustomerWebhookEnvelope } from "./envelope";
import { InternalEventEnvelope } from "../../events/envelope";
import { INTERNAL_EVENT_TYPES } from "../../events/registry";

export type WebhookProjector = (event: InternalEventEnvelope<any>) => CustomerWebhookEnvelope<any> | null;

/**
 * Registry of authorized public projections
 */
export const WEBHOOK_PROJECTIONS: Record<string, WebhookProjector> = {
  [INTERNAL_EVENT_TYPES.QR_CREATED]: (event) => {
    return createCustomerWebhookEnvelope({
      type: "qr.created",
      data: {
        qrId: event.data.qrId,
        type: event.data.type,
        mode: event.data.mode,
      },
    });
  },

  [INTERNAL_EVENT_TYPES.QR_PUBLISHED]: (event) => {
    return createCustomerWebhookEnvelope({
      type: "qr.published",
      data: {
        qrId: event.data.qrId,
        version: event.data.versionNumber,
        publishedAt: event.data.publishedAt,
      },
    });
  },

  [INTERNAL_EVENT_TYPES.QR_LINK_UNHEALTHY]: (event) => {
    return createCustomerWebhookEnvelope({
      type: "qr.link.unhealthy",
      data: {
        qrId: event.data.qrId,
        destinationUrl: event.data.destinationUrl,
        reason: event.data.failureReason,
        observedAt: event.data.observedAt,
      },
    });
  },

  [INTERNAL_EVENT_TYPES.QR_LINK_RECOVERED]: (event) => {
    return createCustomerWebhookEnvelope({
      type: "qr.link.recovered",
      data: {
        qrId: event.data.qrId,
        destinationUrl: event.data.destinationUrl,
        recoveredAt: event.data.recoveredAt,
      },
    });
  },

  [INTERNAL_EVENT_TYPES.CAMPAIGN_CREATED]: (event) => {
    return createCustomerWebhookEnvelope({
      type: "campaign.created",
      data: {
        campaignId: event.data.campaignId,
        name: event.data.name,
      },
    });
  },

  [INTERNAL_EVENT_TYPES.REPORT_COMPLETED]: (event) => {
    return createCustomerWebhookEnvelope({
      type: "report.completed",
      data: {
        reportId: event.data.reportId,
        completedAt: event.data.completedAt,
      },
    });
  },
};

/**
 * Projects an internal event into an outbound customer webhook envelope.
 * Returns null if the event is internal-only and not subscribable by customers.
 */
export function projectInternalEventToCustomerWebhook(
  event: InternalEventEnvelope<any>
): CustomerWebhookEnvelope<any> | null {
  const projector = WEBHOOK_PROJECTIONS[event.eventType];
  if (!projector) return null;
  return projector(event);
}
