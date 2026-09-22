import * as React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { SupabaseOrgRepository } from "@/lib/supabase/repositories/organizations";
import { SupabaseApprovalsRepository } from "@/lib/supabase/repositories/approvals";
import { ApprovalReviewWorkspace } from "@/components/collaborate/approvals/review/approval-review-workspace";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string; approvalId: string }>;
}) {
  const { orgSlug, approvalId } = await params;
  return {
    title: `Review Request ${approvalId} — Governance Decision Workspace | NXTQR`,
    description: `Review immutable revision differential, downstream impact radius, and policy evidence before execution.`,
  };
}

export default async function ApprovalReviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string; approvalId: string }>;
}) {
  const { orgSlug, approvalId } = await params;
  const session = await getSession();

  let org = null;
  try {
    org = await SupabaseOrgRepository.getBySlugOrId(orgSlug);
  } catch (err) {
    console.error("[ApprovalReviewPage] Error resolving organization:", err);
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4 font-mono">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">Workspace Not Found</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            The workspace &quot;{orgSlug}&quot; could not be resolved from authoritative records.
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

  // Fetch authoritative approval detail
  let approval = null;
  try {
    approval = await SupabaseApprovalsRepository.getApprovalDetail(
      org.id,
      approvalId,
      session?.user?.id
    );
  } catch (err) {
    console.error("[ApprovalReviewPage] Error loading approval detail:", err);
  }

  if (!approval) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4 font-mono">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            APPROVALS / NOT FOUND
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Approval Request &quot;{approvalId}&quot; Not Found
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            The requested approval record does not exist or has been removed from this workspace.
          </p>
        </div>
        <Link href={`/${orgSlug}/approvals`}>
          <Button size="sm" variant="outline" className="text-xs font-mono">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Return to Approval Queue
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <ApprovalReviewWorkspace
        approval={approval}
        organizationSlug={orgSlug}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
