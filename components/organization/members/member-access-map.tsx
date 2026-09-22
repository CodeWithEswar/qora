"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";

interface MemberAccessMapProps {
  organizationName: string;
  memberName: string;
  roleName: string;
  roleCode?: string;
  teams: Array<{ id: string; name: string }>;
  capabilities?: string[];
  status?: "active" | "invited" | "suspended";
  onViewPermissions?: () => void;
  className?: string;
}

/**
 * NXTQR Member Access Map — Signature Interaction #2
 * Pure CSS/SVG architectural tree tracing Organization -> Member -> Role -> Teams.
 * Features hollow node (○) for invited vs filled node (●) for active,
 * and capability disclosure trigger.
 */
export function MemberAccessMap({
  organizationName,
  memberName,
  roleName,
  roleCode = "MEMBER",
  teams,
  capabilities = [],
  status = "active",
  onViewPermissions,
  className,
}: MemberAccessMapProps) {
  const isInvited = status === "invited";
  const isSuspended = status === "suspended";

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface/60 p-4 font-mono text-xs select-none shadow-xs",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold">
          ACCESS / RELATIONSHIP MAP
        </span>
        <span
          className={cn(
            "text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border",
            isInvited
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              : isSuspended
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          )}
        >
          {status === "invited" ? "○ INVITED" : status === "suspended" ? "⊘ SUSPENDED" : "● ACTIVE"}
        </span>
      </div>

      {/* Relational Tree */}
      <div className="space-y-3 pl-1">
        {/* Level 1: Organization Root */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-surface border border-border flex items-center justify-center text-primary font-bold text-xs shrink-0">
            ●
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground block leading-none">
              ORGANIZATION
            </span>
            <span className="text-xs font-bold text-foreground uppercase tracking-tight">
              {organizationName}
            </span>
          </div>
        </div>

        {/* Vertical Rail Connector */}
        <div className="relative pl-3 ml-3 border-l-2 border-border/70 space-y-3 py-0.5">
          {/* Level 2: Member Node */}
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-6 h-6 rounded-md border flex items-center justify-center font-bold text-xs shrink-0",
                isInvited
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                  : isSuspended
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              )}
            >
              {isInvited ? "○" : "●"}
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block leading-none">
                MEMBER IDENTITY
              </span>
              <span className="text-xs font-semibold text-foreground">
                {memberName}
              </span>
            </div>
          </div>

          {/* Level 3: Role Node */}
          <div className="flex items-center justify-between gap-2.5 pr-2">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                ●
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground block leading-none">
                  ROLE AUTHORITY
                </span>
                <span className="text-xs font-semibold text-primary uppercase">
                  {roleName}
                </span>
              </div>
            </div>

            {capabilities.length > 0 && (
              <button
                type="button"
                onClick={onViewPermissions}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono bg-surface border border-border text-foreground hover:bg-surface-hover hover:border-primary/40 transition-colors cursor-pointer"
              >
                <NxtqrIcon name="permission" size={11} className="text-primary" />
                <span>View {capabilities.length} capabilities</span>
              </button>
            )}
          </div>

          {/* Level 4: Teams Sub-tree */}
          <div className="pt-1">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <span className="text-teal-500">●</span>
              <span>ASSIGNED TEAMS</span>
            </div>

            {teams.length === 0 ? (
              <div className="text-[10px] text-muted-foreground italic pl-3 border-l border-border/50 py-1">
                No operational teams linked. Member has direct workspace scope.
              </div>
            ) : (
              <div className="space-y-1 pl-2 border-l border-border/60 ml-1">
                {teams.map((t, idx) => (
                  <div key={t.id} className="flex items-center gap-2 text-foreground">
                    <span className="text-border/90 text-xs select-none">
                      {idx === teams.length - 1 ? "└──" : "├──"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 text-[10px] font-medium">
                      <span className="text-[8px] text-teal-500">●</span>
                      {t.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
