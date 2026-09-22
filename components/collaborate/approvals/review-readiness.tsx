"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";

interface ReviewReadinessProps {
  hasContext: boolean;
  hasEvidence: boolean;
  isObjectCurrent: boolean;
  isAuthorized: boolean;
  isSelfRequester?: boolean;
  className?: string;
}

export function ReviewReadiness({
  hasContext,
  hasEvidence,
  isObjectCurrent,
  isAuthorized,
  isSelfRequester,
  className,
}: ReviewReadinessProps) {
  const items = [
    { label: "Request context & rationale available", passed: hasContext },
    { label: "Supporting evidence validated", passed: hasEvidence },
    { label: "Affected domain object state current", passed: isObjectCurrent },
    {
      label: isSelfRequester
        ? "Self-approval prohibited (Reviewer must be distinct from Requester)"
        : "Caller authorized to review this domain",
      passed: isAuthorized && !isSelfRequester,
      isWarning: isSelfRequester,
    },
  ];

  const allPassed = items.every((i) => i.passed);

  return (
    <div className={cn("space-y-2 p-3.5 rounded-lg border border-border/70 bg-card/40 text-xs font-mono", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full", allPassed ? "bg-emerald-500" : "bg-amber-500")} />
          REVIEW / READINESS
        </span>
        <span className={cn("text-[10px] font-semibold", allPassed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
          {allPassed ? "READY FOR DECISION" : "ATTENTION REQUIRED"}
        </span>
      </div>

      <ul className="space-y-1 pt-1">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {item.passed ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-500/20" />
            ) : item.isWarning ? (
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 ring-2 ring-amber-500/20" />
            ) : (
              <span className="w-2 h-2 rounded-full border border-border bg-background shrink-0" />
            )}
            <span
              className={cn(
                "text-[11px]",
                item.passed
                  ? "text-foreground"
                  : item.isWarning
                  ? "text-amber-700 dark:text-amber-400 font-medium"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
