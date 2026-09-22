import * as React from "react";
import { getSession } from "@/lib/auth/session";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import {
  SupabaseApprovalsRepository,
  ApprovalSummary,
  ApprovalSignalMetrics,
  ApprovalHorizonMetrics,
} from "@/lib/supabase/repositories/approvals";
import { ApprovalsView } from "@/components/collaborate/approvals/approvals-view";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Approvals — Decision Queue & Decision Workspace | NXTQR",
  description: "Review, govern, and decide consequential operational changes before edge execution across NXTQR.",
};

export default async function ApprovalsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const session = await getSession();

  let org = null;
  try {
    org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  } catch (err) {
    console.error("[ApprovalsPage] Failed to fetch organization from Supabase:", err);
  }

  // If organization not found in Supabase
  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Workspace Not Found
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            The workspace &quot;{orgSlug}&quot; could not be resolved from Supabase directory records.
          </p>
        </div>
        <Link href={`/${orgSlug}`}>
          <Button variant="outline" size="sm" className="text-xs">
            Return to Overview
          </Button>
        </Link>
      </div>
    );
  }

  // Fetch live Supabase approvals, signals, and horizon metrics
  let approvals: ApprovalSummary[] = [];
  let signalMetrics: ApprovalSignalMetrics = {
    totalRequests: 0,
    waitingCount: 0,
    inReviewCount: 0,
    decidedCount: 0,
    myActionCount: 0,
    openCount: 0,
    myReviewCount: 0,
    decidedTodayCount: 0,
  };
  let horizonMetrics: ApprovalHorizonMetrics = {
    needsReviewCount: 0,
    teamAssignedCount: 0,
    directAssignedCount: 0,
    waitingCount: 0,
    decidedCount: 0,
    topCategory: "QR Operations",
  };
  let loadError: string | null = null;

  try {
    const [fetchedApprovals, fetchedSignals, fetchedHorizon] = await Promise.all([
      SupabaseApprovalsRepository.listApprovals(org.id, undefined, session?.user?.id),
      SupabaseApprovalsRepository.getSignalMetrics(org.id, session?.user?.id),
      SupabaseApprovalsRepository.getHorizonMetrics(org.id),
    ]);

    approvals = fetchedApprovals;
    signalMetrics = fetchedSignals;
    horizonMetrics = fetchedHorizon;
  } catch (err: any) {
    console.error("[ApprovalsPage] Error fetching Supabase approvals data:", err);
    loadError = err?.message || "Failed to load approval decision records.";
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            APPROVALS / UNAVAILABLE
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Approval decision records couldn&apos;t be loaded
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            {loadError}
          </p>
        </div>
        <Link href={`/${orgSlug}/approvals`}>
          <Button size="sm" className="text-xs bg-primary hover:bg-primary/90 text-white">
            Try again
          </Button>
        </Link>
      </div>
    );
  }

  // Derive caller authorization from active session role
  const userMembership = session?.user?.workspaces?.find((w) => w.slug === orgSlug || w.id === org.id);
  const userRole = userMembership?.role || "OWNER";
  const canManage = userRole !== "VIEWER";

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <ApprovalsView
        organization={{
          id: org.id,
          name: org.name,
          slug: org.slug,
        }}
        initialApprovals={approvals}
        initialSignalMetrics={signalMetrics}
        initialHorizonMetrics={horizonMetrics}
        canManageApprovals={canManage}
      />
    </div>
  );
}
