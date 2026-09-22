"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import type { ApprovalDetail, ApprovalSummary } from "@/lib/supabase/types/approvals";
import { DecisionEvidence } from "./decision-evidence";
import { cn } from "@/lib/utils";
import { CheckCircle2, RotateCcw, XCircle, Ban, ShieldCheck } from "lucide-react";

interface DecisionDockProps {
  approval: ApprovalDetail | ApprovalSummary;
  onApprove: () => void;
  onRequestChanges: () => void;
  onReject: () => void;
  onWithdraw: () => void;
  className?: string;
}

export function DecisionDock({
  approval,
  onApprove,
  onRequestChanges,
  onReject,
  onWithdraw,
  className,
}: DecisionDockProps) {
  const status = approval.status.toUpperCase();
  const isDecided = status !== "PENDING" && status !== "WAITING" && status !== "IN_REVIEW";
  const targetRev = approval.targetRevisionNumber || 1;

  if (isDecided) {
    return <DecisionEvidence approval={approval} className={className} />;
  }

  const { canApprove, canReject, canRequestChanges, canWithdraw, isSelfRequester } = approval.availableActions;

  return (
    <div
      className={cn(
        "sticky bottom-4 z-30 p-4 sm:p-5 rounded-xl border border-border/80 bg-background/95 backdrop-blur-md shadow-lg font-mono",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Revision Context */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              Reviewing Revision {targetRev}
            </span>
            <span className="text-[10px] text-muted-foreground">({approval.publicId})</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">
            {isSelfRequester
              ? "You requested this revision. Decisions must be made by authorized peer reviewers."
              : "Your decision applies strictly to this immutable revision snapshot."}
          </p>
        </div>

        {/* Decision Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {canWithdraw && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onWithdraw}
              className="text-xs font-mono text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border-rose-500/20"
            >
              <Ban className="w-3.5 h-3.5 mr-1.5" />
              Withdraw request
            </Button>
          )}

          {canReject && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReject}
              className="text-xs font-mono text-muted-foreground hover:text-rose-600 hover:border-rose-500/30"
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              Reject
            </Button>
          )}

          {canRequestChanges && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRequestChanges}
              className="text-xs font-mono text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 border-orange-500/30"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Request changes
            </Button>
          )}

          {canApprove && (
            <Button
              type="button"
              size="sm"
              onClick={onApprove}
              className="text-xs font-mono bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Approve revision {targetRev}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
