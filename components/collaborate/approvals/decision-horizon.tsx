"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ApprovalHorizonMetrics } from "@/lib/supabase/types/approvals";

interface DecisionHorizonProps {
  metrics: ApprovalHorizonMetrics;
  onFilterNeedsReview?: () => void;
  className?: string;
}

export function DecisionHorizon({
  metrics,
  onFilterNeedsReview,
  className,
}: DecisionHorizonProps) {
  const formatCount = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <section
      aria-label="Decision Horizon review distribution"
      className={cn(
        "rounded-xl border border-border/70 bg-card/40 p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Section Header & Concept */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
            DECISION / HORIZON
          </div>
          <p className="text-xs text-muted-foreground max-w-sm">
            Current operational review distribution across teams and direct governance assignments.
          </p>
        </div>

        {/* Center/Right: Node Tree Visualization */}
        <div className="flex items-center justify-center sm:justify-end">
          <div className="flex flex-col items-center">
            {/* Top Apex Node: Needs Review */}
            <button
              type="button"
              onClick={onFilterNeedsReview}
              className="flex flex-col items-center group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-mono font-medium shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>NEEDS REVIEW</span>
                <span className="font-semibold text-foreground">/{formatCount(metrics.needsReviewCount)}</span>
              </div>
            </button>

            {/* Tree Branch Rails */}
            <div className="w-48 sm:w-64 flex flex-col items-center my-1 select-none pointer-events-none" aria-hidden="true">
              <div className="w-px h-2 bg-border/80" />
              <div className="w-full border-t border-border/80 relative">
                <div className="absolute left-0 -top-1 w-2 h-2 rounded-full border border-border/80 bg-background" />
                <div className="absolute right-0 -top-1 w-2 h-2 rounded-full border border-border/80 bg-background" />
              </div>
            </div>

            {/* Bottom Child Nodes: Team Scopes vs Direct */}
            <div className="w-48 sm:w-64 flex items-center justify-between text-[11px] font-mono">
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>TEAM SCOPES</span>
                </div>
                <span className="text-[10px] text-foreground font-semibold pl-2.5">
                  {metrics.teamAssignedCount} in {metrics.topCategory}
                </span>
              </div>

              <div className="flex flex-col items-end text-right">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>DIRECT</span>
                </div>
                <span className="text-[10px] text-foreground font-semibold pr-2.5">
                  {metrics.directAssignedCount} assigned
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Horizon Progress Axis */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>WAITING: {metrics.waitingCount}</span>
        </div>

        <div className="flex-1 mx-4 border-t border-dashed border-border/60" aria-hidden="true" />

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>DECIDED: {metrics.decidedCount}</span>
        </div>
      </div>
    </section>
  );
}
