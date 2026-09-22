"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  ApprovalRequestStatus,
  ApprovalExecutionStatus,
} from "@/lib/supabase/types/approvals";

interface DecisionRailProps {
  status: ApprovalRequestStatus;
  executionStatus: ApprovalExecutionStatus;
  layout?: "horizontal" | "vertical";
  className?: string;
}

export function DecisionRail({
  status,
  executionStatus,
  layout = "horizontal",
  className,
}: DecisionRailProps) {
  // Decision node state
  const isDecisionApproved = status === "APPROVED";
  const isDecisionRejected = status === "REJECTED";
  const isDecisionCancelled = status === "CANCELLED";
  const isDecisionPending = status === "PENDING";

  // Effect node state
  const isEffectApplied = executionStatus === "APPLIED";
  const isEffectProcessing = executionStatus === "PROCESSING" || executionStatus === "QUEUED";
  const isEffectFailed = executionStatus === "FAILED";
  const isEffectNotApplied = executionStatus === "NOT_STARTED" && !isDecisionApproved;

  // Accessible summary for screen readers
  const accessibleSummary = React.useMemo(() => {
    let decText = "Decision pending.";
    if (isDecisionApproved) decText = "Decision approved.";
    else if (isDecisionRejected) decText = "Decision rejected.";
    else if (isDecisionCancelled) decText = "Decision cancelled.";

    let effText = "Effect not applied.";
    if (isEffectApplied) effText = "Effect applied.";
    else if (isEffectProcessing) effText = "Effect applying.";
    else if (isEffectFailed) effText = "Effect execution failed.";

    return `Request created. Review ready. ${decText} ${effText}`;
  }, [isDecisionApproved, isDecisionRejected, isDecisionCancelled, isEffectApplied, isEffectProcessing, isEffectFailed]);

  if (layout === "vertical") {
    return (
      <div
        role="region"
        aria-label={accessibleSummary}
        className={cn("flex flex-col text-xs font-mono py-2", className)}
      >
        <span className="sr-only">{accessibleSummary}</span>

        {/* 1. Request */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <div className="w-px h-6 bg-border" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">REQUEST</div>
            <div className="text-xs font-medium text-foreground">Created</div>
          </div>
        </div>

        {/* 2. Review */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <div className="w-px h-6 bg-border" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">REVIEW</div>
            <div className="text-xs font-medium text-foreground">Ready</div>
          </div>
        </div>

        {/* 3. Decision */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            {isDecisionApproved && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            )}
            {isDecisionRejected && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
            )}
            {isDecisionCancelled && (
              <span className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground bg-background" />
            )}
            {isDecisionPending && (
              <span className="w-2.5 h-2.5 rounded-full border-2 border-amber-500 bg-background animate-pulse" />
            )}
            <div className="w-px h-6 bg-border" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">DECISION</div>
            <div className={cn(
              "text-xs font-medium",
              isDecisionApproved && "text-emerald-600 dark:text-emerald-400 font-semibold",
              isDecisionRejected && "text-rose-600 dark:text-rose-400 font-semibold",
              isDecisionPending && "text-amber-600 dark:text-amber-400"
            )}>
              {status}
            </div>
          </div>
        </div>

        {/* 4. Effect */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            {isEffectApplied && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            )}
            {isEffectProcessing && (
              <span className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-background animate-spin" />
            )}
            {isEffectFailed && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
            )}
            {isEffectNotApplied && (
              <span className="w-2.5 h-2.5 rounded-full border border-border bg-muted/40" />
            )}
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">EFFECT</div>
            <div className={cn(
              "text-xs font-medium",
              isEffectApplied && "text-emerald-600 dark:text-emerald-400 font-semibold",
              isEffectFailed && "text-rose-600 dark:text-rose-400 font-semibold",
              isEffectProcessing && "text-primary font-medium"
            )}>
              {executionStatus === "APPLIED"
                ? "Applied"
                : executionStatus === "FAILED"
                ? "Failed"
                : executionStatus === "PROCESSING"
                ? "Applying..."
                : "Not applied"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Horizontal Rail
  return (
    <div
      role="region"
      aria-label={accessibleSummary}
      className={cn("w-full py-3 px-4 rounded-lg bg-card/50 border border-border/60 text-xs font-mono", className)}
    >
      <span className="sr-only">{accessibleSummary}</span>

      <div className="flex items-center justify-between relative">
        {/* Continuous background connector line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-border/80 select-none pointer-events-none" aria-hidden="true" />

        {/* 1. Request */}
        <div className="flex flex-col items-center text-center relative z-10 bg-card px-2">
          <div className="text-[9px] text-muted-foreground tracking-wider uppercase mb-1">
            REQUEST
          </div>
          <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 mb-1" />
          <span className="text-[10px] text-foreground font-medium">Created</span>
        </div>

        {/* 2. Review */}
        <div className="flex flex-col items-center text-center relative z-10 bg-card px-2">
          <div className="text-[9px] text-muted-foreground tracking-wider uppercase mb-1">
            REVIEW
          </div>
          <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 mb-1" />
          <span className="text-[10px] text-foreground font-medium">Ready</span>
        </div>

        {/* 3. Decision */}
        <div className="flex flex-col items-center text-center relative z-10 bg-card px-2">
          <div className="text-[9px] text-muted-foreground tracking-wider uppercase mb-1">
            DECISION
          </div>
          {isDecisionApproved && (
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 mb-1" />
          )}
          {isDecisionRejected && (
            <span className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/10 mb-1" />
          )}
          {isDecisionCancelled && (
            <span className="w-3 h-3 rounded-full border-2 border-muted-foreground bg-background mb-1" />
          )}
          {isDecisionPending && (
            <span className="w-3 h-3 rounded-full border-2 border-amber-500 bg-background ring-4 ring-amber-500/10 mb-1 animate-pulse" />
          )}
          <span className={cn(
            "text-[10px] font-medium",
            isDecisionApproved && "text-emerald-600 dark:text-emerald-400 font-semibold",
            isDecisionRejected && "text-rose-600 dark:text-rose-400 font-semibold",
            isDecisionPending && "text-amber-600 dark:text-amber-400 font-semibold"
          )}>
            {isDecisionApproved ? "Approved" : isDecisionRejected ? "Rejected" : isDecisionCancelled ? "Cancelled" : "Pending"}
          </span>
        </div>

        {/* 4. Effect */}
        <div className="flex flex-col items-center text-center relative z-10 bg-card px-2">
          <div className="text-[9px] text-muted-foreground tracking-wider uppercase mb-1">
            EFFECT
          </div>
          {isEffectApplied && (
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 mb-1" />
          )}
          {isEffectProcessing && (
            <span className="w-3 h-3 rounded-full border-2 border-primary bg-background ring-4 ring-primary/10 mb-1 animate-spin" />
          )}
          {isEffectFailed && (
            <span className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/10 mb-1" />
          )}
          {isEffectNotApplied && (
            <span className="w-3 h-3 rounded-full border border-border bg-muted/40 mb-1" />
          )}
          <span className={cn(
            "text-[10px] font-medium",
            isEffectApplied && "text-emerald-600 dark:text-emerald-400 font-semibold",
            isEffectFailed && "text-rose-600 dark:text-rose-400 font-semibold",
            isEffectProcessing && "text-primary font-medium",
            isEffectNotApplied && "text-muted-foreground"
          )}>
            {executionStatus === "APPLIED"
              ? "Applied"
              : executionStatus === "FAILED"
              ? "Failed"
              : executionStatus === "PROCESSING"
              ? "Applying..."
              : "Not applied"}
          </span>
        </div>
      </div>
    </div>
  );
}
