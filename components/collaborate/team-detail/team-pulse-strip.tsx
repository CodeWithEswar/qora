"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TeamPulseStripProps {
  memberCount: number;
  connectedWorkCount: number;
  pendingApprovalsCount: number;
  isArchived?: boolean;
  className?: string;
}

export function TeamPulseStrip({
  memberCount,
  connectedWorkCount,
  pendingApprovalsCount,
  isArchived = false,
  className,
}: TeamPulseStripProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border/70 bg-surface/60 font-mono text-xs select-none",
        className
      )}
      aria-label="Team Operational Telemetry Strip"
    >
      <div className="flex flex-wrap items-center gap-4 text-[11px]">
        {/* Signal 1: Members */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          <span className="font-bold text-foreground">
            {memberCount.toString().padStart(2, "0")}
          </span>
          <span className="text-muted-foreground uppercase text-[10px]">
            {memberCount === 1 ? "Member" : "Members"}
          </span>
        </div>

        <span className="text-border/80 hidden sm:inline">│</span>

        {/* Signal 2: Connected Work */}
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full shrink-0", connectedWorkCount > 0 ? "bg-amber-500" : "bg-muted-foreground/50")} />
          <span className="font-bold text-foreground">
            {connectedWorkCount.toString().padStart(2, "0")}
          </span>
          <span className="text-muted-foreground uppercase text-[10px]">
            Connected Work
          </span>
        </div>

        <span className="text-border/80 hidden sm:inline">│</span>

        {/* Signal 3: Governance / Approvals */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              pendingApprovalsCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50"
            )}
          />
          <span className="font-bold text-foreground">
            {pendingApprovalsCount.toString().padStart(2, "0")}
          </span>
          <span className="text-muted-foreground uppercase text-[10px]">
            {pendingApprovalsCount === 1 ? "Pending Approval" : "Pending Approvals"}
          </span>
        </div>
      </div>

      {/* Operational State Badge */}
      <div className="flex items-center gap-2 text-[10px]">
        <span className="text-muted-foreground hidden md:inline">SYSTEM STATE:</span>
        {isArchived ? (
          <Badge variant="outline" className="text-[9px] border-border bg-muted/50 text-muted-foreground">
            ARCHIVED
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-semibold">
            ● OPERATIONAL ACTIVE
          </Badge>
        )}
      </div>
    </div>
  );
}
