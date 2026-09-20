"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface VelocityPoint {
  timeLabel: string;
  scans: number;
  intensity: number; // 0..1
}

interface ScanVelocityProps {
  velocity: VelocityPoint[];
  className?: string;
}

export function ScanVelocity({ velocity = [], className }: ScanVelocityProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const totalScans = velocity.reduce((acc, v) => acc + v.scans, 0);

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
                Scan Velocity
              </h4>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Pulse interval intensity across chronological signal sequence
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-primary tabular-nums">
            {totalScans.toLocaleString()} EVENTS
          </span>
        </div>

        {/* Pulse Bars Sequence */}
        <div className="mt-6 flex items-end justify-between gap-1 sm:gap-1.5 h-28 px-1 relative">
          {velocity.length === 0 ? (
            <div className="w-full flex items-center justify-center text-xs text-muted-foreground">
              No interval velocity recorded.
            </div>
          ) : (
            velocity.map((item, idx) => {
              const isHovered = hoveredIndex === idx;
              const heightPct = Math.max(8, item.intensity * 100);

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 flex flex-col items-center group relative cursor-pointer"
                >
                  {/* Floating tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 px-2.5 py-1 rounded bg-popover border border-border text-[10px] font-mono whitespace-nowrap shadow-xl text-popover-foreground">
                      <span className="text-muted-foreground">{item.timeLabel}: </span>
                      <span className="font-bold text-primary">{item.scans.toLocaleString()} scans</span>
                    </div>
                  )}

                  {/* Pulse bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={cn(
                      "w-full rounded-t-[2px] transition-all duration-150",
                      isHovered
                        ? "bg-primary shadow-[0_0_8px_rgba(250,82,15,0.8)] scale-y-105"
                        : item.intensity > 0.6
                        ? "bg-primary/90"
                        : item.intensity > 0.3
                        ? "bg-primary/60"
                        : "bg-muted hover:bg-primary/40"
                    )}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>▂ ▃ ▅ █ Interval Rhythm</span>
        <span>Linear Signal Density</span>
      </div>
    </div>
  );
}
