"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ApprovalSignalMetrics } from "@/lib/supabase/types/approvals";

interface ApprovalSignalRailProps {
  metrics: ApprovalSignalMetrics;
  className?: string;
  onFilterClick?: (view: "all_requests" | "my_queue" | "history") => void;
}

export function ApprovalSignalRail({ metrics, className, onFilterClick }: ApprovalSignalRailProps) {
  const formatCount = (n?: number) => {
    const val = typeof n === "number" ? n : 0;
    return val < 10 ? `0${val}` : `${val}`;
  };

  const total = metrics.totalRequests ?? (metrics.openCount + (metrics.decidedTodayCount || 0));
  const waiting = metrics.waitingCount ?? 0;
  const inReview = metrics.inReviewCount ?? 0;
  const decided = metrics.decidedCount ?? metrics.decidedTodayCount ?? 0;
  const myAction = metrics.myActionCount ?? metrics.myReviewCount ?? 0;

  return (
    <aside
      aria-label="Governance Decision Signal Rail"
      className={cn(
        "flex flex-wrap items-center gap-y-2 text-xs font-mono tracking-wider py-2.5 px-3 rounded-lg border border-border/70 bg-card/40 backdrop-blur-xs",
        className
      )}
    >
      {/* REQUESTS */}
      <div
        onClick={() => onFilterClick?.("all_requests")}
        className="flex items-center gap-2 cursor-pointer group hover:text-foreground transition-colors"
      >
        <span className="text-[10px] text-muted-foreground uppercase group-hover:text-foreground font-medium">
          REQUESTS
        </span>
        <span className="text-xs font-bold font-mono text-foreground">
          {formatCount(total)}
        </span>
      </div>

      <span className="text-border/70 mx-3 select-none text-[11px] hidden sm:inline" aria-hidden="true">
        ━━━
      </span>

      {/* WAITING */}
      <div
        onClick={() => onFilterClick?.("all_requests")}
        className="flex items-center gap-2 cursor-pointer group hover:text-amber-500 transition-colors"
      >
        <span className="text-[10px] text-muted-foreground uppercase group-hover:text-amber-500/80 font-medium">
          WAITING
        </span>
        <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
          {formatCount(waiting)}
        </span>
      </div>

      <span className="text-border/70 mx-3 select-none text-[11px] hidden sm:inline" aria-hidden="true">
        ━━━
      </span>

      {/* IN REVIEW */}
      <div
        onClick={() => onFilterClick?.("all_requests")}
        className="flex items-center gap-2 cursor-pointer group hover:text-sky-500 transition-colors"
      >
        <span className="text-[10px] text-muted-foreground uppercase group-hover:text-sky-500/80 font-medium">
          IN REVIEW
        </span>
        <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">
          {formatCount(inReview)}
        </span>
      </div>

      <span className="text-border/70 mx-3 select-none text-[11px] hidden sm:inline" aria-hidden="true">
        ━━━
      </span>

      {/* DECIDED */}
      <div
        onClick={() => onFilterClick?.("history")}
        className="flex items-center gap-2 cursor-pointer group hover:text-emerald-500 transition-colors"
      >
        <span className="text-[10px] text-muted-foreground uppercase group-hover:text-emerald-500/80 font-medium">
          DECIDED
        </span>
        <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
          {formatCount(decided)}
        </span>
      </div>

      <span className="text-border/70 mx-3 select-none text-[11px] hidden sm:inline" aria-hidden="true">
        ━━━
      </span>

      {/* MY ACTION */}
      <div
        onClick={() => onFilterClick?.("my_queue")}
        className="flex items-center gap-2 cursor-pointer group hover:text-primary transition-colors"
      >
        <span className="text-[10px] text-muted-foreground uppercase group-hover:text-primary/80 font-medium">
          MY ACTION
        </span>
        <span className="text-xs font-bold font-mono text-primary flex items-center gap-1">
          {myAction > 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />}
          {formatCount(myAction)}
        </span>
      </div>
    </aside>
  );
}
