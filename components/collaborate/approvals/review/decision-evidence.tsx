"use client";

import * as React from "react";
import type { ApprovalDetail, ApprovalSummary } from "@/lib/supabase/types/approvals";
import { formatDate, cn } from "@/lib/utils";
import { CheckCircle2, XCircle, RotateCcw, Ban, ShieldCheck, QrCode } from "lucide-react";

interface DecisionEvidenceProps {
  approval: ApprovalDetail | ApprovalSummary;
  className?: string;
}

export function DecisionEvidence({ approval, className }: DecisionEvidenceProps) {
  const status = approval.status.toUpperCase();
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const isChangesRequested = status === "CHANGES_REQUESTED";

  const deciderName = approval.decidedBy?.name || "Authorized Reviewer";
  const decidedDate = approval.decidedAt ? formatDate(approval.decidedAt) : "Recently Decided";
  const targetRev = approval.targetRevisionNumber || 1;

  return (
    <div
      className={cn(
        "p-5 rounded-xl border bg-card/60 font-mono space-y-4 shadow-sm",
        isApproved
          ? "border-emerald-500/30 bg-emerald-500/5"
          : isRejected
          ? "border-rose-500/30 bg-rose-500/5"
          : isChangesRequested
          ? "border-orange-500/30 bg-orange-500/5"
          : "border-border/80 bg-muted/20",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            IMMUTABLE GOVERNANCE EVIDENCE
          </div>
          <div className="text-base font-sans font-bold text-foreground flex items-center gap-2">
            {isApproved ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Decision Approved: Revision {targetRev}</span>
              </>
            ) : isRejected ? (
              <>
                <XCircle className="w-5 h-5 text-rose-500" />
                <span>Decision Rejected: Revision {targetRev}</span>
              </>
            ) : isChangesRequested ? (
              <>
                <RotateCcw className="w-5 h-5 text-orange-500" />
                <span>Changes Requested on Revision {targetRev}</span>
              </>
            ) : (
              <>
                <Ban className="w-5 h-5 text-muted-foreground" />
                <span>Request Withdrawn</span>
              </>
            )}
          </div>
        </div>

        {/* Signature Feature: QR-Inspired Governance Stamp */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg border border-border/80 bg-background/80 shadow-2xs self-start sm:self-auto">
          <div className="w-8 h-8 rounded bg-foreground/5 border border-border flex items-center justify-center">
            <QrCode className="w-5 h-5 text-foreground/80" />
          </div>
          <div className="flex flex-col text-[10px]">
            <span className="font-bold text-foreground uppercase tracking-wider">
              {status} · REV {targetRev}
            </span>
            <span className="text-muted-foreground">{approval.publicId}</span>
          </div>
        </div>
      </div>

      {/* Decision Metadata Ledger */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-background/50 border border-border/40 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase">Reviewer</span>
          <div className="font-semibold text-foreground truncate">{deciderName}</div>
        </div>

        <div className="p-2.5 rounded-lg bg-background/50 border border-border/40 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase">Timestamp</span>
          <div className="font-semibold text-foreground">{decidedDate}</div>
        </div>

        <div className="p-2.5 rounded-lg bg-background/50 border border-border/40 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase">Target Revision</span>
          <div className="font-semibold text-foreground font-mono">REV {targetRev}</div>
        </div>

        <div className="p-2.5 rounded-lg bg-background/50 border border-border/40 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase">Execution State</span>
          <div className="font-semibold text-foreground font-mono uppercase">
            {approval.executionStatus || "NOT_STARTED"}
          </div>
        </div>
      </div>

      {/* Optional Decision Note */}
      {approval.decisionNote && (
        <div className="p-3 rounded-lg bg-background/60 border border-border/50 space-y-1">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Decision Rationale</span>
          <p className="text-xs text-foreground/90 font-sans leading-relaxed">
            &ldquo;{approval.decisionNote}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
