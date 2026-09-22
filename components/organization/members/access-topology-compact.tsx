"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AccessTopologyCompactProps {
  organizationName: string;
  activeMembersCount: number;
  teamsCount: number;
  pendingInvitationsCount: number;
  className?: string;
}

export function AccessTopologyCompact({
  organizationName,
  activeMembersCount,
  teamsCount,
  pendingInvitationsCount,
  className,
}: AccessTopologyCompactProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-surface/40 p-3 sm:p-4 text-xs font-mono select-none",
        className
      )}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
        <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold">
          ACCESS / ORGANIZATION
        </span>
        <span className="text-[10px] text-muted-foreground/80 font-mono">
          TOPOLOGY MAP
        </span>
      </div>

      <div className="space-y-1.5 pl-1">
        {/* Root Node */}
        <div className="flex items-center gap-2 text-foreground font-semibold tracking-tight">
          <span className="text-primary text-[11px] leading-none">●</span>
          <span className="uppercase text-[11px] font-sans font-bold">{organizationName}</span>
        </div>

        {/* Tree branches */}
        <div className="relative pl-2.5 ml-1 space-y-1.5 border-l border-border/80">
          {/* Branch 1: Active Members */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-border/90 leading-none">├──</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[11px] font-mono text-foreground font-medium">
              {activeMembersCount.toString().padStart(2, "0")} ACTIVE MEMBERS
            </span>
          </div>

          {/* Branch 2: Teams */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-border/90 leading-none">├──</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="text-[11px] font-mono text-foreground font-medium">
              {teamsCount.toString().padStart(2, "0")} TEAMS CONFIGURED
            </span>
          </div>

          {/* Branch 3: Pending Invitations */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-border/90 leading-none">└──</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-[11px] font-mono text-foreground font-medium">
              {pendingInvitationsCount.toString().padStart(2, "0")} PENDING INVITATIONS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
