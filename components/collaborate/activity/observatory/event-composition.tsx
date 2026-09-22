"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { EventCompositionItem } from "@/lib/supabase/types/activity";

interface EventCompositionProps {
  items: EventCompositionItem[];
  onSelectCategory?: (category: string) => void;
  className?: string;
}

export function EventComposition({
  items,
  onSelectCategory,
  className,
}: EventCompositionProps) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md font-mono text-xs select-none",
        className
      )}
      role="region"
      aria-label="Event Composition"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#FA520F] font-bold">
            06 / EVENT COMPOSITION
          </span>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-xs text-muted-foreground font-sans">
            Breakdown across action classifications
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          Segmented Proportions
        </span>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-xs font-mono">
          No events available for composition in this period.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Stacked Proportional Bar */}
          <div className="h-3 w-full rounded-md overflow-hidden flex bg-muted/40 p-0.5 gap-0.5">
            {items.map((it) => (
              <div
                key={it.category}
                style={{
                  width: `${it.percentage}%`,
                  backgroundColor: it.color,
                }}
                className="h-full rounded-2xs transition-all duration-200"
                title={`${it.label}: ${it.count} (${it.percentage}%)`}
              />
            ))}
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {items.map((it) => (
              <div
                key={it.category}
                onClick={() => onSelectCategory?.(it.category)}
                className={cn(
                  "p-2 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between text-[11px] transition-colors",
                  onSelectCategory && "cursor-pointer hover:bg-muted/40"
                )}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: it.color }}
                  />
                  <span className="font-semibold text-foreground uppercase truncate">
                    {it.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <span className="font-bold text-foreground">{pad(it.count)}</span>
                  <span className="text-muted-foreground">({it.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
