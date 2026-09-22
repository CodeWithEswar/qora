"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TeamSignalRailProps {
  totalTeams: number;
  activeTeams: number;
  archivedTeams: number;
  totalMemberships: number;
  totalMembersInTeams: number;
  unassignedMembers: number;
  totalConnectedWork: number;
  orgSlug?: string;
  className?: string;
}

/**
 * NXTQR Team Signal Rail
 * Factual connected collaboration summary rail reflecting real workspace counts.
 * Strictly avoids synthetic KPI cards and imaginary health scores.
 */
export function TeamSignalRail({
  totalTeams,
  activeTeams,
  archivedTeams,
  totalMemberships,
  totalMembersInTeams,
  unassignedMembers,
  totalConnectedWork,
  orgSlug,
  className,
}: TeamSignalRailProps) {
  const fTeams = totalTeams.toString().padStart(2, "0");
  const fMemberships = totalMemberships.toString().padStart(2, "0");
  const fWork = totalConnectedWork.toString().padStart(2, "0");
  const fUnassigned = unassignedMembers.toString().padStart(2, "0");

  return (
    <aside
      aria-label="Workspace Collaboration Signal Rail"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 px-4 rounded-xl border border-border/80 bg-surface/60 text-xs font-mono select-none shadow-2xs",
        className
      )}
    >
      {/* Node 1: Teams */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">
          TEAMS
        </span>
        <span className="font-bold text-foreground text-xs">{fTeams}</span>
        {archivedTeams > 0 && (
          <span className="text-[10px] text-muted-foreground">({archivedTeams} archived)</span>
        )}
      </div>

      <span className="text-border/80 select-none hidden sm:inline">├──</span>

      {/* Node 2: Memberships (slots across teams) */}
      <div className="flex items-center gap-2" title={`${totalMembersInTeams} unique members hold ${totalMemberships} total team memberships`}>
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">
          MEMBERSHIPS
        </span>
        <span className="font-bold text-teal-600 dark:text-teal-400 text-xs">{fMemberships}</span>
        <span className="text-[10px] text-muted-foreground hidden md:inline">
          ({totalMembersInTeams} unique)
        </span>
      </div>

      <span className="text-border/80 select-none hidden sm:inline">├──</span>

      {/* Node 3: Connected Work */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">
          CONNECTED WORK
        </span>
        <span className="font-bold text-primary text-xs">{fWork}</span>
      </div>

      <span className="text-border/80 select-none hidden sm:inline">└──</span>

      {/* Node 4: Unassigned Members */}
      {orgSlug ? (
        <Link
          href={`/${orgSlug}/members`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
          title="View unassigned members in Workspace Access Graph"
        >
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", unassignedMembers > 0 ? "bg-amber-500" : "bg-muted")} />
          <span className="text-[10px] tracking-wider text-muted-foreground group-hover:text-foreground uppercase font-semibold">
            UNASSIGNED
          </span>
          <span className={cn("font-bold text-xs", unassignedMembers > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
            {fUnassigned}
          </span>
        </Link>
      ) : (
        <div className="flex items-center gap-2">
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", unassignedMembers > 0 ? "bg-amber-500" : "bg-muted")} />
          <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">
            UNASSIGNED
          </span>
          <span className={cn("font-bold text-xs", unassignedMembers > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
            {fUnassigned}
          </span>
        </div>
      )}
    </aside>
  );
}
