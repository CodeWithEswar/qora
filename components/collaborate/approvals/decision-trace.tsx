"use client";

import * as React from "react";
import { cn, formatDate } from "@/lib/utils";
import type { DecisionTraceEvent } from "@/lib/supabase/types/approvals";

interface DecisionTraceProps {
  events: DecisionTraceEvent[];
  className?: string;
}

export function DecisionTrace({ events, className }: DecisionTraceProps) {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase flex items-center justify-between">
        <span>DECISION / TRACE</span>
        <span className="text-[9px] text-muted-foreground">IMMUTABLE CHRONOLOGY</span>
      </div>

      <div className="relative pl-3 space-y-4 text-xs font-mono">
        {/* Continuous vertical connector rail */}
        <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border/80 select-none pointer-events-none" aria-hidden="true" />

        {events.map((evt, idx) => {
          const isLast = idx === events.length - 1;

          return (
            <div key={evt.id || idx} className="flex items-start gap-3 relative z-10">
              {/* Status node */}
              <div className="mt-0.5 shrink-0 bg-background p-0.5 rounded-full">
                {evt.isFailed ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/10 block" />
                ) : evt.isCompleted ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 block" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground bg-background block" />
                )}
              </div>

              {/* Content */}
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {evt.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDate(evt.timestamp)}
                  </span>
                </div>

                {evt.description && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {evt.description}
                  </p>
                )}

                <div className="text-[10px] text-primary/80 font-medium pt-0.5">
                  by {evt.actorName}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
