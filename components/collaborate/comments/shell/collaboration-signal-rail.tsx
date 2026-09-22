"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CollaborationSignalMetrics {
  totalThreads: number;
  openCount: number;
  mentionsCount: number;
  myThreadsCount: number;
  resolvedCount: number;
}

interface CollaborationSignalRailProps {
  metrics: CollaborationSignalMetrics;
  activeFilter?: string;
  onFilterSelect?: (view: "all" | "open" | "mentions" | "my_threads" | "resolved") => void;
  className?: string;
}

export function CollaborationSignalRail({
  metrics,
  activeFilter,
  onFilterSelect,
  className,
}: CollaborationSignalRailProps) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const items = [
    {
      key: "all" as const,
      label: "THREADS",
      value: pad(metrics.totalThreads),
      textColor: "text-foreground",
      activeBorder: "border-[#FA520F]",
    },
    {
      key: "open" as const,
      label: "OPEN",
      value: pad(metrics.openCount),
      textColor: metrics.openCount > 0 ? "text-[#FFB83E]" : "text-foreground",
      activeBorder: "border-[#FFB83E]",
    },
    {
      key: "mentions" as const,
      label: "MENTIONS",
      value: pad(metrics.mentionsCount),
      textColor: metrics.mentionsCount > 0 ? "text-[#FA520F]" : "text-foreground",
      activeBorder: "border-[#FA520F]",
    },
    {
      key: "my_threads" as const,
      label: "MY THREADS",
      value: pad(metrics.myThreadsCount),
      textColor: "text-foreground",
      activeBorder: "border-foreground/60",
    },
    {
      key: "resolved" as const,
      label: "RESOLVED",
      value: pad(metrics.resolvedCount),
      textColor: metrics.resolvedCount > 0 ? "text-emerald-500 dark:text-emerald-400" : "text-muted-foreground",
      activeBorder: "border-emerald-500",
    },
  ];

  return (
    <div
      className={cn(
        "flex items-center overflow-x-auto no-scrollbar border-y border-border/80 bg-card/40 backdrop-blur-xs py-2 px-3 text-xs font-mono select-none",
        className
      )}
      role="region"
      aria-label="Collaboration Signal Rail"
    >
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-max">
        {items.map((item, index) => {
          const isSelected = activeFilter === item.key;
          const content = (
            <div
              className={cn(
                "flex items-center gap-2 px-2.5 py-1 rounded-md transition-all duration-150",
                onFilterSelect && "cursor-pointer hover:bg-muted/50",
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
            <React.Fragment key={item.key}>
              {index > 0 && (
                <span className="text-muted-foreground/40 font-mono select-none" aria-hidden="true">
                  ━
                </span>
              )}
              {onFilterSelect ? (
                <button
                  type="button"
                  onClick={() => onFilterSelect(item.key)}
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
