/**
 * NXTQR — SaaS Tiers & Entitlements Catalog
 * Centralized feature flag and quota rules. Never scatter ad-hoc plan checks across UI.
 */

export type SaaSTier = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";

export interface PlanEntitlements {
  "qr.dynamic.max": number;
  "qr.static.max": number;
  "analytics.retentionDays": number;
  "analytics.export": boolean;
  "routing.level": "none" | "basic" | "advanced";
  "experiments.enabled": boolean;
  "guardian.enabled": boolean;
  "guardian.autoFallback": boolean;
  "team.maxSeats": number;
  "team.rbac": boolean;
  "domains.customMax": number;
  "branding.whiteLabel": boolean;
  "api.monthlyRequests": number;
  "api.webhooks": boolean;
  "exports.vectorFormats": boolean; // SVG, PDF, EPS
  "bulk.enabled": boolean;
  "bulk.maxRowsPerBatch": number;
  "templates.max": number;
  "templates.brandLock": boolean;
}

export const TIER_DEFAULT_ENTITLEMENTS: Record<SaaSTier, PlanEntitlements> = {
  FREE: {
    "qr.dynamic.max": 3,
    "qr.static.max": 999999,
    "analytics.retentionDays": 7,
    "analytics.export": false,
    "routing.level": "none",
    "experiments.enabled": false,
    "guardian.enabled": false,
    "guardian.autoFallback": false,
    "team.maxSeats": 1,
    "team.rbac": false,
    "domains.customMax": 0,
    "branding.whiteLabel": false,
    "api.monthlyRequests": 0,
    "api.webhooks": false,
    "exports.vectorFormats": false, // PNG only
    "bulk.enabled": true,
    "bulk.maxRowsPerBatch": 25,
    "templates.max": 3,
    "templates.brandLock": false,
  },
  PRO: {
    "qr.dynamic.max": 100,
    "qr.static.max": 999999,
    "analytics.retentionDays": 90,
    "analytics.export": true,
    "routing.level": "basic",
    "experiments.enabled": false,
    "guardian.enabled": true,
    "guardian.autoFallback": false,
    "team.maxSeats": 3,
    "team.rbac": false,
    "domains.customMax": 1,
    "branding.whiteLabel": false,
    "api.monthlyRequests": 10000,
    "api.webhooks": false,
    "exports.vectorFormats": true, // SVG, PDF
    "bulk.enabled": true,
    "bulk.maxRowsPerBatch": 500,
    "templates.max": 20,
    "templates.brandLock": false,
  },
  BUSINESS: {
    "qr.dynamic.max": 1000,
    "qr.static.max": 999999,
    "analytics.retentionDays": 365,
    "analytics.export": true,
    "routing.level": "advanced",
    "experiments.enabled": true,
    "guardian.enabled": true,
    "guardian.autoFallback": true,
    "team.maxSeats": 15,
    "team.rbac": true,
    "domains.customMax": 5,
    "branding.whiteLabel": true,
    "api.monthlyRequests": 250000,
    "api.webhooks": true,
    "exports.vectorFormats": true, // SVG, PDF, EPS, CMYK
    "bulk.enabled": true,
    "bulk.maxRowsPerBatch": 2500,
    "templates.max": 100,
    "templates.brandLock": true,
  },
  ENTERPRISE: {
    "qr.dynamic.max": 9999999,
    "qr.static.max": 999999,
    "analytics.retentionDays": 730,
    "analytics.export": true,
    "routing.level": "advanced",
    "experiments.enabled": true,
    "guardian.enabled": true,
    "guardian.autoFallback": true,
    "team.maxSeats": 9999,
    "team.rbac": true,
    "domains.customMax": 50,
    "branding.whiteLabel": true,
    "api.monthlyRequests": 5000000,
    "api.webhooks": true,
    "exports.vectorFormats": true,
    "bulk.enabled": true,
    "bulk.maxRowsPerBatch": 10000,
    "templates.max": 1000,
    "templates.brandLock": true,
  },
};
