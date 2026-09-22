"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TeamLensType = "all" | "people" | "work" | "access" | "governance";

interface TeamLensProps {
  activeLens: TeamLensType;
  onChangeLens: (lens: TeamLensType) => void;
  className?: string;
}

const LENSES: Array<{ id: TeamLensType; label: string; accent: string }> = [
  { id: "all", label: "All Circuit", accent: "text-primary" },
  { id: "people", label: "People", accent: "text-blue-500" },
  { id: "work", label: "Work", accent: "text-amber-500" },
  { id: "access", label: "Access", accent: "text-indigo-500" },
  { id: "governance", label: "Governance", accent: "text-emerald-500" },
];

export function TeamLens({ activeLens, onChangeLens, className }: TeamLensProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-lg border border-border/80 bg-surface/80 text-xs font-mono select-none",
        className
      )}
      role="radiogroup"
      aria-label="Team Circuit Focus Lens"
    >
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 font-semibold hidden sm:inline">
        LENS:
      </span>
      {LENSES.map((lens) => {
        const isActive = activeLens === lens.id;
        return (
          <button
            key={lens.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChangeLens(lens.id)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer",
              isActive
                ? "bg-surface-elevated text-foreground border border-border shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-hover/50"
            )}
          >
            <span className={cn(isActive && lens.accent)}>{lens.label}</span>
          </button>
        );
      })}
    </div>
  );
}
