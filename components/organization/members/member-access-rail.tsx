"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MemberAccessRailProps {
  organizationName: string;
  memberName: string;
  roleName: string;
  teams: Array<{ id: string; name: string }>;
  className?: string;
}

export function MemberAccessRail({
  organizationName,
  memberName,
  roleName,
  teams,
  className,
}: MemberAccessRailProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-xl border border-border/60 bg-surface/50 text-[11px] font-mono",
        className
      )}
    >
      <div className="text-[10px] tracking-widest text-muted-foreground uppercase mb-2 font-semibold">
        ACCESS RELATIONSHIP
      </div>

      <div className="flex flex-col gap-2">
        {/* Horizontal Rail: Org -> Member -> Role */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Org Node */}
          <div className="flex items-center gap-1.5 bg-surface px-2 py-1 rounded-md border border-border/80">
            <span className="text-primary text-[9px]">●</span>
            <span className="font-semibold text-foreground truncate max-w-[120px]">
              {organizationName}
            </span>
          </div>

          <span className="text-muted-foreground/60 hidden sm:inline">────</span>

          {/* Member Node */}
          <div className="flex items-center gap-1.5 bg-surface px-2 py-1 rounded-md border border-border/80">
            <span className="text-emerald-500 text-[9px]">●</span>
            <span className="font-semibold text-foreground truncate max-w-[120px]">
              {memberName}
            </span>
          </div>

          <span className="text-muted-foreground/60 hidden sm:inline">────</span>

          {/* Role Node */}
          <div className="flex items-center gap-1.5 bg-surface px-2 py-1 rounded-md border border-border/80">
            <span className="text-amber-500 text-[9px]">●</span>
            <span className="font-semibold text-foreground">{roleName}</span>
          </div>

          {teams.length > 0 && (
            <span className="text-muted-foreground/60 hidden sm:inline">────</span>
          )}

          {/* Single Team Inline */}
          {teams.length === 1 && (
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20">
              <span className="text-[9px]">●</span>
              <span className="font-semibold truncate max-w-[120px]">
                {teams[0].name}
              </span>
            </div>
          )}
        </div>

        {/* Multi-team branching */}
        {teams.length > 1 && (
          <div className="pl-6 pt-1 space-y-1 border-l-2 border-border/80 ml-4">
            {teams.map((t, idx) => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="text-muted-foreground/80">
                  {idx === teams.length - 1 ? "└──" : "├──"}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium">
                  <span className="text-[8px]">●</span>
                  {t.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {teams.length === 0 && (
          <div className="text-[10px] text-muted-foreground italic pl-2 pt-0.5">
            No team memberships assigned. Member holds direct workspace authority.
          </div>
        )}
      </div>
    </div>
  );
}
