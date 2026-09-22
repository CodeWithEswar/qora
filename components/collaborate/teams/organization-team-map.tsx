"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TeamSummary } from "@/lib/supabase/types/teams";

interface OrganizationTeamMapProps {
  organizationName: string;
  teams: TeamSummary[];
  onSelectTeam: (team: TeamSummary) => void;
  className?: string;
}

/**
 * NXTQR Organization Team Map
 * A compact, restrained operational tree representing how organization authority
 * and operational workflows are distributed across teams.
 */
export function OrganizationTeamMap({
  organizationName,
  teams,
  onSelectTeam,
  className,
}: OrganizationTeamMapProps) {
  const activeTeams = teams.filter((t) => t.state === "active");

  return (
    <section
      aria-label="Organization Team Map"
      className={cn(
        "rounded-xl border border-border/80 bg-surface/60 p-4 sm:p-5 select-none transition-all shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            ORGANIZATION / TEAM MAP
          </span>
          <span className="text-border/80 hidden sm:inline">|</span>
          <span className="text-[11px] text-muted-foreground/80 hidden sm:inline">
            COLLABORATION CONSTELLATION
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {activeTeams.length} OPERATIONAL {activeTeams.length === 1 ? "LANE" : "LANES"}
        </span>
      </div>

      {activeTeams.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground font-mono text-xs">
          No active teams configured yet. Create a team to establish operational collaboration boundaries.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Root Organization Node */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 border border-primary/25 text-primary text-[10px] font-mono font-bold">
              ●
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground uppercase">
              {organizationName}
            </span>
          </div>

          {/* Desktop Branching Cluster */}
          <div className="hidden md:block pt-1">
            <div className="relative pl-6 ml-2.5 border-l-2 border-border/70 space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {activeTeams.slice(0, 8).map((team, idx) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => onSelectTeam(team)}
                    className="group relative flex flex-col p-3 rounded-lg border border-border/70 bg-surface hover:bg-surface-hover/80 hover:border-primary/40 transition-all text-left cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {team.publicId}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 group-hover:scale-125 transition-transform" />
                    </div>

                    <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                      {team.name}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mt-2 pt-2 border-t border-border/50">
                      <span>{team.memberCount.toString().padStart(2, "0")} MEMBERS</span>
                      <span className="text-primary text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                        INSPECT →
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {activeTeams.length > 8 && (
                <div className="text-[11px] font-mono text-muted-foreground pl-1">
                  + {activeTeams.length - 8} more teams in registry below
                </div>
              )}
            </div>
          </div>

          {/* Mobile Vertical Tree */}
          <div className="md:hidden space-y-2 pl-3 ml-2 border-l-2 border-border/70">
            {activeTeams.map((team, idx) => (
              <button
                key={team.id}
                type="button"
                onClick={() => onSelectTeam(team)}
                className="group flex items-center justify-between w-full p-2 rounded-md hover:bg-surface-hover text-left transition-colors font-mono text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-border/90 text-xs select-none">
                    {idx === activeTeams.length - 1 ? "└──" : "├──"}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  <span className="font-semibold text-foreground truncate">{team.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {team.memberCount} MBRS →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
