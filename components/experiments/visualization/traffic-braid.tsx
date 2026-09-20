"use client";

import * as React from "react";
import { Activity, Clock } from "lucide-react";
import { ExperimentVariantItem } from "../types";

interface TrafficBraidProps {
  variants: ExperimentVariantItem[];
  totalObservations: number;
}

export function TrafficBraid({ variants, totalObservations }: TrafficBraidProps) {
  const [hoveredLane, setHoveredLane] = React.useState<{
    variantName: string;
    weight: number;
    scans: number;
  } | null>(null);

  if (totalObservations === 0) {
    return (
      <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-2 text-card-foreground shadow-xs">
        <Clock className="h-6 w-6 text-muted-foreground mx-auto" />
        <div className="text-xs font-semibold text-foreground">AWAITING TRAFFIC SIGNALS</div>
        <p className="text-[11px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
          The Traffic Braid visualizes live scan density across variant lanes. When real scans are routed, the signal braid will illuminate.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-4 font-sans shadow-xs text-card-foreground">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground uppercase font-mono text-[11px] tracking-wider">
            TRAFFIC BRAID — SIGNAL DENSITY
          </span>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">
          TIME FLOWS ➔ RECENT TRAFFIC
        </div>
      </div>

      {/* Visual Braid Canvas */}
      <div className="space-y-3 py-2">
        {variants.map((v, idx) => {
          const pct = totalObservations > 0 ? (v.totalScans / totalObservations) * 100 : 0;
          const color = idx === 0 ? "from-blue-500 to-blue-400" : "from-purple-500 to-purple-400";

          return (
            <div
              key={v.id || idx}
              onMouseEnter={() =>
                setHoveredLane({
                  variantName: v.name,
                  weight: v.trafficWeight,
                  scans: v.totalScans,
                })
              }
              onMouseLeave={() => setHoveredLane(null)}
              className="relative p-3 rounded-xl bg-muted/40 dark:bg-[#141418] border border-border dark:border-white/5 hover:border-primary/40 dark:hover:border-white/20 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                      idx === 0
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-foreground font-semibold">{v.name}</span>
                </div>
                <span className="text-muted-foreground">
                  {v.totalScans.toLocaleString()} scans ({pct.toFixed(1)}%)
                </span>
              </div>

              {/* Braid Signal Streamline */}
              <div className="h-2.5 w-full bg-muted dark:bg-black/40 rounded-full overflow-hidden p-0.5 border border-border/80 dark:border-white/5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                  style={{ width: `${Math.max(2, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip / Active Feedback */}
      {hoveredLane ? (
        <div className="p-2.5 rounded-lg bg-muted border border-border text-xs font-mono flex items-center justify-between text-foreground">
          <span>Active Lane: {hoveredLane.variantName}</span>
          <span className="text-primary font-bold">
            Target: {hoveredLane.weight}% · Recorded: {hoveredLane.scans}
          </span>
        </div>
      ) : (
        <div className="text-[10px] font-mono text-muted-foreground text-right">
          Hover a signal lane to inspect exact scan volumes.
        </div>
      )}
    </div>
  );
}
