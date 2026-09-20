"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface QrSummaryData {
  total: number;
  active: number;
  draft: number;
  paused: number;
  archived: number;
}

export interface QrSignalStripProps {
  summary: QrSummaryData;
  activeStatusFilter?: string;
  onSelectStatusFilter?: (status: string | undefined) => void;
  filteredCount?: number;
  isFiltered?: boolean;
  className?: string;
}

export function QrSignalStrip({
  summary,
  activeStatusFilter,
  onSelectStatusFilter,
  filteredCount,
  isFiltered = false,
  className,
}: QrSignalStripProps) {
  const metrics = [
    {
      key: "ALL",
      statusValue: undefined,
      label: "TOTAL QR",
      count: summary.total,
      indicatorWidth: "w-10",
      accent: "bg-foreground/80",
    },
    {
      key: "ACTIVE",
      statusValue: "ACTIVE",
      label: "ACTIVE",
      count: summary.active,
      indicatorWidth: "w-14",
      accent: "bg-emerald-600 dark:bg-emerald-500",
    },
    {
      key: "DRAFT",
      statusValue: "DRAFT",
      label: "DRAFT",
      count: summary.draft,
      indicatorWidth: "w-8",
      accent: "bg-neutral-500",
    },
    {
      key: "PAUSED",
      statusValue: "PAUSED",
      label: "PAUSED",
      count: summary.paused,
      indicatorWidth: "w-6",
      accent: "bg-amber-500",
    },
    {
      key: "ARCHIVED",
      statusValue: "ARCHIVED",
      label: "ARCHIVED",
      count: summary.archived,
      indicatorWidth: "w-4",
      accent: "bg-neutral-400",
    },
  ];

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/80 bg-white dark:bg-[#141414] shadow-xs overflow-hidden",
        className
      )}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border/60">
        {metrics.map((metric, idx) => {
          const isSelected =
            (metric.statusValue === undefined && !activeStatusFilter) ||
            (metric.statusValue && activeStatusFilter === metric.statusValue);

          return (
            <button
              key={metric.key}
              type="button"
              onClick={() => onSelectStatusFilter?.(metric.statusValue)}
              className={cn(
                "group relative flex flex-col justify-between p-3 sm:p-4 text-left transition-colors duration-150 outline-none",
                "hover:bg-neutral-50/80 dark:hover:bg-[#1a1a1a]/80",
                isSelected && "bg-primary/[0.03] dark:bg-primary/[0.04]",
                idx === 4 && "col-span-2 sm:col-span-1 md:col-span-1"
              )}
            >
              {/* Top Row: Label */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
                  {metric.label}
                </span>
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </div>

              {/* Middle Row: Count */}
              <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
                  {metric.count.toLocaleString()}
                </span>
              </div>

              {/* Bottom Row: Subtle QR Signal geometry rail */}
              <div className="mt-3 flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-[1px] transition-colors duration-150",
                    isSelected ? "bg-primary" : metric.accent
                  )}
                />
                <span
                  className={cn(
                    "h-[1px] rounded-full transition-all duration-200",
                    isSelected
                      ? "w-16 bg-primary"
                      : cn("bg-border group-hover:bg-foreground/30", metric.indicatorWidth)
                  )}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Filtered View Indicator if view is constrained */}
      {isFiltered && typeof filteredCount === "number" && (
        <div className="border-t border-border/60 bg-neutral-50/70 dark:bg-[#111111]/70 px-4 py-1.5 flex items-center justify-between text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-[1px] bg-primary animate-pulse" />
            <span>
              FILTERED VIEW &middot; {filteredCount.toLocaleString()} OF {summary.total.toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectStatusFilter?.(undefined)}
            className="text-primary hover:underline font-sans text-xs"
          >
            Reset filter
          </button>
        </div>
      )}
    </div>
  );
}
