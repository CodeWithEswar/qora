"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TeamMemberItem } from "@/lib/supabase/types/teams";

interface TeamMembershipDiffProps {
  teamName: string;
  currentMembers: TeamMemberItem[];
  proposedMembers: Array<{
    membershipId: string;
    displayName: string;
    roleName: string;
  }>;
  className?: string;
}

/**
 * NXTQR Team Membership Diff — Signature Concept #6
 * Visual side-by-side tree diff highlighting:
 * Current members vs Proposed members with hollow nodes (○) for additions,
 * and factual delta rails: ADDING (+) and REMOVING (-).
 */
export function TeamMembershipDiff({
  teamName,
  currentMembers,
  proposedMembers,
  className,
}: TeamMembershipDiffProps) {
  const currentIds = new Set(currentMembers.map((m) => m.membershipId));
  const proposedIds = new Set(proposedMembers.map((m) => m.membershipId));

  const adding = proposedMembers.filter((m) => !currentIds.has(m.membershipId));
  const removing = currentMembers.filter((m) => !proposedIds.has(m.membershipId));
  const unchanged = currentMembers.filter((m) => proposedIds.has(m.membershipId));

  return (
    <div className={cn("space-y-4 font-mono text-xs select-none", className)}>
      {/* Side-by-side Tree Rails */}
      <div className="rounded-xl border border-border/80 bg-surface/70 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold">
            MEMBERSHIP DIFF / TRANSFORMATION
          </span>
          <span className="text-[10px] text-muted-foreground">
            {currentMembers.length} → {proposedMembers.length} MEMBERS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CURRENT TREE */}
          <div className="p-3 rounded-lg border border-border/70 bg-surface/50 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase pb-1 border-b border-border/40 font-semibold">
              <span>CURRENT</span>
              <span>{currentMembers.length.toString().padStart(2, "0")} MEMBERS</span>
            </div>

            <div className="pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                <span className="font-bold text-foreground uppercase tracking-tight text-xs">
                  {teamName}
                </span>
              </div>

              {/* Branching Rail */}
              <div className="relative pl-3 ml-1 border-l border-border/70 space-y-1.5 pt-1.5 max-h-[160px] overflow-y-auto">
                {currentMembers.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic">No members assigned</p>
                ) : (
                  currentMembers.map((m, idx) => {
                    const isRemoved = removing.some((r) => r.membershipId === m.membershipId);
                    return (
                      <div
                        key={m.membershipId}
                        className={cn(
                          "flex items-center justify-between text-[11px] gap-2",
                          isRemoved ? "text-rose-600 dark:text-rose-400 line-through opacity-80" : "text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-border/90 select-none">
                            {idx === currentMembers.length - 1 ? "└──" : "├──"}
                          </span>
                          <span className="truncate">{m.displayName}</span>
                        </div>
                        {isRemoved && (
                          <span className="text-[10px] font-bold text-rose-500 shrink-0">
                            -
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* PROPOSED TREE */}
          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-primary uppercase pb-1 border-b border-primary/20 font-semibold">
              <span>PROPOSED</span>
              <span>{proposedMembers.length.toString().padStart(2, "0")} MEMBERS</span>
            </div>

            <div className="pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="font-bold text-primary uppercase tracking-tight text-xs">
                  {teamName}
                </span>
              </div>

              {/* Branching Rail */}
              <div className="relative pl-3 ml-1 border-l border-primary/30 space-y-1.5 pt-1.5 max-h-[160px] overflow-y-auto">
                {proposedMembers.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic">No members selected</p>
                ) : (
                  proposedMembers.map((m, idx) => {
                    const isAdded = adding.some((a) => a.membershipId === m.membershipId);
                    return (
                      <div
                        key={m.membershipId}
                        className={cn(
                          "flex items-center justify-between text-[11px] gap-2",
                          isAdded ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-foreground/80"
                        )}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-primary/40 select-none">
                            {idx === proposedMembers.length - 1 ? "└──" : "├──"}
                          </span>
                          {/* Hollow circle node for proposed addition */}
                          {isAdded && (
                            <span className="w-1.5 h-1.5 rounded-full border border-emerald-500 bg-transparent shrink-0" />
                          )}
                          <span className="truncate">{m.displayName}</span>
                        </div>
                        {isAdded && (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1 rounded border border-emerald-500/20 shrink-0">
                            +
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delta Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* ADDING */}
        <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-1">
          <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <span>ADDING / {adding.length.toString().padStart(2, "0")}</span>
            <span>+</span>
          </div>
          {adding.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">None</p>
          ) : (
            <div className="space-y-0.5">
              {adding.map((a) => (
                <div key={a.membershipId} className="text-[10px] text-emerald-700 dark:text-emerald-300 truncate">
                  + {a.displayName} ({a.roleName})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* REMOVING */}
        <div className="p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 space-y-1">
          <div className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>REMOVING / {removing.length.toString().padStart(2, "0")}</span>
            <span>-</span>
          </div>
          {removing.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">None</p>
          ) : (
            <div className="space-y-0.5">
              {removing.map((r) => (
                <div key={r.membershipId} className="text-[10px] text-rose-700 dark:text-rose-300 truncate">
                  - {r.displayName}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
