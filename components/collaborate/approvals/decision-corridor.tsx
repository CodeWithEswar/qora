"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApprovalSummary } from "@/lib/supabase/types/approvals";
import { formatDate, cn } from "@/lib/utils";
import {
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldCheck,
  Ban,
  Radio,
} from "lucide-react";

interface DecisionCorridorCardProps {
  approval: ApprovalSummary;
  organizationSlug: string;
  onViewImpact?: (approval: ApprovalSummary) => void;
  isSelected?: boolean;
}

export function DecisionCorridorCard({
  approval,
  organizationSlug,
  onViewImpact,
  isSelected,
}: DecisionCorridorCardProps) {
  const status = approval.status.toUpperCase();
  const isPending = status === "PENDING" || status === "WAITING";
  const isInReview = status === "IN_REVIEW";
  const isChangesRequested = status === "CHANGES_REQUESTED";
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const isWithdrawn = status === "WITHDRAWN" || status === "CANCELLED";

  // Delta count calculation
  const totalChangedProperties = approval.changeTopology?.reduce(
    (acc, cur) => acc + (cur.changeCount || 0),
    0
  ) || 3;

  const baseRev = approval.baseRevisionNumber ?? (approval.targetRevisionNumber > 1 ? approval.targetRevisionNumber - 1 : 1);
  const targetRev = approval.targetRevisionNumber;

  const reviewUrl = `/${organizationSlug}/approvals/${approval.publicId || approval.id}`;

  const getStatusBadge = () => {
    if (approval.isActionableForUser) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold"
        >
          <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-amber-500 animate-pulse inline-block" />
          WAITING FOR YOU
        </Badge>
      );
    }
    if (isPending) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        >
          <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-amber-500 inline-block" />
          WAITING REVIEW
        </Badge>
      );
    }
    if (isInReview) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
        >
          <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-sky-500 animate-pulse inline-block" />
          IN REVIEW
        </Badge>
      );
    }
    if (isChangesRequested) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
        >
          <RotateCcw className="w-2.5 h-2.5 mr-1 inline-block" />
          CHANGES REQUESTED
        </Badge>
      );
    }
    if (isApproved) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        >
          <CheckCircle2 className="w-2.5 h-2.5 mr-1 inline-block" />
          APPROVED
        </Badge>
      );
    }
    if (isRejected) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
        >
          <XCircle className="w-2.5 h-2.5 mr-1 inline-block" />
          REJECTED
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-muted text-muted-foreground border-border"
      >
        <Ban className="w-2.5 h-2.5 mr-1 inline-block" />
        WITHDRAWN
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        "rounded-xl border transition-all p-4 sm:p-5 flex flex-col gap-4",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
          : "border-border/70 bg-card/40 hover:bg-card/70 hover:border-border hover:shadow-xs"
      )}
    >
      {/* 1. Header: Domain Pill · Title · Revision · Status Gate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/50">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-foreground border border-border/60">
            {approval.type.replace(/_/g, " ")}
          </span>
          <span className="text-border" aria-hidden="true">/</span>
          <h3 className="text-sm font-semibold text-foreground truncate max-w-md">
            {approval.title}
          </h3>
          <span className="text-[11px] font-mono text-muted-foreground font-semibold">
            {approval.publicId}
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-[11px] font-mono font-bold text-foreground/90 bg-muted/60 px-2 py-0.5 rounded border border-border/50">
            REV {baseRev} → REV {targetRev}
          </span>
          {getStatusBadge()}
        </div>
      </div>

      {/* 2. SIGNATURE FEATURE — HORIZONTAL DECISION CORRIDOR (Desktop / Tablet) */}
      <div className="hidden md:block py-2">
        <div className="relative flex items-center justify-between">
          {/* Stage 1: REQUESTED */}
          <div className="flex flex-col items-start gap-1 z-10 bg-card/40 pr-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-border">
                <AvatarImage src={approval.requestedBy.avatarUrl || undefined} />
                <AvatarFallback className="text-[10px] font-mono">
                  {getInitials(approval.requestedBy.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                  {approval.requestedBy.name}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  requested
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
              <span className="text-[10px] font-mono text-muted-foreground">
                {formatDate(approval.createdAt)}
              </span>
            </div>
          </div>

          {/* Rail Connector 1-2 */}
          <div className="flex-1 h-px bg-border/80 relative mx-2">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-border/80" />
          </div>

          {/* Stage 2: REVISION */}
          <div className="flex flex-col items-center gap-1 z-10 bg-card/40 px-3 text-center">
            <span className="text-xs font-mono font-bold text-foreground">
              REV {baseRev} → REV {targetRev}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2.5 h-2.5 rounded-xs bg-foreground/80 border-2 border-background" />
              <span className="text-[10px] font-mono text-primary font-medium">
                {totalChangedProperties} properties changed
              </span>
            </div>
          </div>

          {/* Rail Connector 2-3 */}
          <div className="flex-1 h-px bg-border/80 relative mx-2" />

          {/* Stage 3: REVIEW */}
          <div className="flex flex-col items-center gap-1 z-10 bg-card/40 px-3 text-center">
            <span className="text-xs font-medium text-foreground">
              {approval.isActionableForUser ? (
                <span className="text-primary font-bold">You (Reviewer)</span>
              ) : approval.assignedTeam ? (
                approval.assignedTeam.name
              ) : (
                "Authorized Reviewer"
              )}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full border-2 border-background",
                  isApproved
                    ? "bg-emerald-500"
                    : isRejected
                    ? "bg-rose-500"
                    : isChangesRequested
                    ? "bg-orange-500"
                    : "bg-amber-500 animate-pulse"
                )}
              />
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                {approval.reviewPolicy.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Rail Connector 3-4 */}
          <div className="flex-1 h-px bg-border/80 relative mx-2" />

          {/* Stage 4: OUTCOME */}
          <div className="flex flex-col items-end gap-1 z-10 bg-card/40 pl-2 text-right">
            <span className="text-xs font-mono font-bold text-foreground">
              {isApproved ? "PUBLISHED" : isRejected ? "REJECTED" : isChangesRequested ? "RETURNED" : "PENDING"}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono text-muted-foreground">
                {isApproved ? "Edge live" : "Gate locked"}
              </span>
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full border-2 border-background",
                  isApproved ? "bg-emerald-500" : "bg-muted-foreground/40"
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2b. VERTICALLY RECOMPOSED DECISION CORRIDOR (Mobile / Small Tablet) */}
      <div className="block md:hidden py-1">
        <div className="relative pl-6 space-y-3 border-l-2 border-border/80 ml-2">
          {/* Node 1 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Requested by {approval.requestedBy.name}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{formatDate(approval.createdAt)}</span>
            </div>
          </div>

          {/* Node 2 */}
          <div className="relative">
            <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-xs bg-foreground/80" />
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-foreground">REV {baseRev} → REV {targetRev}</span>
              <span className="text-[10px] text-primary">{totalChangedProperties} properties changed</span>
            </div>
          </div>

          {/* Node 3 */}
          <div className="relative">
            <div
              className={cn(
                "absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full",
                isApproved ? "bg-emerald-500" : "bg-amber-500"
              )}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Reviewer: {approval.isActionableForUser ? "You" : approval.assignedTeam?.name || "Operators"}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">{status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Footer: Impact preview trigger + Review button */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground font-mono">
          <span className="text-foreground/80 font-medium">{approval.affectedEntityRef}</span>
          {onViewImpact && (
            <button
              type="button"
              onClick={() => onViewImpact(approval)}
              className="text-[11px] text-primary hover:underline font-mono inline-flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3 h-3" />
              Impact radius ({approval.impactRadius?.[0]?.count ?? 1})
            </button>
          )}
        </div>

        <Link href={reviewUrl}>
          <Button
            size="sm"
            className="text-xs font-mono h-8 px-3.5 bg-primary hover:bg-primary/90 text-white shadow-xs group"
          >
            <span>Review changes</span>
            <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
