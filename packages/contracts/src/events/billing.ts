/**
 * NXTQR — Billing Internal Domain Event Schemas
 * Provider-neutral internal facts emitted after verified payment gateway transitions.
 * Never includes credit card numbers, payment credentials, or provider secrets.
 */

import { z } from "zod";

export const SubscriptionActivatedEventDataSchema = z.object({
  subscriptionId: z.string(),
  organizationId: z.string(),
  planCode: z.string(),
  provider: z.string(),
});
export type SubscriptionActivatedEventData = z.infer<typeof SubscriptionActivatedEventDataSchema>;

export const SubscriptionChangedEventDataSchema = z.object({
  subscriptionId: z.string(),
  organizationId: z.string(),
  previousPlan: z.string(),
  newPlan: z.string(),
});
export type SubscriptionChangedEventData = z.infer<typeof SubscriptionChangedEventDataSchema>;

export const PaymentSucceededEventDataSchema = z.object({
  paymentId: z.string(),
  organizationId: z.string(),
  subscriptionId: z.string().optional(),
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3),
});
export type PaymentSucceededEventData = z.infer<typeof PaymentSucceededEventDataSchema>;
