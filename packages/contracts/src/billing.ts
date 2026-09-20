/**
 * NXTQR — Phase 10: Cashfree Billing & Entitlements Contracts
 * Authoritative plan catalog, integer minor-unit pricing, usage metrics, and webhook payloads.
 */

import { SaaSTier } from "./entitlements";

export type PlanCode =
  | "free"
  | "pro_monthly"
  | "pro_yearly"
  | "business_monthly"
  | "business_yearly"
  | "enterprise_annual";

export type BillingPeriod = "monthly" | "yearly" | "lifetime";

export interface PlanDefinition {
  code: PlanCode;
  tier: SaaSTier;
  name: string;
  description: string;
  billingPeriod: BillingPeriod;
  priceMinor: number; // Integer minor units (e.g., 4900 = ₹49.00, 49900 = ₹499.00)
  currency: "INR";
  active: boolean;
  featuresSummary: string[];
}

/**
 * Authoritative Plan Catalog.
 * Prices and entitlements originate server-side; clients can never specify amounts.
 */
export const PLAN_CATALOG: Record<PlanCode, PlanDefinition> = {
  free: {
    code: "free",
    tier: "FREE",
    name: "Free",
    description: "Essential static QR generation for personal projects",
    billingPeriod: "lifetime",
    priceMinor: 0,
    currency: "INR",
    active: true,
    featuresSummary: [
      "Up to 3 Dynamic QR Codes",
      "Unlimited Static QR Codes",
      "Standard PNG Downloads",
      "7-day basic analytics history",
      "1 Team Seat",
    ],
  },
  pro_monthly: {
    code: "pro_monthly",
    tier: "PRO",
    name: "Pro (Monthly)",
    description: "Dynamic routing, link guardian, and analytics for growing brands",
    billingPeriod: "monthly",
    priceMinor: 4900, // ₹49 / month
    currency: "INR",
    active: true,
    featuresSummary: [
      "100 Dynamic QR Codes",
      "250,000 monthly scans",
      "Smart Dynamic Routing (Device, OS, Time)",
      "NXTQR Guardian 24/7 Link Health & Auto-Fallback",
      "Vector SVG, PDF & EPS Downloads",
      "90-day analytics retention with CSV export",
      "1 Custom Vanity Domain",
      "3 Team Seats",
    ],
  },
  pro_yearly: {
    code: "pro_yearly",
    tier: "PRO",
    name: "Pro (Yearly)",
    description: "Pro plan with 2 months free",
    billingPeriod: "yearly",
    priceMinor: 49900, // ₹499 / year (₹41.58/mo)
    currency: "INR",
    active: true,
    featuresSummary: [
      "100 Dynamic QR Codes",
      "250,000 monthly scans",
      "Smart Dynamic Routing (Device, OS, Time)",
      "NXTQR Guardian 24/7 Link Health & Auto-Fallback",
      "Vector SVG, PDF & EPS Downloads",
      "90-day analytics retention with CSV export",
      "1 Custom Vanity Domain",
      "3 Team Seats",
    ],
  },
  business_monthly: {
    code: "business_monthly",
    tier: "BUSINESS",
    name: "Business (Monthly)",
    description: "Full governance, team RBAC, and developer APIs for agencies",
    billingPeriod: "monthly",
    priceMinor: 199900, // ₹1,999 / month
    currency: "INR",
    active: true,
    featuresSummary: [
      "1,000 Dynamic QR Codes",
      "1,000,000 monthly scans",
      "Advanced Multi-Rule Dynamic Routing & A/B Experiments",
      "Multi-Step Approvals & Revision Snapshots",
      "White-label Client Portals & Custom Brand Kits",
      "Developer API (250,000 requests/mo) & Webhooks",
      "5 Custom Vanity Domains",
      "15 Team Seats with granular RBAC",
      "365-day analytics retention",
    ],
  },
  business_yearly: {
    code: "business_yearly",
    tier: "BUSINESS",
    name: "Business (Yearly)",
    description: "Business plan billed annually with 2 months free",
    billingPeriod: "yearly",
    priceMinor: 1999900, // ₹19,999 / year
    currency: "INR",
    active: true,
    featuresSummary: [
      "1,000 Dynamic QR Codes",
      "1,000,000 monthly scans",
      "Advanced Multi-Rule Dynamic Routing & A/B Experiments",
      "Multi-Step Approvals & Revision Snapshots",
      "White-label Client Portals & Custom Brand Kits",
      "Developer API (250,000 requests/mo) & Webhooks",
      "5 Custom Vanity Domains",
      "15 Team Seats with granular RBAC",
      "365-day analytics retention",
    ],
  },
  enterprise_annual: {
    code: "enterprise_annual",
    tier: "ENTERPRISE",
    name: "Enterprise",
    description: "Dedicated infrastructure, custom SLAs, and custom contracts",
    billingPeriod: "yearly",
    priceMinor: 9999900, // ₹99,999 / year baseline
    currency: "INR",
    active: true,
    featuresSummary: [
      "Unlimited Dynamic QR Codes",
      "Unlimited Scans on Cloudflare Edge",
      "Dedicated IP & Cloudflare Durable Objects Presence",
      "Custom Entitlement Overrides & Tailored SLAs",
      "50 Custom Vanity Domains",
      "Unlimited Team Seats & SSO",
      "Full API & 2-year retention",
    ],
  },
};

export function getPlanByCode(code: string): PlanDefinition | undefined {
  return PLAN_CATALOG[code as PlanCode];
}

export function getPlanByTier(tier: SaaSTier, period: BillingPeriod = "monthly"): PlanDefinition {
  if (tier === "FREE") return PLAN_CATALOG.free;
  if (tier === "ENTERPRISE") return PLAN_CATALOG.enterprise_annual;
  if (tier === "BUSINESS") {
    return period === "yearly" ? PLAN_CATALOG.business_yearly : PLAN_CATALOG.business_monthly;
  }
  return period === "yearly" ? PLAN_CATALOG.pro_yearly : PLAN_CATALOG.pro_monthly;
}

/**
 * Normalized Subscription State Machine states.
 */
export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "PAST_DUE"
  | "ON_HOLD"
  | "CANCEL_PENDING"
  | "CANCELLED"
  | "EXPIRED";

/**
 * Payment ledger transaction status.
 */
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "USER_DROPPED";

export interface PaymentLedgerEntry {
  id: string;
  organizationId: string;
  provider: "cashfree";
  providerPaymentId?: string;
  providerOrderId: string;
  subscriptionId?: string;
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  signatureVerified: boolean;
  paidAt?: number;
  createdAt: number;
}

/**
 * Usage Metrics Catalog.
 */
export type UsageMetricKey =
  | "qr.dynamic.active"
  | "qr.static.created"
  | "scan.count"
  | "team.seats"
  | "domains.custom"
  | "brand_kits.count"
  | "api.requests";

export interface UsageCounterRecord {
  organizationId: string;
  metricKey: UsageMetricKey;
  periodKey: string; // "YYYY-MM" or "LIFETIME"
  value: number;
  updatedAt: number;
}

/**
 * Normalized Webhook Event.
 */
export interface BillingProviderEvent {
  provider: "cashfree";
  providerEventKey: string;
  eventType: string;
  occurredAt: number;
  providerSubscriptionId?: string;
  providerPaymentId?: string;
  providerOrderId?: string;
  amountMinor?: number;
  currency?: string;
  status: string;
  rawPayloadHash: string;
}

/**
 * Checkout contracts.
 */
export interface CreateCheckoutRequest {
  organizationId: string;
  planCode: PlanCode;
  customerEmail: string;
  customerPhone?: string;
  customerName?: string;
}

export interface CreateCheckoutResponse {
  orderId: string;
  paymentSessionId: string;
  checkoutUrl: string;
  amountMinor: number;
  currency: string;
  planCode: PlanCode;
  environment: "sandbox" | "production";
}

/**
 * Return status verification contracts.
 */
export interface VerifyPaymentRequest {
  orderId: string;
  organizationId: string;
}

export interface VerifyPaymentResponse {
  status: "VERIFIED_ACTIVE" | "WEBHOOK_PENDING" | "FAILED" | "UNKNOWN";
  planTier: SaaSTier;
  orderId: string;
  message: string;
}

/**
 * Internal Domain Events emitted after D1 transaction commits.
 */
export interface BillingSubscriptionActivatedV1 {
  type: "BILLING_SUBSCRIPTION_ACTIVATED";
  organizationId: string;
  subscriptionId: string;
  planTier: SaaSTier;
  planCode: PlanCode;
  providerOrderId: string;
  occurredAt: number;
}

export interface BillingSubscriptionChangedV1 {
  type: "BILLING_SUBSCRIPTION_CHANGED";
  organizationId: string;
  subscriptionId: string;
  fromTier: SaaSTier;
  toTier: SaaSTier;
  occurredAt: number;
}

export interface BillingSubscriptionCancelledV1 {
  type: "BILLING_SUBSCRIPTION_CANCELLED";
  organizationId: string;
  subscriptionId: string;
  effectiveDate: number;
  occurredAt: number;
}

export interface BillingPaymentCompletedV1 {
  type: "BILLING_PAYMENT_COMPLETED";
  organizationId: string;
  paymentId: string;
  amountMinor: number;
  currency: string;
  providerOrderId: string;
  occurredAt: number;
}

export interface BillingPaymentFailedV1 {
  type: "BILLING_PAYMENT_FAILED";
  organizationId: string;
  providerOrderId: string;
  reason?: string;
  occurredAt: number;
}
