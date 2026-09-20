import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PlanBadge } from "@/components/shared/plan-badge";
import { BillingOverview } from "@/components/billing/billing-overview";
import { getSession } from "@/lib/auth/session";
import { TIER_DEFAULT_ENTITLEMENTS, SaaSTier } from "@nxtqr/contracts";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const session = await getSession();

  const userWorkspace = session?.user?.workspaces?.find(
    (w) => w.slug === orgSlug || w.id === orgSlug
  );

  const organizationId = userWorkspace?.id || orgSlug;
  const canManageBilling =
    !userWorkspace || userWorkspace.role === "OWNER" || userWorkspace.role === "ADMIN";

  const currentPlan: SaaSTier = userWorkspace?.plan || "FREE";
  const limits = TIER_DEFAULT_ENTITLEMENTS[currentPlan];

  // In Next.js server runtime without active D1 binding, provide clean zero-state usage & payments
  const usage: Record<string, number> = {
    "qr.dynamic.active": 0,
    "scan.count": 0,
    "team.seats": 1,
  };
  const payments: any[] = [];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        breadcrumbs={[
          { label: orgSlug, href: `/${orgSlug}` },
          { label: "Billing & Plans" },
        ]}
        title="Subscription & Billing"
        description="Manage your subscription plan, seat allocation, usage quotas, and payment receipts."
        badge={<PlanBadge plan={currentPlan.toLowerCase() as any} />}
      />

      <BillingOverview
        organizationId={organizationId}
        orgSlug={orgSlug}
        currentPlan={currentPlan}
        subscriptionStatus="ACTIVE"
        limits={limits}
        usage={usage}
        payments={payments}
        canManageBilling={canManageBilling}
      />
    </div>
  );
}
