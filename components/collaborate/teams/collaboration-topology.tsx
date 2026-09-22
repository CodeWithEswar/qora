"use client";

import * as React from "react";
import { TeamMark } from "./team-mark";
import type { TeamSummary } from "@/lib/supabase/types/teams";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Users, QrCode, ArrowRight } from "lucide-react";

interface CollaborationTopologyProps {
  organizationName: string;
  teams: TeamSummary[];
  onSelectTeam: (team: TeamSummary, initialTab?: string) => void;
  className?: string;
}

/**
 * NXTQR Collaboration Topology
 * Architectural system diagram visualizing how teams connect people and NXTQR resources across the workspace.
 * Desktop: Structured orbital relationship lanes and resource clusters.
 * Mobile: Clean vertical hierarchy tree with expandable branches.
 */
export function CollaborationTopology({
  organizationName,
  teams,
  onSelectTeam,
  className,
}: CollaborationTopologyProps) {
  const [hoveredTeamId, setHoveredTeamId] = React.useState<string | null>(null);
  const [expandedMobileTeams, setExpandedMobileTeams] = React.useState<Record<string, boolean>>({});

  const toggleMobileTeam = (id: string) => {
    setExpandedMobileTeams((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeTeams = teams.filter((t) => t.state !== "archived");

  if (activeTeams.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Workspace Collaboration Topology"
      className={cn(
        "rounded-xl border border-border/80 bg-surface/70 p-4 sm:p-6 font-mono text-xs shadow-xs select-none",
        className
      )}
    >
      {/* Header telemetry */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold">
            COLLABORATION TOPOLOGY
          </span>
          <span className="text-border/80">|</span>
          <span className="text-[10px] text-muted-foreground">
            {activeTeams.length} {activeTeams.length === 1 ? "ACTIVE TEAM" : "ACTIVE TEAMS"}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          INTERACTIVE ARCHITECTURAL MAP
        </span>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP TOPOLOGY: Structured Orbital Lanes & Resource Clusters */}
      {/* ========================================================= */}
      <div className="hidden lg:flex flex-col items-center py-2 overflow-x-auto">
        {/* LEVEL 1: Central Workspace Root */}
        <div className="flex flex-col items-center">
          <div className="px-4 py-2 rounded-xl bg-surface border-2 border-border/90 flex items-center gap-2.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-sm bg-foreground/90 shrink-0" />
            <span className="font-bold text-xs uppercase tracking-wide text-foreground">
              {organizationName}
            </span>
            <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">
              WORKSPACE
            </span>
          </div>

          {/* Root Stem down */}
          <div className="w-px h-6 bg-border/90" />
        </div>

        {/* Bus Rail across all teams */}
        {activeTeams.length > 1 && (
          <div className="w-[90%] max-w-5xl h-px bg-border/80 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-border -translate-y-1/2" />
          </div>
        )}

        {/* LEVEL 2 & 3: Team Lanes Grid */}
        <div
          className="grid gap-6 pt-0 w-full max-w-6xl"
          style={{
            gridTemplateColumns: `repeat(${Math.min(activeTeams.length, 4)}, minmax(0, 1fr))`,
          }}
        >
          {activeTeams.map((team) => {
            const isHovered = hoveredTeamId === team.id;
            const isOtherHovered = hoveredTeamId !== null && hoveredTeamId !== team.id;
            const work = team.connectedWork || {
              qrCount: 0,
              campaignCount: 0,
              brandKitCount: 0,
              templateCount: 0,
              domainCount: 0,
              totalCount: 0,
            };

            return (
              <div
                key={team.id}
                onMouseEnter={() => setHoveredTeamId(team.id)}
                onMouseLeave={() => setHoveredTeamId(null)}
                className={cn(
                  "flex flex-col items-center transition-all duration-200",
                  isOtherHovered && "opacity-40"
                )}
              >
                {/* Vertical drop line from bus rail */}
                <div
                  className={cn(
                    "w-px h-6 transition-colors",
                    isHovered ? "bg-primary" : "bg-border/80"
                  )}
                />

                {/* Team Node Card */}
                <button
                  type="button"
                  onClick={() => onSelectTeam(team, "overview")}
                  className={cn(
                    "w-full max-w-[240px] p-3 rounded-xl border text-center transition-all cursor-pointer shadow-2xs group relative bg-surface",
                    isHovered
                      ? "border-primary ring-1 ring-primary/40 shadow-sm"
                      : "border-border/80 hover:border-border"
                  )}
                >
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <TeamMark name={team.name} id={team.id} size={24} />
                    <span className="font-bold text-xs text-foreground uppercase tracking-tight truncate">
                      {team.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {team.publicId}
                  </div>
                </button>

                {/* Connector down to Members & Work */}
                <div
                  className={cn(
                    "w-px h-5 transition-colors",
                    isHovered ? "bg-primary" : "bg-border/80"
                  )}
                />

                {/* Horizontal split to People & Resources */}
                <div className="w-32 h-px bg-border/80" />
                <div className="flex justify-between w-32">
                  <div className="w-px h-3 bg-border/80" />
                  <div className="w-px h-3 bg-border/80" />
                </div>

                {/* LEVEL 3: Sub-branches (People & Resources) */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-[260px]">
                  {/* People Branch */}
                  <button
                    type="button"
                    onClick={() => onSelectTeam(team, "members")}
                    className={cn(
                      "p-2 rounded-lg border text-center transition-colors cursor-pointer bg-surface/50 hover:bg-surface",
                      isHovered ? "border-teal-500/50" : "border-border/70"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 font-semibold mb-0.5">
                      <Users className="h-3 w-3" />
                      <span>PEOPLE</span>
                    </div>
                    <div className="font-bold text-xs text-foreground">
                      {team.memberCount}
                    </div>
                  </button>

                  {/* Connected Work Branch */}
                  <button
                    type="button"
                    onClick={() => onSelectTeam(team, "work")}
                    className={cn(
                      "p-2 rounded-lg border text-center transition-colors cursor-pointer bg-surface/50 hover:bg-surface",
                      isHovered ? "border-primary/50" : "border-border/70"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1 text-[10px] text-primary font-semibold mb-0.5">
                      <QrCode className="h-3 w-3" />
                      <span>WORK</span>
                    </div>
                    <div className="font-bold text-xs text-foreground">
                      {work.totalCount}
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE & TABLET TOPOLOGY: Vertical Recomposed Hierarchy */}
      {/* ========================================================= */}
      <div className="lg:hidden space-y-3">
        {/* Workspace Root Item */}
        <div className="p-3 rounded-lg border border-border bg-surface flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-foreground shrink-0" />
            <span className="font-bold text-xs text-foreground uppercase">
              {organizationName}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground uppercase">WORKSPACE ROOT</span>
        </div>

        {/* Vertical Team Branches */}
        <div className="space-y-2 pl-3 border-l-2 border-border/80 ml-3">
          {activeTeams.map((team) => {
            const isExpanded = Boolean(expandedMobileTeams[team.id]);
            const work = team.connectedWork || { totalCount: 0 };

            return (
              <div key={team.id} className="rounded-lg border border-border/70 bg-surface/50 overflow-hidden">
                <div
                  onClick={() => toggleMobileTeam(team.id)}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TeamMark name={team.name} id={team.id} size={28} />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-foreground uppercase truncate">
                        {team.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {team.memberCount} members · {work.totalCount} connected work
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Expanded mobile branch */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-border/60 bg-surface space-y-2 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onSelectTeam(team, "members")}
                        className="p-2 rounded border border-border/70 bg-surface/40 hover:bg-surface text-center cursor-pointer"
                      >
                        <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                          MEMBERS
                        </div>
                        <div className="font-bold text-xs text-foreground">{team.memberCount}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectTeam(team, "work")}
                        className="p-2 rounded border border-border/70 bg-surface/40 hover:bg-surface text-center cursor-pointer"
                      >
                        <div className="text-[10px] text-primary font-semibold">
                          CONNECTED WORK
                        </div>
                        <div className="font-bold text-xs text-foreground">{work.totalCount}</div>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectTeam(team, "overview")}
                      className="w-full h-7 rounded bg-primary text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <span>Open team inspector</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
