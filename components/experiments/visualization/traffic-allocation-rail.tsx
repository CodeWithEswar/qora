"use client";

import * as React from "react";
import { ArrowUpRight, Split, ExternalLink, Trophy, Activity } from "lucide-react";
import { ExperimentVariantItem } from "../types";

interface TrafficAllocationRailProps {
  qrName: string;
  qrSlug: string;
  variants: ExperimentVariantItem[];
  totalObservations: number;
  status: string;
  compact?: boolean;
}

export function TrafficAllocationRail({
  qrName,
  qrSlug,
  variants,
  totalObservations,
  status,
  compact = false,
}: TrafficAllocationRailProps) {
  // Find leading variant if observations exist
  const leadingVariantId = React.useMemo(() => {
    if (totalObservations < 5 || variants.length < 2) return null;
    let maxRate = -1;
    let leaderId: string | null = null;
    for (const v of variants) {
      if (v.totalScans > 0) {
        const rate = v.conversions / v.totalScans;
        if (rate > maxRate) {
          maxRate = rate;
          leaderId = v.id;
        }
      }
    }
    return leaderId;
  }, [variants, totalObservations]);

  return (
    <div className="w-full bg-muted/40 dark:bg-[#0d0d10] border border-border dark:border-white/5 rounded-xl p-3 sm:p-4 space-y-3 font-sans">
      {/* Header Pipeline Label */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <Split className="h-3.5 w-3.5 text-primary" />
          <span>TRAFFIC SPLIT PIPELINE</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-muted-foreground">TOTAL SAMPLES:</span>
          <span className="font-bold text-foreground">{totalObservations.toLocaleString()}</span>
        </div>
      </div>

      {/* Visual Pipeline Rails */}
      <div className="space-y-2.5">
        {variants.map((v, idx) => {
          const isLeader = v.id === leadingVariantId;
          const scanRate =
            v.totalScans > 0 ? ((v.conversions / v.totalScans) * 100).toFixed(1) : "0.0";

          return (
            <div
              key={v.id || idx}
              className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-lg border transition-all ${
                isLeader
                  ? "bg-primary/5 border-primary/30 shadow-xs"
                  : "bg-card dark:bg-white/[0.02] border border-border dark:border-white/5 hover:border-border/80 dark:hover:border-white/10"
              }`}
            >
              {/* Variant Left: Name, Badge, Traffic Weight Bar */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Variant Monogram */}
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    idx === 0
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                      : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground truncate">{v.name}</span>
                    {idx === 0 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                        CONTROL
                      </span>
                    )}
                    {idx > 0 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                        CHALLENGER
                      </span>
                    )}
                    {isLeader && (
                      <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <Trophy className="h-2.5 w-2.5" />
                        LEADER
                      </span>
                    )}
                  </div>

                  {/* Destination URL */}
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                    <span className="font-mono text-muted-foreground text-[10px]">➔</span>
                    <a
                      href={v.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:text-foreground hover:underline inline-flex items-center gap-1"
                    >
                      {v.destinationUrl}
                      <ExternalLink className="h-2.5 w-2.5 text-muted-foreground inline shrink-0" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Variant Right: Traffic Weight Rail & Metrics */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/80 dark:border-white/5">
                {/* Allocation Progress Bar */}
                <div className="w-24 sm:w-28 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">SPLIT</span>
                    <span className="font-bold text-foreground">{v.trafficWeight}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? "bg-blue-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, v.trafficWeight))}%` }}
                    />
                  </div>
                </div>

                {/* Scans & Conversions */}
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground">SCANS</div>
                    <div className="font-mono font-semibold text-xs text-foreground">
                      {v.totalScans.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground">CONV. RATE</div>
                    <div className="font-mono font-bold text-xs text-primary">{scanRate}%</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
