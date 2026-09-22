"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ActivityDensityCell } from "@/lib/supabase/types/activity";

interface ActivityDensityMatrixProps {
  cells: ActivityDensityCell[];
  className?: string;
}

export function ActivityDensityMatrix({
  cells,
  className,
}: ActivityDensityMatrixProps) {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const bucketLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

  const maxCount = React.useMemo(() => {
    return Math.max(1, ...cells.map((c) => c.count));
  }, [cells]);

  const getCellIntensity = (count: number) => {
    if (count === 0) return "bg-muted/30 text-muted-foreground/40 border-border/40";
    const ratio = count / maxCount;
    if (ratio < 0.25) return "bg-[#FA520F]/20 text-[#FA520F] border-[#FA520F]/30";
    if (ratio < 0.5) return "bg-[#FA520F]/40 text-foreground border-[#FA520F]/50 font-bold";
    if (ratio < 0.75) return "bg-[#FA520F]/70 text-white border-[#FA520F]/80 font-bold";
    return "bg-[#FA520F] text-white border-[#FA520F] font-black shadow-xs";
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md font-mono text-xs select-none",
        className
      )}
      role="region"
      aria-label="Activity Density Matrix"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#FA520F] font-bold">
            02 / DENSITY MATRIX
          </span>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-xs text-muted-foreground font-sans">
            Day of week × 4-hour temporal distribution
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          Peak: <strong className="text-foreground">{maxCount}</strong> events
        </span>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[340px] space-y-1.5">
          {/* Hour Buckets Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-muted-foreground/80 font-semibold mb-1">
            <span className="text-left pl-1">DAY</span>
            {bucketLabels.map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>

          {/* Days Rows */}
          {dayLabels.map((dayName, dayIdx) => {
            return (
              <div key={dayName} className="grid grid-cols-7 gap-1.5 items-center">
                <span className="text-[10px] font-bold text-muted-foreground pl-1">
                  {dayName}
                </span>
                {[0, 4, 8, 12, 16, 20].map((hour) => {
                  const cell = cells.find(
                    (c) => c.dayOfWeek === dayIdx && c.hourBucket === hour
                  );
                  const count = cell ? cell.count : 0;
                  return (
                    <div
                      key={hour}
                      className={cn(
                        "h-7 rounded-md border flex items-center justify-center text-[10px] transition-colors",
                        getCellIntensity(count)
                      )}
                      title={`${dayName} at ${hour}:00 — ${count} events`}
                    >
                      {count > 0 ? count : "—"}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
