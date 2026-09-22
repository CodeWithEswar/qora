"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApprovalSummary } from "@/lib/supabase/types/approvals";
import { formatDate, cn } from "@/lib/utils";
import { ArrowRight, Clock, ShieldCheck, XCircle, AlertCircle } from "lucide-react";

interface ApprovalRowProps {
  approval: ApprovalSummary;
  isSelected?: boolean;
  onSelect: (approval: ApprovalSummary) => void;
}

export function ApprovalRow({ approval, isSelected, onSelect }: ApprovalRowProps) {
  const isPending = approval.status === "PENDING";
  const isApproved = approval.status === "APPROVED";
  const isRejected = approval.status === "REJECTED";

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      onClick={() => onSelect(approval)}
      className={cn(
        "group relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
          : "border-border/70 bg-card/40 hover:bg-card/90 hover:border-border hover:shadow-xs"
      )}
    >
      {/* Left: Ref, Title, Affected Object */}
      <div className="flex items-start gap-3.5 min-w-0 flex-1 pr-4">
        {/* Monospace Reference Badge */}
        <div className="pt-0.5 shrink-0">
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-muted text-foreground border border-border/70">
            {approval.publicId}
          </span>
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-sans font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {approval.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-muted-foreground">
            <span className="text-foreground/80 font-medium">{approval.affectedEntityRef}</span>
            <span className="text-border" aria-hidden="true">•</span>
            <span>Requested by {approval.requestedBy.name}</span>
            {approval.assignedTeam && (
              <>
                <span className="text-border" aria-hidden="true">•</span>
                <span className="text-primary font-medium">{approval.assignedTeam.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Telemetry, State Badge, Inspect Trigger */}
      <div className="flex items-center justify-between md:justify-end gap-4 mt-3 md:mt-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-border/40 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
          <span>{formatDate(approval.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5",
              isPending && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
              isApproved && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
              isRejected && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
              approval.status === "CANCELLED" && "bg-muted text-muted-foreground border-border"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
                isPending && "bg-amber-500 animate-pulse",
                isApproved && "bg-emerald-500",
                isRejected && "bg-rose-500",
                approval.status === "CANCELLED" && "bg-muted-foreground"
              )}
            />
            {approval.status === "PENDING" ? "NEEDS REVIEW" : approval.status}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">Inspect request</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
