"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TeamConstellationProps {
  teamName: string;
  publicId: string;
  memberCount: number;
  accessCount: number;
  activityCount: number;
  className?: string;
}

/**
 * NXTQR Team Constellation — Signature Interaction #1
 * Central operational node with radial tree rails linking to
 * Members, Access footprint, and Activity events.
 */
export function TeamConstellation({
  teamName,
  publicId,
  memberCount,
  accessCount,
  activityCount,
  className,
}: TeamConstellationProps) {
  const fMembers = memberCount.toString().padStart(2, "0");
  const fAccess = accessCount.toString().padStart(2, "0");
  const fActivity = activityCount.toString().padStart(2, "0");

  return (
    <div
      aria-label="Team Constellation Overview"
      className={cn(
        "rounded-xl border border-border/80 bg-surface/70 p-4 font-mono text-xs select-none shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/60">
        <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold">
          TEAM / CONSTELLATION
        </span>
        <span className="text-[10px] text-muted-foreground">{publicId}</span>
      </div>

      {/* Central Constellation Graphic */}
      <div className="flex flex-col items-center justify-center py-2">
        {/* Central Team Node */}
        <div className="flex flex-col items-center text-center space-y-1">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm shadow-xs">
            ●
          </div>
          <span className="font-bold text-xs text-foreground uppercase tracking-tight max-w-[200px] truncate">
            {teamName}
          </span>
          <span className="text-[9px] text-muted-foreground uppercase">CENTRAL OPERATIONAL NODE</span>
        </div>

        {/* Tree Connectors */}
        <div className="w-full max-w-[320px] my-3">
          {/* Vertical Stem */}
          <div className="w-px h-3 bg-border/80 mx-auto" />

          {/* Horizontal Distribution Rail */}
          <div className="w-full h-px bg-border/80" />

          {/* 3 Downward Drops */}
          <div className="flex justify-between w-full">
            <div className="w-px h-3 bg-border/80" />
            <div className="w-px h-3 bg-border/80" />
            <div className="w-px h-3 bg-border/80" />
          </div>
        </div>

        {/* 3 Radial Nodes: Members, Access, Activity */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[360px] text-center">
          {/* Node 1: Members */}
          <div className="p-2 rounded-lg border border-border/70 bg-surface/60 space-y-1">
            <span className="w-2 h-2 rounded-full bg-teal-500 mx-auto block" />
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">
              MEMBERS
            </div>
            <div className="font-bold text-xs text-foreground">{fMembers}</div>
          </div>

          {/* Node 2: Access */}
          <div className="p-2 rounded-lg border border-border/70 bg-surface/60 space-y-1">
            <span className="w-2 h-2 rounded-full bg-primary mx-auto block" />
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">
              DOMAINS
            </div>
            <div className="font-bold text-xs text-foreground">{fAccess}</div>
          </div>

          {/* Node 3: Activity */}
          <div className="p-2 rounded-lg border border-border/70 bg-surface/60 space-y-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mx-auto block" />
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">
              EVENTS
            </div>
            <div className="font-bold text-xs text-foreground">{fActivity}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
