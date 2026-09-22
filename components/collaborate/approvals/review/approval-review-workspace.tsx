"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChangeTopology } from "./change-topology";
import { RevisionGate } from "./revision-gate";
import { RevisionDiff } from "./revision-diff";
import { ImpactRadius } from "./impact-radius";
import { ReviewerPath } from "./reviewer-path";
import { DecisionDock } from "./decision-dock";
import { ApproveReviewDialog } from "../approve-review-dialog";
import { RejectReviewDialog } from "../reject-review-dialog";
import { RequestChangesDialog } from "../dialogs/request-changes-dialog";
import { WithdrawRequestAlert } from "../dialogs/withdraw-request-alert";
import { ImpactResourcesSheet } from "../sheets/impact-resources-sheet";
import type {
  ApprovalDetail,
  ChangeTopologyCategory,
  ImpactRadiusCategory,
} from "@/lib/supabase/types/approvals";
import { formatDate, cn } from "@/lib/utils";
import {
  ArrowLeft,
  Layers,
  GitCompare,
  ShieldCheck,
  MessageSquare,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ApprovalReviewWorkspaceProps {
  approval: ApprovalDetail;
  organizationSlug: string;
  currentUserId?: string;
}

export type ReviewLens = "changes" | "impact" | "governance" | "discussion";

export function ApprovalReviewWorkspace({
  approval,
  organizationSlug,
  currentUserId,
}: ApprovalReviewWorkspaceProps) {
  const router = useRouter();

  // Active Decision Lens
  const [activeLens, setActiveLens] = React.useState<ReviewLens>("changes");
  const [selectedTopologyCategory, setSelectedTopologyCategory] = React.useState<ChangeTopologyCategory | "ALL">("ALL");

  // Dialog & Sheet States
  const [isApproveOpen, setIsApproveOpen] = React.useState(false);
  const [isRequestChangesOpen, setIsRequestChangesOpen] = React.useState(false);
  const [isRejectOpen, setIsRejectOpen] = React.useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false);
  const [isImpactSheetOpen, setIsImpactSheetOpen] = React.useState(false);

  // Discussion state
  const [comments, setComments] = React.useState<Array<{ id: string; author: string; text: string; time: string }>>([
    {
      id: "c-01",
      author: approval.requestedBy.name,
      text: approval.reason || `Submitted revision ${approval.targetRevisionNumber} for operational review.`,
      time: formatDate(approval.createdAt),
    },
  ]);
  const [newComment, setNewComment] = React.useState("");

  const baseRev = approval.baseRevisionNumber ?? (approval.targetRevisionNumber > 1 ? approval.targetRevisionNumber - 1 : 1);
  const targetRev = approval.targetRevisionNumber;

  // Handlers
  const handleApprove = async (note?: string) => {
    try {
      const res = await fetch(
        `/api/v1/organizations/${organizationSlug}/approvals/${approval.id}/decide`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision: "APPROVED", note }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to commit approval.");
      toast.success(`Revision ${targetRev} approved and applied.`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve revision.");
      throw err;
    }
  };

  const handleRequestChanges = async (note: string) => {
    try {
      const res = await fetch(
        `/api/v1/organizations/${organizationSlug}/approvals/${approval.id}/request-changes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to send change request.");
      toast.success("Changes requested. The request has been returned to the author.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to request changes.");
      throw err;
    }
  };

  const handleReject = async (note?: string, reasonCode?: string) => {
    try {
      const res = await fetch(
        `/api/v1/organizations/${organizationSlug}/approvals/${approval.id}/decide`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision: "REJECTED", note, reasonCode }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to commit rejection.");
      toast.success(`Revision ${targetRev} rejected.`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject revision.");
      throw err;
    }
  };

  const handleWithdraw = async () => {
    try {
      const res = await fetch(
        `/api/v1/organizations/${organizationSlug}/approvals/${approval.id}/withdraw`,
        { method: "POST" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to withdraw request.");
      toast.success("Approval request withdrawn.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to withdraw request.");
      throw err;
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const item = {
      id: `c-${Date.now()}`,
      author: "You",
      text: newComment.trim(),
      time: "Just now",
    };
    setComments((prev) => [...prev, item]);
    setNewComment("");
    toast.success("Comment added to governance thread.");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Top Breadcrumb & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link
            href={`/${organizationSlug}/approvals`}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Approval Queue</span>
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-semibold">{approval.publicId}</span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <span className="text-muted-foreground">Requested by {approval.requestedBy.name}</span>
          <span className="text-border">•</span>
          <span className="text-muted-foreground">{formatDate(approval.createdAt)}</span>
        </div>
      </div>

      {/* 2. Workspace Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5">
              {approval.type.replace(/_/g, " ")}
            </Badge>
            <span className="text-sm font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
              REV {baseRev} ➔ REV {targetRev}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
            {approval.title}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Target Asset: {approval.affectedEntityRef} ({approval.affectedEntityType})
          </p>
        </div>

        {/* Status Gate Pill */}
        <div className="self-start sm:self-center font-mono">
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-3 py-1 uppercase tracking-wider font-semibold",
              approval.status === "APPROVED" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
              approval.status === "REJECTED" && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
              approval.status === "CHANGES_REQUESTED" && "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
              (approval.status === "PENDING" || approval.status === "WAITING") && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
            )}
          >
            {approval.status === "PENDING" || approval.status === "WAITING"
              ? approval.isActionableForUser ? "WAITING FOR YOU" : "WAITING FOR REVIEW"
              : approval.status}
          </Badge>
        </div>
      </div>

      {/* 3. SIGNATURE FEATURE — DECISION LENS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-border/70 overflow-x-auto no-scrollbar font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveLens("changes")}
          className={cn(
            "px-4 py-2.5 font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer",
            activeLens === "changes"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>CHANGES & DIFF</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLens("impact")}
          className={cn(
            "px-4 py-2.5 font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer",
            activeLens === "impact"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>IMPACT RADIUS</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted">
            {approval.impactRadius?.[0]?.count ?? 1}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLens("governance")}
          className={cn(
            "px-4 py-2.5 font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer",
            activeLens === "governance"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>GOVERNANCE & POLICY</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLens("discussion")}
          className={cn(
            "px-4 py-2.5 font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer",
            activeLens === "discussion"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>DISCUSSION</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted">
            {comments.length}
          </span>
        </button>
      </div>

      {/* 4. ACTIVE LENS CONTENT */}
      {activeLens === "changes" && (
        <div className="space-y-6">
          {/* Change Topology */}
          <ChangeTopology
            targetRevisionNumber={targetRev}
            topology={approval.changeTopology || []}
            selectedCategory={selectedTopologyCategory}
            onSelectCategory={setSelectedTopologyCategory}
          />

          {/* Revision Gate */}
          <RevisionGate
            baseRevisionNumber={baseRev}
            targetRevisionNumber={targetRev}
            status={approval.status}
            changesCount={approval.propertyDiffs?.length || 3}
          />

          {/* Revision Differential Renderer */}
          <RevisionDiff
            type={approval.type}
            propertyDiffs={approval.propertyDiffs || []}
            selectedCategory={selectedTopologyCategory}
            baseRevisionNumber={baseRev}
            targetRevisionNumber={targetRev}
          />
        </div>
      )}

      {activeLens === "impact" && (
        <div className="space-y-6">
          <ImpactRadius
            categories={approval.impactRadiusCategories || approval.impactRadius || []}
            onOpenCategorySheet={() => setIsImpactSheetOpen(true)}
          />
        </div>
      )}

      {activeLens === "governance" && (
        <div className="space-y-6">
          <ReviewerPath
            requesterName={approval.requestedBy.name}
            requesterAvatarUrl={approval.requestedBy.avatarUrl}
            policy={approval.reviewPolicy}
            assignedTeamName={approval.assignedTeam?.name}
            reviewers={approval.assignedReviewers}
            status={approval.status}
          />

          {/* Trace Event Ledger */}
          <div className="p-5 rounded-xl border border-border/70 bg-card/40 font-mono space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              CHRONOLOGICAL DECISION TRACE
            </div>

            <div className="space-y-2.5 pt-1">
              {approval.trace.map((evt, idx) => (
                <div key={evt.id || idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{evt.title}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(evt.timestamp)}</span>
                    </div>
                    {evt.description && (
                      <p className="text-[11px] text-muted-foreground font-sans mt-0.5">{evt.description}</p>
                    )}
                    <span className="text-[10px] text-primary/80">Actor: {evt.actorName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeLens === "discussion" && (
        <div className="p-5 rounded-xl border border-border/70 bg-card/40 font-mono space-y-4">
          <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-1.5 border-b border-border/50 pb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            GOVERNANCE COLLABORATION THREAD
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {comments.map((c) => (
              <div key={c.id} className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">{c.author}</span>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <p className="text-xs text-foreground/90 font-sans leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Add comment form */}
          <form onSubmit={handleAddComment} className="pt-2 border-t border-border/50 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add feedback or inquiry regarding this revision..."
              className="flex-1 h-9 px-3 text-xs font-mono bg-background/60 border border-border/70 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button type="submit" size="sm" className="h-9 px-3 bg-primary hover:bg-primary/90 text-white font-mono text-xs">
              <Send className="w-3.5 h-3.5 mr-1" />
              Send
            </Button>
          </form>
        </div>
      )}

      {/* 5. SIGNATURE FEATURE — STICKY DECISION DOCK */}
      <DecisionDock
        approval={approval}
        onApprove={() => setIsApproveOpen(true)}
        onRequestChanges={() => setIsRequestChangesOpen(true)}
        onReject={() => setIsRejectOpen(true)}
        onWithdraw={() => setIsWithdrawOpen(true)}
      />

      {/* 6. Action Dialogs & Sheets */}
      <ApproveReviewDialog
        approval={approval}
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApprove}
      />

      <RequestChangesDialog
        approval={approval}
        isOpen={isRequestChangesOpen}
        onClose={() => setIsRequestChangesOpen(false)}
        onConfirm={handleRequestChanges}
      />

      <RejectReviewDialog
        approval={approval}
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleReject}
      />

      <WithdrawRequestAlert
        approval={approval}
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onConfirm={handleWithdraw}
      />

      <ImpactResourcesSheet
        approval={approval}
        isOpen={isImpactSheetOpen}
        onClose={() => setIsImpactSheetOpen(false)}
        organizationSlug={organizationSlug}
      />
    </div>
  );
}
