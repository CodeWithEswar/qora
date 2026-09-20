/**
 * NXTQR — Customer Outbound Billing Webhook Data Contracts (V1)
 */

import { z } from "zod";

export const SubscriptionActivatedWebhookDataV1Schema = z.object({
  subscriptionId: z.string(),
  planCode: z.string(),
  status: z.string(),
});
export type SubscriptionActivatedWebhookDataV1 = z.infer<typeof SubscriptionActivatedWebhookDataV1Schema>;

export const PaymentSucceededWebhookDataV1Schema = z.object({
  paymentId: z.string(),
  amountMinor: z.number().int().positive(),
  currency: z.string(),
});
export type PaymentSucceededWebhookDataV1 = z.infer<typeof PaymentSucceededWebhookDataV1Schema>;
