"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActiveFilters {
  status?: string;
  qrType?: string;
  campaignId?: string;
  campaignName?: string;
  ownerId?: string;
  ownerName?: string;
  search?: string;
}

export interface QrActiveFiltersProps {
  filters: ActiveFilters;
  onRemoveFilter: (key: keyof ActiveFilters) => void;
  onClearAll: () => void;
  className?: string;
}

export function QrActiveFilters({
  filters,
  onRemoveFilter,
  onClearAll,
  className,
}: QrActiveFiltersProps) {
  const chips: { key: keyof ActiveFilters; label: string; value: string }[] = [];

  if (filters.status && filters.status !== "ALL") {
    chips.push({ key: "status", label: "Status", value: filters.status });
  }

  if (filters.qrType && filters.qrType !== "ALL") {
    chips.push({ key: "qrType", label: "Type", value: filters.qrType.toUpperCase() });
  }

  if (filters.campaignId) {
    chips.push({
      key: "campaignId",
      label: "Campaign",
      value: filters.campaignName || "Selected",
    });
  }

  if (filters.ownerId) {
    chips.push({
      key: "ownerId",
      label: "Owner",
      value: filters.ownerName || "Selected",
    });
  }

  if (filters.search && filters.search.trim()) {
    chips.push({
      key: "search",
      label: "Query",
      value: `"${filters.search.trim()}"`,
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 py-1 text-xs", className)}>
      <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider mr-1">
        Active filters:
      </span>

      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-foreground border border-border/80 transition-colors"
        >
          <span className="text-muted-foreground">{chip.label}:</span>
          <span className="font-medium text-foreground">{chip.value}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(chip.key)}
            className="text-muted-foreground hover:text-foreground transition-colors ml-0.5"
            title={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-primary hover:text-[#cc3a05] font-medium transition-colors ml-1"
      >
        Clear all
      </button>
    </div>
  );
}
