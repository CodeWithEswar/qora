"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApprovalSummary } from "@/lib/supabase/types/approvals";
import { formatDate, cn } from "@/lib/utils";
import {
  ArrowRight,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Ban,
  Layers,
} from "lucide-react";

interface ApprovalCompactRowProps {
  approval: ApprovalSummary;
  organizationSlug: string;
  onViewImpact?: (approval: ApprovalSummary) => void;
  isSelected?: boolean;
}

export function ApprovalCompactRow({
  approval,
  organizationSlug,
  onViewImpact,
  isSelected,
}: ApprovalCompactRowProps) {
  const status = approval.status.toUpperCase();
  const isPending = status === "PENDING" || status === "WAITING";
  const isInReview = status === "IN_REVIEW";
  const isChangesRequested = status === "CHANGES_REQUESTED";
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";

  const baseRev = approval.baseRevisionNumber ?? (approval.targetRevisionNumber > 1 ? approval.targetRevisionNumber - 1 : 1);
  const targetRev = approval.targetRevisionNumber;
  const reviewUrl = `/${organizationSlug}/approvals/${approval.publicId || approval.id}`;

  return (
    <div
      className={cn(
        "group flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-lg border transition-all gap-3",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
          : "border-border/60 bg-card/30 hover:bg-card/80 hover:border-border"
      )}
    >
      {/* 1. Request ID & Resource */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border/60 shrink-0">
          {approval.publicId}
        </span>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {approval.title}
            </span>
            <span className="text-[10px] font-mono uppercase text-muted-foreground/80 hidden sm:inline">
              ({approval.affectedEntityRef})
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Requested by {approval.requestedBy.name}
          </span>
        </div>
      </div>

      {/* 2. Revision */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs font-mono font-bold bg-muted/60 px-2 py-0.5 rounded border border-border/50 text-foreground">
          REV {baseRev} → {targetRev}
        </span>

        {/* 3. Review State */}
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5",
            isPending && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
            isInReview && "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
            isApproved && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
            isChangesRequested && "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
            isRejected && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
          )}
        >
          {isPending ? "WAITING" : isInReview ? "IN REVIEW" : status}
        </Badge>

        {/* 4. Actionable indicator */}
        {approval.isActionableForUser && (
          <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0">
            ACTION NEEDED
          </span>
        )}

        {/* 5. Date */}
        <span className="text-[11px] font-mono text-muted-foreground hidden lg:inline shrink-0">
          {formatDate(approval.createdAt)}
        </span>

        {/* 6. Navigate to Review */}
        <Link href={reviewUrl} className="shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2.5 text-xs font-mono hover:text-primary hover:bg-primary/5"
          >
            <span>Review</span>
            <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
