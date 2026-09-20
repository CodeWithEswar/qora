import * as crypto from "crypto";
import { BillingProviderEvent } from "@nxtqr/contracts";

/**
 * Normalizes inbound Cashfree webhook payloads into a provider-neutral BillingProviderEvent.
 * Converts float amounts into safe integer minor units (paise).
 */
export function normalizeCashfreeWebhookEvent(rawBody: string, parsed: any): BillingProviderEvent {
  const eventType = parsed.type || parsed.event_type || "PAYMENT_SUCCESS_WEBHOOK";
  const data = parsed.data || {};
  const order = data.order || {};
  const payment = data.payment || {};
  const subscription = data.subscription || {};

  const providerOrderId = order.order_id || parsed.order_id || "";
  const providerPaymentId = payment.cf_payment_id ? String(payment.cf_payment_id) : undefined;
  const providerSubscriptionId = subscription.subscription_id || parsed.subscription_id;

  // Calculate integer minor units from order_amount or payment_amount
  const amount = payment.payment_amount ?? order.order_amount ?? 0;
  const amountMinor = Math.round(Number(amount) * 100);
  const currency = payment.payment_currency || order.order_currency || "INR";

  const status = payment.payment_status || order.order_status || "SUCCESS";

  const providerEventKey =
    parsed.event_id ||
    (providerPaymentId ? `pay_${providerPaymentId}` : undefined) ||
    (providerOrderId ? `order_${providerOrderId}_${status}` : undefined) ||
    `evt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const payloadHash = crypto.createHash("sha256").update(rawBody).digest("hex");

  return {
    provider: "cashfree",
    providerEventKey,
    eventType,
    occurredAt: parsed.event_time ? new Date(parsed.event_time).getTime() : Date.now(),
    providerSubscriptionId,
    providerPaymentId,
    providerOrderId,
    amountMinor,
    currency,
    status,
    rawPayloadHash: payloadHash,
  };
}
