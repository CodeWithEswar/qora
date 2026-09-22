"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AccessSignalRailProps {
  totalMembers: number;
  activeMembers: number;
  invitedMembers: number;
  suspendedMembers: number;
  totalTeams?: number;
  className?: string;
}

export function AccessSignalRail({
  totalMembers,
  activeMembers,
  invitedMembers,
  suspendedMembers,
  totalTeams,
  className,
}: AccessSignalRailProps) {
  const items = [
    { label: "MEMBERS", value: totalMembers, highlight: false },
    { label: "ACTIVE", value: activeMembers, highlight: true, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "INVITED", value: invitedMembers, highlight: false, color: "text-amber-600 dark:text-amber-400" },
    { label: "SUSPENDED", value: suspendedMembers, highlight: false, color: suspendedMembers > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground" },
    ...(totalTeams !== undefined ? [{ label: "TEAMS", value: totalTeams, highlight: false, color: "text-primary" }] : []),
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center py-2.5 px-4 rounded-xl border border-border/70 bg-surface/60 backdrop-blur-xs divide-x divide-border/60 shadow-xs",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.label}
          className={cn(
            "flex items-baseline gap-2.5 px-3 md:px-5 py-0.5",
            idx === 0 && "pl-1 md:pl-2"
          )}
        >
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
            {item.label}
          </span>
          <span
            className={cn(
              "text-sm font-semibold tracking-tight",
              item.color || "text-foreground"
            )}
          >
            {item.value.toString().padStart(2, "0")}
          </span>
        </div>
      ))}
    </div>
  );
}
