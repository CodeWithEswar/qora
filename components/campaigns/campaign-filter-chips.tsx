"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { CampaignFilterState } from "./campaign-filter-sheet";

export interface CampaignFilterChipsProps {
  filters: CampaignFilterState;
  onRemoveFilter: (key: keyof CampaignFilterState) => void;
  onClearAll: () => void;
  className?: string;
}

export function CampaignFilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  className,
}: CampaignFilterChipsProps) {
  const chips: Array<{ key: keyof CampaignFilterState; label: string }> = [];

  if (filters.status && filters.status !== "all") {
    chips.push({
      key: "status",
      label: `Status: ${filters.status}`,
    });
  }

  if (filters.hasQrs && filters.hasQrs !== "all") {
    chips.push({
      key: "hasQrs",
      label: filters.hasQrs === "true" ? "Has QR codes" : "No QR codes",
    });
  }

  if (filters.hasScans && filters.hasScans !== "all") {
    chips.push({
      key: "hasScans",
      label: filters.hasScans === "true" ? "Has scan activity" : "No scan activity",
    });
  }

  if (filters.dateRange && filters.dateRange !== "all") {
    chips.push({
      key: "dateRange",
      label: `Created: ${filters.dateRange}`,
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 pt-1 ${className || ""}`}>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-surface-elevated border border-border text-foreground shadow-2xs"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(chip.key)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Remove filter: ${chip.label}`}
          >
            <Icon icon="hugeicons:cancel-01" className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="text-[11px] font-medium text-primary hover:underline ml-1"
      >
        Clear all
      </button>
    </div>
  );
}
