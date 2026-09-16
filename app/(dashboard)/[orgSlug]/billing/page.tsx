import * as React from "react";
import { CreditCard, Check, Sparkles, ArrowRight, ShieldCheck, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanBadge } from "@/components/shared/plan-badge";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        breadcrumbs={[
          { label: "Acme Corp", href: `/${orgSlug}` },
          { label: "Billing & Plans" },
        ]}
        title="Subscription & Billing"
        description="Manage your subscription plan, seat allocation, usage quotas, and payment receipts."
        badge={<PlanBadge plan="pro" />}
      />

      {/* Current Plan Overview Banner */}
      <div className="rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-surface to-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Current Plan</span>
            <Badge variant="indigo">Pro Tier</Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            $49 <span className="text-sm font-normal text-muted-foreground">/ month, billed annually</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Next renewal on October 16, 2026 • Renews automatically via Cashfree Payments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            Change Payment Method
          </Button>
          <Button size="sm">
            Upgrade to Business
          </Button>
        </div>
      </div>

      {/* Quota Usage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Active Dynamic QRs</span>
            <span className="font-semibold text-foreground">42 / 100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: "42%" }} />
          </div>
          <span className="text-[10px] text-muted-foreground">58 remaining on Pro</span>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monthly Scans</span>
            <span className="font-semibold text-foreground">148,290 / 250,000</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: "59%" }} />
          </div>
          <span className="text-[10px] text-muted-foreground">Resets in 14 days</span>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Team Seats</span>
            <span className="font-semibold text-foreground">14 / 20</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: "70%" }} />
          </div>
          <span className="text-[10px] text-muted-foreground">6 available seats</span>
        </Card>
      </div>

      {/* Plan Comparison Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FREE */}
          <Card className="flex flex-col justify-between p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-foreground">Free</h4>
                <p className="text-xs text-muted-foreground mt-1">Basic static QR generation</p>
              </div>
              <div className="text-2xl font-bold text-foreground">$0</div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Up to 5 Static QR Codes</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Standard PNG Downloads</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Basic Scan Counter</li>
              </ul>
            </div>
            <Button variant="outline" size="sm" className="mt-6 w-full" disabled>Current Plan</Button>
          </Card>

          {/* PRO (Current) */}
          <Card className="flex flex-col justify-between p-6 border-primary shadow-md relative bg-surface-elevated">
            <span className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Active Tier
            </span>
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-foreground">Pro</h4>
                <p className="text-xs text-muted-foreground mt-1">Dynamic routing & analytics for growing brands</p>
              </div>
              <div className="text-2xl font-bold text-foreground">$49 <span className="text-xs text-muted-foreground font-normal">/ month</span></div>
              <ul className="space-y-2 text-xs text-foreground">
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> 100 Dynamic QR Codes</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> 250,000 monthly scans</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Qora Brain Dynamic Routing</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Qora Guardian 24/7 Link Health</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Vector SVG & EPS Exports</li>
              </ul>
            </div>
            <Button variant="outline" size="sm" className="mt-6 w-full text-primary border-primary/30" disabled>
              Active Subscription
            </Button>
          </Card>

          {/* BUSINESS */}
          <Card className="flex flex-col justify-between p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-foreground">Business</h4>
                <p className="text-xs text-muted-foreground mt-1">For marketing teams, agencies & enterprises</p>
              </div>
              <div className="text-2xl font-bold text-foreground">$199 <span className="text-xs text-muted-foreground font-normal">/ month</span></div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Unlimited Dynamic QR Codes</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Custom White-label Domains</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Unlimited Team Members & RBAC</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Developer API & Webhooks</li>
                <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Dedicated Account Manager</li>
              </ul>
            </div>
            <Button size="sm" className="mt-6 w-full">Upgrade to Business</Button>
          </Card>
        </div>
      </div>

      {/* Payment Receipts / Invoices Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Billing History & Invoices</h3>
          <span className="text-xs text-muted-foreground">Cashfree Gateway Receipts</span>
        </div>
        <div className="divide-y divide-border/60 text-xs">
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Invoice #QRA-2026-0816</p>
              <p className="text-[11px] text-muted-foreground">August 16, 2026 • Pro Annual Plan</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-foreground tabular-nums">$588.00</span>
              <Badge variant="success">Paid</Badge>
              <Button variant="ghost" size="iconSm" title="Download PDF">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
