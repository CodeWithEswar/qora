"use client";

import * as React from "react";
import { X } from "lucide-react";

interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface AnalyticsFilterBarProps {
  chips: FilterChip[];
  onRemoveChip: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function AnalyticsFilterBar({
  chips = [],
  onRemoveChip,
  onClearAll,
  className = "",
}: AnalyticsFilterBarProps) {
  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-1 pb-2 ${className}`}>
      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mr-1">
        Active Filters:
      </span>

      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-xs font-mono text-foreground shadow-xs"
        >
          <span className="text-muted-foreground">{chip.label}:</span>
          <span className="font-semibold text-primary">{chip.value}</span>
          <button
            type="button"
            onClick={() => onRemoveChip(chip.key)}
            className="hover:text-rose-500 ml-0.5 text-muted-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="text-[11px] font-mono text-muted-foreground hover:text-rose-500 hover:underline transition-colors ml-2"
      >
        Clear all
      </button>
    </div>
  );
}
