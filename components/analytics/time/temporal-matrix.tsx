"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TemporalMatrixCell {
  dayOfWeek: number; // 0=Sun, 1=Mon... 6=Sat
  dayName: string;
  hourOfDay: number; // 0..23
  scans: number;
}

interface TemporalMatrixProps {
  cells?: TemporalMatrixCell[];
  timezone?: string;
  className?: string;
}

const DAYS_ORDER = [
  { day: 1, label: "Mon" },
  { day: 2, label: "Tue" },
  { day: 3, label: "Wed" },
  { day: 4, label: "Thu" },
  { day: 5, label: "Fri" },
  { day: 6, label: "Sat" },
  { day: 0, label: "Sun" },
];

export function TemporalMatrix({ cells = [], timezone = "UTC", className }: TemporalMatrixProps) {
  const [hoveredCell, setHoveredCell] = React.useState<TemporalMatrixCell | null>(null);

  const maxScans = Math.max(...cells.map((c) => c.scans), 1);

  // Group cells into day-hour lookup
  const cellMap = React.useMemo(() => {
    const map = new Map<string, number>();
    cells.forEach((c) => map.set(`${c.dayOfWeek}-${c.hourOfDay}`, c.scans));
    return map;
  }, [cells]);

  const getCellColor = (scans: number) => {
    if (scans === 0) return "bg-muted/40 border-border/50";
    const ratio = scans / maxScans;
    if (ratio > 0.8) return "bg-[#FA520F] border-[#FA520F] shadow-[0_0_6px_rgba(250,82,15,0.7)] text-white";
    if (ratio > 0.5) return "bg-[#FF8105] border-[#FF8105] opacity-90 text-white";
    if (ratio > 0.25) return "bg-[#FFA110] border-[#FFA110] opacity-75 text-white";
    return "bg-[#FA520F]/40 border-[#FA520F]/50 text-white";
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between text-card-foreground",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-serif text-base font-normal tracking-tight text-foreground">
                Temporal Matrix
              </h4>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Day-of-week × Hour-of-day scanning density in {timezone}
            </p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
            7 × 24 HEATMAP
          </span>
        </div>

        {/* Matrix Grid Container */}
        <div className="mt-5 overflow-x-auto pb-2">
          <div className="min-w-[560px]">
            {/* Hour Header Numbers: 00 to 23 */}
            <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-1 mb-2 font-mono text-[9px] text-muted-foreground/70">
              <div />
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="text-center">
                  {h % 3 === 0 ? `${h < 10 ? `0${h}` : h}` : ""}
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            <div className="space-y-1.5">
              {DAYS_ORDER.map(({ day, label }) => (
                <div key={day} className="grid grid-cols-[40px_repeat(24,1fr)] gap-1 items-center">
                  <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const scans = cellMap.get(`${day}-${hour}`) || 0;
                    const cellObj: TemporalMatrixCell = {
                      dayOfWeek: day,
                      dayName: label,
                      hourOfDay: hour,
                      scans,
                    };

                    return (
                      <div
                        key={hour}
                        onMouseEnter={() => setHoveredCell(cellObj)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={cn(
                          "h-5 rounded-[3px] border transition-all duration-150 cursor-pointer relative",
                          getCellColor(scans)
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Info & Scale Footer */}
      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between text-[11px] font-mono text-muted-foreground">
        {hoveredCell ? (
          <span className="text-foreground">
            <strong className="text-primary">{hoveredCell.dayName}</strong> ·{" "}
            {hoveredCell.hourOfDay < 10 ? `0${hoveredCell.hourOfDay}` : hoveredCell.hourOfDay}:00–
            {(hoveredCell.hourOfDay + 1) % 24 < 10 ? `0${(hoveredCell.hourOfDay + 1) % 24}` : (hoveredCell.hourOfDay + 1) % 24}:00:{" "}
            <strong className="text-foreground">{hoveredCell.scans.toLocaleString()} scans</strong>
          </span>
        ) : (
          <span>Hover cell to inspect hourly volume</span>
        )}

        <div className="flex items-center gap-1.5 text-[10px]">
          <span>0</span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-muted/40 border border-border/50" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#FA520F]/40" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#FFA110]" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#FA520F]" />
          <span>Max</span>
        </div>
      </div>
    </div>
  );
}
