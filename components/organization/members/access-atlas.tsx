"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AccessAtlasProps {
  organizationName: string;
  totalMembers: number;
  activeMembers: number;
  rolesCount: number;
  teamsCount: number;
  pendingInvitationsCount?: number;
  onFilterByStatus?: (status: string) => void;
  onFilterByRole?: () => void;
  onFilterByTeam?: () => void;
  className?: string;
}

/**
 * NXTQR Access Atlas — Signature Interaction #1
 * A compact, restrained architectural relationship map connecting
 * Organization -> Members -> Roles -> Teams -> Access Capabilities.
 * Interactive nodes serve as filter shortcuts to operationalize the directory.
 */
export function AccessAtlas({
  organizationName,
  totalMembers,
  activeMembers,
  rolesCount,
  teamsCount,
  pendingInvitationsCount = 0,
  onFilterByStatus,
  onFilterByRole,
  onFilterByTeam,
  className,
}: AccessAtlasProps) {
  const formattedTotalMembers = totalMembers.toString().padStart(2, "0");
  const formattedActiveMembers = activeMembers.toString().padStart(2, "0");
  const formattedRoles = rolesCount.toString().padStart(2, "0");
  const formattedTeams = teamsCount.toString().padStart(2, "0");

  return (
    <section
      aria-label="Access Atlas Relationship Map"
      className={cn(
        "relative rounded-xl border border-border/80 bg-surface/60 p-4 sm:p-5 select-none transition-all shadow-xs",
        className
      )}
    >
      {/* Top Header Rail */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            ACCESS / ATLAS
          </span>
          <span className="text-border/80 hidden sm:inline">|</span>
          <span className="text-[11px] font-mono text-muted-foreground/80 hidden sm:inline">
            OPERATIONAL TOPOLOGY
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>AUTHORITATIVE STATE</span>
        </div>
      </div>

      {/* Signature Tree Matrix (Desktop + Mobile Adapted) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Column: Organization Root & Relational Branch */}
        <div className="lg:col-span-5 space-y-2">
          {/* Root Node: Organization */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 border border-primary/25 text-primary text-[10px] font-mono font-bold">
              ●
            </span>
            <div>
              <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground block leading-none mb-0.5">
                ORGANIZATION ROOT
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground uppercase">
                {organizationName}
              </span>
            </div>
          </div>

          {/* Relational Connectors to Nodes */}
          <div className="relative pl-3 ml-3 border-l-2 border-border/70 space-y-2 py-1">
            {/* Branch 1: Members */}
            <button
              type="button"
              onClick={() => onFilterByStatus?.("active")}
              className="group flex items-center gap-2.5 text-left w-full hover:bg-surface-hover/80 px-2 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <span className="font-mono text-border/90 text-xs select-none">├──</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 group-hover:scale-125 transition-transform" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-foreground">
                    {formattedTotalMembers} MEMBERS
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                    {formattedActiveMembers} ACTIVE
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  Click to filter active identities
                </span>
              </div>
            </button>

            {/* Branch 2: Roles */}
            <button
              type="button"
              onClick={() => onFilterByRole?.()}
              className="group flex items-center gap-2.5 text-left w-full hover:bg-surface-hover/80 px-2 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <span className="font-mono text-border/90 text-xs select-none">├──</span>
              <span className="w-2 h-2 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-foreground">
                    {formattedRoles} ASSIGNED ROLES
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  Click to focus role filters
                </span>
              </div>
            </button>

            {/* Branch 3: Teams */}
            <button
              type="button"
              onClick={() => onFilterByTeam?.()}
              className="group flex items-center gap-2.5 text-left w-full hover:bg-surface-hover/80 px-2 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <span className="font-mono text-border/90 text-xs select-none">└──</span>
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 group-hover:scale-125 transition-transform" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-foreground">
                    {formattedTeams} TEAMS
                  </span>
                  {pendingInvitationsCount > 0 && (
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
                      {pendingInvitationsCount.toString().padStart(2, "0")} INVITED
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  Click to focus team scopes
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Visual Architecture Geometry */}
        <div className="lg:col-span-7 bg-surface/80 rounded-lg p-3 sm:p-4 border border-border/60">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            ACCESS RELATIONSHIP SYNTAX
          </div>

          {/* High-contrast ASCII/Rail Architecture Display */}
          <div className="p-3 bg-surface rounded-md border border-border/70 font-mono text-xs text-muted-foreground overflow-x-auto">
            <div className="flex items-center justify-between gap-4 min-w-[340px]">
              <div className="space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">
                  IDENTITY
                </div>
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <span className="text-emerald-500">●</span>
                  <span>MEMBER</span>
                </div>
              </div>

              <div className="text-muted-foreground/60">──────●──────</div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">
                  AUTHORITY
                </div>
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <span className="text-primary">●</span>
                  <span>ROLE</span>
                </div>
              </div>

              <div className="text-muted-foreground/60">──────●──────</div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">
                  COLLABORATION
                </div>
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <span className="text-teal-500">●</span>
                  <span>TEAMS</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Primary Invariant: Direct relational mapping without synthetic cache</span>
              <span className="font-semibold text-foreground/80">
                PostgreSQL · Row Level Security
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
