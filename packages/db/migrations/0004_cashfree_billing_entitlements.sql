-- ==============================================================================
-- Migration: 0004_cashfree_billing_entitlements.sql
-- Description: Cashfree Billing, Usage Metering, Plan Entitlements & Financial Ledger
-- ==============================================================================

-- 1. USAGE COUNTERS (Period-scoped and metric-scoped meter counters)
CREATE TABLE IF NOT EXISTS usage_counters (
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL,
    period_key TEXT NOT NULL, -- e.g. "2026-09" or "LIFETIME"
    value INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY(organization_id, metric_key, period_key)
);

CREATE INDEX IF NOT EXISTS idx_usage_counters_lookup 
ON usage_counters(organization_id, metric_key, period_key);

-- 2. PLAN ENTITLEMENTS (Authoritative feature limits per plan)
CREATE TABLE IF NOT EXISTS plan_entitlements (
    plan_id TEXT NOT NULL,
    entitlement_key TEXT NOT NULL,
    limit_value INTEGER,
    config_json TEXT,
    PRIMARY KEY(plan_id, entitlement_key)
);

CREATE INDEX IF NOT EXISTS idx_plan_entitlements_lookup 
ON plan_entitlements(plan_id, entitlement_key);

-- 3. ENHANCE PLANS WITH CODE, INTEGER MINOR-UNIT PRICING & PERIOD
ALTER TABLE plans ADD COLUMN code TEXT;
ALTER TABLE plans ADD COLUMN billing_period TEXT DEFAULT 'monthly';
ALTER TABLE plans ADD COLUMN price_minor INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN currency TEXT DEFAULT 'INR';
ALTER TABLE plans ADD COLUMN active INTEGER DEFAULT 1;

-- 4. ENHANCE PAYMENTS LEDGER (Integer Minor Units & Provider Mapping)
-- (amount_minor was already established in 0002_production_foundation.sql)
ALTER TABLE payments ADD COLUMN provider TEXT DEFAULT 'cashfree';
ALTER TABLE payments ADD COLUMN provider_payment_id TEXT;
ALTER TABLE payments ADD COLUMN provider_order_id TEXT;
ALTER TABLE payments ADD COLUMN subscription_id TEXT;
ALTER TABLE payments ADD COLUMN paid_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_payments_org 
ON payments(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_provider_order 
ON payments(provider, provider_order_id);

CREATE INDEX IF NOT EXISTS idx_payments_provider_payment 
ON payments(provider, provider_payment_id);

-- 5. SUBSCRIPTION CANCELLATION & GRACE CONTROLS
ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN cancelled_at INTEGER;
