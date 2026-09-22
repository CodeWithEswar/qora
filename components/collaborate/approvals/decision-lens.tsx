"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DecisionLensProps {
  requestTitle: string;
  requesterName: string;
  changesSummary: string;
  affectedSummary: string;
  nextSteps: string;
  className?: string;
}

export function DecisionLens({
  requestTitle,
  requesterName,
  changesSummary,
  affectedSummary,
  nextSteps,
  className,
}: DecisionLensProps) {
  return (
    <div className={cn("rounded-lg border border-border/70 bg-card p-3.5 space-y-2.5 text-xs font-mono", className)}>
      <div className="text-[10px] uppercase tracking-widest text-primary font-semibold flex items-center justify-between">
        <span>DECISION LENS</span>
        <span className="text-[9px] text-muted-foreground">INFORMED REVIEW SUMMARY</span>
      </div>

      <div className="space-y-1.5 divide-y divide-border/40">
        <div className="pt-1 flex items-start justify-between gap-2">
          <span className="text-[10px] text-muted-foreground uppercase shrink-0">OPERATION</span>
          <span className="text-xs font-semibold text-foreground text-right">{requestTitle}</span>
        </div>

        <div className="pt-1.5 flex items-start justify-between gap-2">
          <span className="text-[10px] text-muted-foreground uppercase shrink-0">REQUESTED BY</span>
          <span className="text-xs text-foreground font-medium text-right">{requesterName}</span>
        </div>

        <div className="pt-1.5 flex items-start justify-between gap-2">
          <span className="text-[10px] text-muted-foreground uppercase shrink-0">WHAT CHANGES</span>
          <span className="text-xs text-foreground text-right max-w-xs">{changesSummary}</span>
        </div>

        <div className="pt-1.5 flex items-start justify-between gap-2">
          <span className="text-[10px] text-muted-foreground uppercase shrink-0">WHAT IS AFFECTED</span>
          <span className="text-xs text-foreground text-right">{affectedSummary}</span>
        </div>

        <div className="pt-1.5 flex items-start justify-between gap-2">
          <span className="text-[10px] text-muted-foreground uppercase shrink-0">WHAT HAPPENS NEXT</span>
          <span className="text-xs text-muted-foreground text-right max-w-xs">{nextSteps}</span>
        </div>
      </div>
    </div>
  );
}
