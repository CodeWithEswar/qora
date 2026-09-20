-- ==============================================================================
-- NXTQR — Cashfree Billing, API Keys, Webhooks & Domains Migration
-- Version: 20260918000004_billing_apikeys_webhooks_domains.sql
-- Strictly authoritative financial state, developer platform, and custom domains.
-- ==============================================================================

-- 1. BILLING PLANS & FEATURES
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY CHECK (id IN ('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE')),
    name TEXT NOT NULL,
    tier_level INTEGER NOT NULL,
    monthly_price_minor BIGINT NOT NULL DEFAULT 0,
    annual_price_minor BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plan_features (
    plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    numeric_limit INTEGER,
    boolean_allowed BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY(plan_id, feature_key)
);

-- Seed Default Plans with Minor Units (paisa)
INSERT INTO public.plans (id, name, tier_level, monthly_price_minor, annual_price_minor) VALUES
    ('FREE', 'Starter Free', 0, 0, 0),
    ('PRO', 'Professional', 1, 99900, 999000),      -- ₹999/mo, ₹9,990/yr
    ('BUSINESS', 'Business Suite', 2, 299900, 2999000), -- ₹2,999/mo, ₹29,990/yr
    ('ENTERPRISE', 'Enterprise Infrastructure', 3, 999900, 9999000)
ON CONFLICT (id) DO UPDATE SET
    monthly_price_minor = EXCLUDED.monthly_price_minor,
    annual_price_minor = EXCLUDED.annual_price_minor;

-- 2. SUBSCRIPTIONS & CASHFREE PAYMENTS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCEL_SCHEDULED', 'CANCELLED', 'EXPIRED')),
    cashfree_subscription_id TEXT,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
    legacy_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CRITICAL FINANCIAL INVARIANT:
-- Payments reference organizations with ON DELETE RESTRICT so ledger records are never deleted!
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    cashfree_order_id TEXT NOT NULL UNIQUE,
    amount_minor BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'USER_DROPPED')),
    payment_method TEXT,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    raw_payload_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    boolean_allowed BOOLEAN NOT NULL DEFAULT true,
    numeric_limit INTEGER NOT NULL DEFAULT 0,
    current_usage INTEGER NOT NULL DEFAULT 0,
    reset_period TEXT DEFAULT 'MONTHLY' CHECK (reset_period IN ('MONTHLY', 'ANNUAL', 'NEVER')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_payments_org ON public.payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(cashfree_order_id);

-- 3. DEVELOPER PLATFORM (API KEYS & OUTBOUND WEBHOOKS)
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    prefix TEXT NOT NULL, -- e.g. "nxtqr_live_"
    key_hash TEXT NOT NULL UNIQUE,
    scopes JSONB NOT NULL DEFAULT '["qr:read"]'::jsonb,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret_hash TEXT NOT NULL,
    events JSONB NOT NULL DEFAULT '["*"]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload_json JSONB NOT NULL,
    http_status INTEGER,
    response_ms INTEGER,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_webhooks_endpoint ON public.webhook_deliveries(endpoint_id, created_at DESC);

-- 4. CUSTOM DOMAINS & RESOLUTION HOSTNAMES
CREATE TABLE IF NOT EXISTS public.custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    domain TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFYING', 'ACTIVE', 'ERROR', 'SUSPENDED')),
    verification_token TEXT NOT NULL,
    ssl_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON public.custom_domains(domain);
