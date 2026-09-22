"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ApprovalRequestStatus } from "@/lib/supabase/types/approvals";
import { CheckCircle2, RotateCcw, XCircle, ShieldAlert, Clock } from "lucide-react";

interface RevisionGateProps {
  baseRevisionNumber?: number;
  targetRevisionNumber: number;
  status: ApprovalRequestStatus;
  changesCount?: number;
  className?: string;
}

export function RevisionGate({
  baseRevisionNumber = 1,
  targetRevisionNumber = 2,
  status,
  changesCount = 3,
  className,
}: RevisionGateProps) {
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const isChangesRequested = status === "CHANGES_REQUESTED";
  const isPending = status === "PENDING" || status === "WAITING" || status === "IN_REVIEW";

  return (
    <div className={cn("flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card/50 font-mono", className)}>
      {/* Current Base State */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            CURRENT BASE
          </span>
          <span className="text-sm font-bold text-foreground">
            REV {baseRevisionNumber}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50">
          Published
        </span>
      </div>

      {/* Center Gate Marker */}
      <div className="flex flex-col items-center gap-1 px-4">
        <div className="flex items-center gap-2">
          <div className="h-px w-8 sm:w-16 bg-border" />
          <div
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-2xs",
              isApproved && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
              isRejected && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
              isChangesRequested && "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
              isPending && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
            )}
          >
            {isApproved ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            ) : isRejected ? (
              <XCircle className="w-3 h-3 text-rose-500" />
            ) : isChangesRequested ? (
              <RotateCcw className="w-3 h-3 text-orange-500" />
            ) : (
              <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
            )}
            <span>
              {isApproved
                ? "GATE PASSED"
                : isRejected
                ? "GATE REJECTED"
                : isChangesRequested
                ? "GATE RETURNED"
                : "GOVERNANCE GATE"}
            </span>
          </div>
          <div className="h-px w-8 sm:w-16 bg-border" />
        </div>
        <span className="text-[9px] text-muted-foreground">
          {changesCount} changed {changesCount === 1 ? "property" : "properties"}
        </span>
      </div>

      {/* Proposed Target State */}
      <div className="flex items-center gap-3 text-right">
        <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold">
          Proposed
        </span>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            PROPOSED TARGET
          </span>
          <span className="text-sm font-bold text-foreground">
            REV {targetRevisionNumber}
          </span>
        </div>
      </div>
    </div>
  );
}
