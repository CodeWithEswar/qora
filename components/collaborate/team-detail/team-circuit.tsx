"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TeamLensType } from "./team-lens";
import { TeamMark } from "@/components/collaborate/teams/team-mark";
import { Users, Link2, ShieldCheck, FileCheck2 } from "lucide-react";

interface TeamCircuitProps {
  teamName: string;
  teamId: string;
  memberCount: number;
  workCount: number;
  accessDomainsCount: number;
  pendingApprovalsCount: number;
  activeLens: TeamLensType;
  onNavigateTab?: (tab: string) => void;
  className?: string;
}

export function TeamCircuit({
  teamName,
  teamId,
  memberCount,
  workCount,
  accessDomainsCount,
  pendingApprovalsCount,
  activeLens,
  onNavigateTab,
  className,
}: TeamCircuitProps) {
  const isPeopleFoc = activeLens === "people" || activeLens === "all";
  const isWorkFoc = activeLens === "work" || activeLens === "all";
  const isAccessFoc = activeLens === "access" || activeLens === "all";
  const isGovFoc = activeLens === "governance" || activeLens === "all";

  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-surface/70 p-4 sm:p-5 font-mono text-xs shadow-xs relative overflow-hidden select-none",
        className
      )}
      role="region"
      aria-label={`Collaboration Circuit for ${teamName}`}
    >
      {/* Visual Ambient Glow behind center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-primary/5 blur-3xl pointer-events-none" />

      {/* Screen Reader Accessible Narrative */}
      <div className="sr-only">
        Team {teamName} has {memberCount} members, {workCount} connected work resources,{" "}
        {accessDomainsCount} access domains configured, and {pendingApprovalsCount} pending governance approvals.
      </div>

      {/* Desktop Circuit Topology (hidden on mobile, recomposed below) */}
      <div className="hidden md:flex flex-col items-center justify-center py-2 relative z-10">
        {/* LEVEL 1: Central Team Authority Node */}
        <div className="flex flex-col items-center">
          <div className="px-3.5 py-2 rounded-md bg-surface border-2 border-primary/40 flex items-center gap-3 shadow-xs">
            <TeamMark name={teamName} id={teamId} size={28} className="rounded-md shrink-0" />
            <div>
              <span className="text-[9px] uppercase tracking-widest text-primary font-bold block leading-none mb-0.5">
                OPERATIONAL TEAM
              </span>
              <span className="font-bold text-sm text-foreground font-sans tracking-tight">
                {teamName}
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" title="Operational Active" />
          </div>

          {/* Stem downwards */}
          <div className="w-px h-6 bg-gradient-to-b from-primary/60 to-border" aria-hidden="true" />
        </div>

        {/* Bus Rail across three operational lanes */}
        <div className="w-[84%] max-w-xl h-px bg-border relative" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-border -translate-y-1/2" />
        </div>

        {/* Vertical drops into 3 modules */}
        <div className="w-[84%] max-w-xl flex justify-between" aria-hidden="true">
          <div className={cn("w-px h-5 transition-colors", isPeopleFoc ? "bg-blue-500/80" : "bg-border/60")} />
          <div className={cn("w-px h-5 transition-colors", isWorkFoc ? "bg-amber-500/80" : "bg-border/60")} />
          <div className={cn("w-px h-5 transition-colors", isAccessFoc ? "bg-indigo-500/80" : "bg-border/60")} />
        </div>

        {/* LEVEL 2: Operational Trinity [PEOPLE ── WORK ── ACCESS] */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xl pt-0">
          {/* Node 1: People */}
          <button
            type="button"
            onClick={() => onNavigateTab?.("people")}
            className={cn(
              "p-3 rounded-md border text-center transition-all cursor-pointer group flex flex-col items-center",
              isPeopleFoc
                ? "bg-surface border-blue-500/50 shadow-xs ring-1 ring-blue-500/20"
                : "bg-surface/50 border-border/60 opacity-50 hover:opacity-100"
            )}
          >
            <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              PEOPLE
            </span>
            <span className="text-base font-bold text-foreground font-mono mt-0.5">
              {memberCount}
            </span>
            <span className="text-[9px] text-muted-foreground mt-0.5">
              {memberCount === 1 ? "Member assigned" : "Members assigned"}
            </span>
          </button>

          {/* Node 2: Connected Work */}
          <button
            type="button"
            onClick={() => onNavigateTab?.("work")}
            className={cn(
              "p-3 rounded-md border text-center transition-all cursor-pointer group flex flex-col items-center",
              isWorkFoc
                ? "bg-surface border-amber-500/50 shadow-xs ring-1 ring-amber-500/20"
                : "bg-surface/50 border-border/60 opacity-50 hover:opacity-100"
            )}
          >
            <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Link2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              CONNECTED WORK
            </span>
            <span className="text-base font-bold text-foreground font-mono mt-0.5">
              {workCount}
            </span>
            <span className="text-[9px] text-muted-foreground mt-0.5">
              {workCount === 0 ? "Ready for work" : `${workCount} resources`}
            </span>
          </button>

          {/* Node 3: Access */}
          <button
            type="button"
            onClick={() => onNavigateTab?.("access")}
            className={cn(
              "p-3 rounded-md border text-center transition-all cursor-pointer group flex flex-col items-center",
              isAccessFoc
                ? "bg-surface border-indigo-500/50 shadow-xs ring-1 ring-indigo-500/20"
                : "bg-surface/50 border-border/60 opacity-50 hover:opacity-100"
            )}
          >
            <div className="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              ACCESS
            </span>
            <span className="text-base font-bold text-foreground font-mono mt-0.5">
              {accessDomainsCount > 0 ? `${accessDomainsCount} Dom` : "Role"}
            </span>
            <span className="text-[9px] text-muted-foreground mt-0.5">
              Policy derived
            </span>
          </button>
        </div>

        {/* Lower Convergence Rail to Governance */}
        <div className="w-[84%] max-w-xl flex justify-between" aria-hidden="true">
          <div className="w-px h-4 bg-border/60" />
          <div className="w-px h-4 bg-border/60" />
          <div className="w-px h-4 bg-border/60" />
        </div>
        <div className="w-[84%] max-w-xl h-px bg-border relative" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-border -translate-y-1/2" />
        </div>
        <div className="w-px h-5 bg-gradient-to-b from-border to-emerald-500/60" aria-hidden="true" />

        {/* LEVEL 3: Governance Anchor */}
        <button
          type="button"
          onClick={() => onNavigateTab?.("approvals")}
          className={cn(
            "px-4 py-2 rounded-md border transition-all cursor-pointer group flex items-center gap-3",
            isGovFoc
              ? "bg-surface border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/20"
              : "bg-surface/50 border-border/60 opacity-50 hover:opacity-100"
          )}
        >
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileCheck2 className="w-3 h-3" />
          </div>
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">
              GOVERNANCE
            </span>
            <span className="text-xs font-bold text-foreground font-mono">
              {pendingApprovalsCount === 0 ? "Idle" : `${pendingApprovalsCount} Action Required`}
            </span>
          </div>
        </button>
      </div>

      {/* Mobile Recomposed Circuit Stack */}
      <div className="md:hidden space-y-2.5 pt-1">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
          <TeamMark name={teamName} id={teamId} size={28} className="rounded-md shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[9px] uppercase tracking-widest text-primary font-bold block">
              OPERATIONAL TEAM
            </span>
            <span className="text-xs font-bold text-foreground truncate block font-sans">
              {teamName}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab?.("people")}
            className="p-2.5 rounded-lg border border-border bg-surface text-left cursor-pointer hover:border-blue-500/50 transition-colors"
          >
            <span className="text-[9px] text-muted-foreground uppercase block font-bold">PEOPLE</span>
            <span className="text-sm font-bold text-foreground font-mono">{memberCount}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab?.("work")}
            className="p-2.5 rounded-lg border border-border bg-surface text-left cursor-pointer hover:border-amber-500/50 transition-colors"
          >
            <span className="text-[9px] text-muted-foreground uppercase block font-bold">CONNECTED WORK</span>
            <span className="text-sm font-bold text-foreground font-mono">{workCount}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab?.("access")}
            className="p-2.5 rounded-lg border border-border bg-surface text-left cursor-pointer hover:border-indigo-500/50 transition-colors"
          >
            <span className="text-[9px] text-muted-foreground uppercase block font-bold">ACCESS PATH</span>
            <span className="text-sm font-bold text-foreground font-mono">
              {accessDomainsCount > 0 ? `${accessDomainsCount} Domains` : "Role Based"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab?.("approvals")}
            className="p-2.5 rounded-lg border border-border bg-surface text-left cursor-pointer hover:border-emerald-500/50 transition-colors"
          >
            <span className="text-[9px] text-muted-foreground uppercase block font-bold">GOVERNANCE</span>
            <span className="text-sm font-bold text-foreground font-mono">
              {pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Action` : "Idle"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
