"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TeamOverlapItem } from "@/lib/supabase/types/teams";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface TeamOverlapRailProps {
  overlaps: TeamOverlapItem[];
  className?: string;
}

/**
 * NXTQR Team Overlap Rail
 * Displays factual shared cross-functional memberships between teams.
 * Overlaps are legitimate collaboration bridges, NOT errors or duplicate alerts.
 */
export function TeamOverlapRail({ overlaps, className }: TeamOverlapRailProps) {
  if (!overlaps || overlaps.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Cross-Team Collaboration Bridges"
      className={cn(
        "rounded-xl border border-border/80 bg-surface/60 p-3 sm:p-4 text-xs font-mono space-y-2.5 shadow-2xs",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-teal-500" />
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-semibold">
            CROSS-TEAM COLLABORATION BRIDGES
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {overlaps.length} {overlaps.length === 1 ? "SHARED LINK" : "SHARED LINKS"}
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {overlaps.map((item, idx) => (
          <Popover key={`${item.teamAId}-${item.teamBId}-${idx}`}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/70 bg-surface hover:bg-surface/90 transition-colors shrink-0 cursor-pointer text-[11px]"
              >
                <span className="font-bold text-foreground">{item.teamAName}</span>
                <span className="text-muted-foreground text-[10px]">────</span>
                <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/20 text-[10px]">
                  {item.sharedMemberCount} {item.sharedMemberCount === 1 ? "member" : "members"}
                </span>
                <span className="text-muted-foreground text-[10px]">────</span>
                <span className="font-bold text-foreground">{item.teamBName}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-64 p-3 text-xs font-mono space-y-2">
              <div className="space-y-0.5 pb-2 border-b border-border/60">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">
                  SHARED MEMBERS
                </div>
                <div className="text-xs text-foreground font-semibold">
                  {item.teamAName} & {item.teamBName}
                </div>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {item.sharedMembers.map((m) => {
                  const initials = m.displayName
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "MB";

                  return (
                    <div key={m.membershipId} className="flex items-center gap-2 py-1">
                      <Avatar className="h-6 w-6 border border-border">
                        {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.displayName} />}
                        <AvatarFallback className="bg-muted text-[10px] font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-foreground text-xs font-sans font-medium truncate">
                          {m.displayName}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">{m.roleName}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </div>
  );
}
