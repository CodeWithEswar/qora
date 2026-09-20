"use client";

import * as React from "react";
import {
  CreditCard,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Download,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  PlanDefinition,
  PLAN_CATALOG,
  SaaSTier,
  SubscriptionStatus,
  PaymentLedgerEntry,
  PlanEntitlements,
  PlanCode,
} from "@nxtqr/contracts";
import { CheckoutDialog } from "./checkout-dialog";
import { DowngradePreviewDialog } from "./downgrade-preview-dialog";

interface BillingOverviewProps {
  organizationId: string;
  orgSlug: string;
  currentPlan: SaaSTier;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  limits: PlanEntitlements;
  usage: Record<string, number>;
  payments: PaymentLedgerEntry[];
  canManageBilling: boolean;
}

export function BillingOverview({
  organizationId,
  orgSlug,
  currentPlan,
  subscriptionStatus,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  limits,
  usage,
  payments,
  canManageBilling,
}: BillingOverviewProps) {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">("monthly");
  const [checkoutPlan, setCheckoutPlan] = React.useState<PlanDefinition | null>(null);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [downgradeTarget, setDowngradeTarget] = React.useState<SaaSTier | null>(null);
  const [downgradeOpen, setDowngradeOpen] = React.useState(false);

  // Quota values
  const dynamicUsed = usage["qr.dynamic.active"] || usage["qr.dynamic.max"] || 0;
  const dynamicLimit = limits["qr.dynamic.max"] || 3;
  const dynamicPct = Math.min(100, Math.round((dynamicUsed / dynamicLimit) * 100));

  const scansUsed = usage["scan.count"] || 0;
  const scansLimit = currentPlan === "FREE" ? 1000 : currentPlan === "PRO" ? 250000 : 1000000;
  const scansPct = Math.min(100, Math.round((scansUsed / scansLimit) * 100));

  const seatsUsed = usage["team.seats"] || 1;
  const seatsLimit = limits["team.maxSeats"] || 1;
  const seatsPct = Math.min(100, Math.round((seatsUsed / seatsLimit) * 100));

  const renewalDateStr = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "No expiration";

  const tierRanks: Record<SaaSTier, number> = {
    FREE: 0,
    PRO: 1,
    BUSINESS: 2,
    ENTERPRISE: 3,
  };

  const handleSelectPlan = (plan: PlanDefinition) => {
    if (!canManageBilling) return;

    if (tierRanks[plan.tier] > tierRanks[currentPlan]) {
      setCheckoutPlan(plan);
      setCheckoutOpen(true);
    } else if (tierRanks[plan.tier] < tierRanks[currentPlan]) {
      setDowngradeTarget(plan.tier);
      setDowngradeOpen(true);
    }
  };

  const executeDowngrade = async () => {
    // Non-destructive downgrade via server
    window.location.reload();
  };

  // Resolve pricing display for current plan
  const currentPlanDef =
    currentPlan === "PRO"
      ? billingCycle === "yearly" ? PLAN_CATALOG.pro_yearly : PLAN_CATALOG.pro_monthly
      : currentPlan === "BUSINESS"
      ? billingCycle === "yearly" ? PLAN_CATALOG.business_yearly : PLAN_CATALOG.business_monthly
      : currentPlan === "ENTERPRISE"
      ? PLAN_CATALOG.enterprise_annual
      : PLAN_CATALOG.free;

  const currentPriceDisplay =
    currentPlanDef.priceMinor > 0
      ? `₹${(currentPlanDef.priceMinor / 100).toLocaleString("en-IN")}`
      : "₹0";

  return (
    <div className="space-y-8 pb-12">
      {/* 1. CURRENT PLAN OVERVIEW BANNER */}
      <div className="rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-surface to-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Active Workspace Tier
            </span>
            <Badge
              variant={
                currentPlan === "ENTERPRISE"
                  ? "indigo"
                  : currentPlan === "BUSINESS"
                  ? "orange"
                  : currentPlan === "PRO"
                  ? "default"
                  : "outline"
              }
            >
              {currentPlan} Plan
            </Badge>
            <Badge
              variant={
                subscriptionStatus === "ACTIVE"
                  ? "success"
                  : subscriptionStatus === "PAST_DUE"
                  ? "danger"
                  : "secondary"
              }
            >
              {subscriptionStatus}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {currentPriceDisplay}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {currentPlanDef.priceMinor > 0
                ? billingCycle === "yearly"
                  ? "/ year"
                  : "/ month"
                : "Forever free"}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {currentPlan === "FREE"
              ? "Free plan includes essential dynamic QR capabilities and basic scan signals."
              : `Next renewal: ${renewalDateStr} • Managed via Cashfree Payments`}
          </p>
        </div>

        {canManageBilling && currentPlan !== "BUSINESS" && currentPlan !== "ENTERPRISE" && (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="bg-primary hover:bg-[#cc3a05] text-white"
              onClick={() => {
                const target =
                  currentPlan === "FREE"
                    ? billingCycle === "yearly" ? PLAN_CATALOG.pro_yearly : PLAN_CATALOG.pro_monthly
                    : billingCycle === "yearly" ? PLAN_CATALOG.business_yearly : PLAN_CATALOG.business_monthly;
                handleSelectPlan(target);
              }}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Upgrade to {currentPlan === "FREE" ? "Pro" : "Business"}
            </Button>
          </div>
        )}
      </div>

      {/* 2. QUOTA USAGE METERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dynamic QRs */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Active Dynamic QRs</span>
            <span className="font-semibold text-foreground">
              {dynamicUsed} / {dynamicLimit >= 999999 ? "Unlimited" : dynamicLimit}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${
                dynamicPct >= 90 ? "bg-amber-500" : "bg-primary"
              }`}
              style={{ width: `${dynamicPct}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {dynamicLimit >= 999999
              ? "Unlimited dynamic routing"
              : `${Math.max(0, dynamicLimit - dynamicUsed)} remaining on ${currentPlan}`}
          </span>
        </Card>

        {/* Monthly Scans */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monthly Scans</span>
            <span className="font-semibold text-foreground">
              {scansUsed.toLocaleString()} / {scansLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-500"
              style={{ width: `${scansPct}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            Measured asynchronously across global edge network
          </span>
        </Card>

        {/* Team Seats */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Team Seats</span>
            <span className="font-semibold text-foreground">
              {seatsUsed} / {seatsLimit >= 9999 ? "Unlimited" : seatsLimit}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${seatsPct}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {seatsLimit >= 9999
              ? "Unlimited collaborators"
              : `${Math.max(0, seatsLimit - seatsUsed)} available seat(s)`}
          </span>
        </Card>
      </div>

      {/* 3. PLAN COMPARISON MATRIX */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Available Workspace Plans</h3>
            <p className="text-xs text-muted-foreground">
              Select the capabilities, quotas, and governance controls right for your organization.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center rounded-lg border border-border p-1 bg-muted/40 text-xs">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1 rounded-md transition-colors ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                billingCycle === "yearly"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-emerald-500/15 text-emerald-500 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FREE PLAN */}
          <Card
            className={`flex flex-col justify-between p-6 ${
              currentPlan === "FREE" ? "border-primary/50 bg-surface-elevated" : ""
            }`}
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-foreground">Free</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Basic dynamic QR generation for individual creators
                </p>
              </div>
              <div className="text-2xl font-bold text-foreground">₹0</div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {PLAN_CATALOG.free.featuresSummary.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-6 w-full"
              disabled={currentPlan === "FREE" || !canManageBilling}
              onClick={() => handleSelectPlan(PLAN_CATALOG.free)}
            >
              {currentPlan === "FREE" ? "Current Plan" : "Downgrade to Free"}
            </Button>
          </Card>

          {/* PRO PLAN */}
          {(() => {
            const plan =
              billingCycle === "yearly" ? PLAN_CATALOG.pro_yearly : PLAN_CATALOG.pro_monthly;
            const isCurrent = currentPlan === "PRO";
            return (
              <Card
                className={`flex flex-col justify-between p-6 relative ${
                  isCurrent
                    ? "border-primary shadow-md bg-surface-elevated"
                    : "hover:border-primary/50 transition-colors"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Active Tier
                  </span>
                )}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-foreground">Pro</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dynamic routing, Link Guardian & analytics for growing brands
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    ₹{(plan.priceMinor / 100).toLocaleString("en-IN")}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      {billingCycle === "yearly" ? "/ year" : "/ month"}
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-foreground">
                    {plan.featuresSummary.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant={isCurrent ? "outline" : "default"}
                  size="sm"
                  className={`mt-6 w-full ${
                    !isCurrent && currentPlan === "FREE"
                      ? "bg-primary hover:bg-[#cc3a05] text-white"
                      : ""
                  }`}
                  disabled={isCurrent || !canManageBilling}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isCurrent
                    ? "Active Subscription"
                    : currentPlan === "FREE"
                    ? "Upgrade to Pro"
                    : "Downgrade to Pro"}
                </Button>
              </Card>
            );
          })()}

          {/* BUSINESS PLAN */}
          {(() => {
            const plan =
              billingCycle === "yearly"
                ? PLAN_CATALOG.business_yearly
                : PLAN_CATALOG.business_monthly;
            const isCurrent = currentPlan === "BUSINESS";
            return (
              <Card
                className={`flex flex-col justify-between p-6 relative ${
                  isCurrent
                    ? "border-primary shadow-md bg-surface-elevated"
                    : "hover:border-primary/50 transition-colors"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Active Tier
                  </span>
                )}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-foreground">Business</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Multi-step approvals, client portals, and Developer API
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    ₹{(plan.priceMinor / 100).toLocaleString("en-IN")}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      {billingCycle === "yearly" ? "/ year" : "/ month"}
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {plan.featuresSummary.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  size="sm"
                  className={`mt-6 w-full ${
                    isCurrent
                      ? ""
                      : "bg-primary hover:bg-[#cc3a05] text-white"
                  }`}
                  disabled={isCurrent || !canManageBilling}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isCurrent ? "Active Subscription" : "Upgrade to Business"}
                </Button>
              </Card>
            );
          })()}
        </div>
      </div>

      {/* 4. REAL PAYMENT RECEIPTS / INVOICES TABLE */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Payment History & Receipts</h3>
            <p className="text-[11px] text-muted-foreground">
              Official Cashfree Payment Gateway ledger records
            </p>
          </div>
          <span className="text-xs text-muted-foreground">Integer Minor Unit Precision</span>
        </div>

        {payments.length === 0 ? (
          <div className="p-8">
            <EmptyState preset="payments" />
          </div>
        ) : (
          <div className="divide-y divide-border/60 text-xs">
            {payments.map((p) => (
              <div key={p.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Order #{p.providerOrderId}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    • {p.paymentMethod || "Cashfree Checkout"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground tabular-nums">
                    ₹{(p.amountMinor / 100).toFixed(2)}
                  </span>
                  <Badge variant={p.status === "SUCCESS" ? "success" : "danger"}>
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        organizationId={organizationId}
        selectedPlan={checkoutPlan}
      />

      {/* Downgrade Preview Modal */}
      {downgradeTarget && (
        <DowngradePreviewDialog
          open={downgradeOpen}
          onOpenChange={setDowngradeOpen}
          currentTier={currentPlan}
          targetTier={downgradeTarget}
          onConfirm={executeDowngrade}
        />
      )}
    </div>
  );
}
