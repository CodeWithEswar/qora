"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ActivitySignalMetrics } from "@/lib/supabase/types/activity";

interface OperationalSignalRailProps {
  metrics: ActivitySignalMetrics;
  activeFilter?: string;
  onFilterSelect?: (key: "all" | "publish" | "approval" | "changes") => void;
  className?: string;
}

export function OperationalSignalRail({
  metrics,
  activeFilter,
  onFilterSelect,
  className,
}: OperationalSignalRailProps) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const items = [
    {
      key: "all" as const,
      label: "EVENTS",
      value: pad(metrics.totalEvents),
      textColor: "text-foreground",
    },
    {
      key: "contributors" as const,
      label: "CONTRIBUTORS",
      value: pad(metrics.contributorsCount),
      textColor: "text-foreground",
    },
    {
      key: "resources" as const,
      label: "RESOURCES TOUCHED",
      value: pad(metrics.resourcesCount),
      textColor: "text-foreground",
    },
    {
      key: "changes" as const,
      label: "CHANGES",
      value: pad(metrics.changesCount),
      textColor: "text-[#3B82F6]",
    },
    {
      key: "publish" as const,
      label: "PUBLISH EVENTS",
      value: pad(metrics.publishesCount),
      textColor: metrics.publishesCount > 0 ? "text-[#FA520F]" : "text-foreground",
    },
    {
      key: "approval" as const,
      label: "APPROVAL DECISIONS",
      value: pad(metrics.approvalsCount),
      textColor: metrics.approvalsCount > 0 ? "text-[#FFB83E]" : "text-foreground",
    },
  ];

  return (
    <div
      className={cn(
        "flex items-center overflow-x-auto no-scrollbar border-y border-border/80 bg-card/40 backdrop-blur-xs py-2 px-3 text-xs font-mono select-none",
        className
      )}
      role="region"
      aria-label="Operational Signal Rail"
    >
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-max">
        {items.map((item, index) => {
          const isFilterable = item.key === "all" || item.key === "publish" || item.key === "approval" || item.key === "changes";
          const isSelected = activeFilter === item.key;

          const content = (
            <div
              className={cn(
                "flex items-center gap-2 px-2.5 py-1 rounded-md transition-all duration-150",
                isFilterable && onFilterSelect && "cursor-pointer hover:bg-muted/50",
                isSelected && "bg-muted/70 ring-1 ring-border/80 font-bold"
              )}
            >
              <span className="text-[10px] tracking-widest uppercase text-muted-foreground/80 font-semibold">
                {item.label}
              </span>
              <span className="text-muted-foreground/30 font-light">/</span>
              <span className={cn("text-xs font-mono font-semibold tracking-tight", item.textColor)}>
                {item.value}
              </span>
            </div>
          );

          return (
            <React.Fragment key={item.label}>
              {index > 0 && (
                <span className="text-muted-foreground/40 font-mono select-none" aria-hidden="true">
                  ━
                </span>
              )}
              {isFilterable && onFilterSelect ? (
                <button
                  type="button"
                  onClick={() => onFilterSelect(item.key as any)}
                  className="focus:outline-hidden focus-visible:ring-1 focus-visible:ring-ring rounded-md"
                  aria-pressed={isSelected}
                >
                  {content}
                </button>
              ) : (
                content
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
