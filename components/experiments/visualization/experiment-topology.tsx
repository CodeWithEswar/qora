"use client";

import * as React from "react";
import { QrCode, Split, ExternalLink, Trophy, Activity, ArrowDown, ArrowRight } from "lucide-react";
import { ExperimentVariantItem } from "../types";

interface ExperimentTopologyProps {
  qrName: string;
  qrSlug: string;
  variants: ExperimentVariantItem[];
  totalObservations: number;
  status: string;
  className?: string;
  interactive?: boolean;
}

export function ExperimentTopology({
  qrName,
  qrSlug,
  variants,
  totalObservations,
  status,
  className = "",
  interactive = false,
}: ExperimentTopologyProps) {
  // Find leading variant if there are enough samples (>= 10 observations)
  const leadingVariantId = React.useMemo(() => {
    if (totalObservations < 10 || variants.length < 2) return null;
    let maxRate = -1;
    let leaderId: string | null = null;
    for (const v of variants) {
      if (v.totalScans >= 5) {
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
    <div className={`w-full bg-muted/40 dark:bg-[#0d0d10] border border-border dark:border-white/8 rounded-2xl p-4 sm:p-5 font-sans overflow-hidden ${className}`}>
      {/* Topology Header Label */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-3 mb-3 border-b border-border/80 dark:border-white/5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <Split className="h-3.5 w-3.5 text-primary" />
          <span>ROUTING TOPOLOGY PIPELINE</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-muted-foreground">EDGE SAMPLING:</span>
          <span className="text-primary font-bold">{totalObservations.toLocaleString()} SCANS</span>
        </div>
      </div>

      {/* Responsive Topology: Desktop Branching vs Mobile Linear */}
      <div className="hidden md:flex flex-col items-center gap-3 py-2">
        {/* Level 1: Dynamic QR Source Node */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-card dark:bg-[#16161a] border border-border dark:border-white/10 shadow-xs">
          <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <QrCode className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono uppercase text-muted-foreground leading-none">TRAFFIC SOURCE</div>
            <div className="text-xs font-semibold text-foreground truncate max-w-[200px]">{qrName}</div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted dark:bg-white/5 text-muted-foreground border border-border/80 dark:border-white/5 ml-1">
            /{qrSlug}
          </span>
        </div>

        {/* Stem down to split hub */}
        <div className="w-px h-4 bg-gradient-to-b from-border to-primary/40 dark:from-white/20" />

        {/* Level 2: Core Experiment Split Hub */}
        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] font-bold tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,82,15,0.15)]">
          <Split className="h-3 w-3" />
          <span>DETERMINISTIC TRAFFIC SPLIT</span>
        </div>

        {/* Stem down to horizontal rail */}
        <div className="w-px h-4 bg-primary/40" />

        {/* Level 3: Branching Rail to Variants */}
        <div className="w-full relative">
          {/* Horizontal Branching Bar */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-border dark:bg-white/20" />
          <div className="absolute top-0 left-1/4 w-px h-3 bg-border dark:bg-white/20" />
          <div className="absolute top-0 right-1/4 w-px h-3 bg-border dark:bg-white/20" />

          {/* Variants Grid */}
          <div className="grid grid-cols-2 gap-4 pt-3">
            {variants.slice(0, 2).map((v, idx) => {
              const isLeader = v.id === leadingVariantId;
              const convRate = v.totalScans > 0 ? ((v.conversions / v.totalScans) * 100).toFixed(1) : "0.0";

              return (
                <div
                  key={v.id || idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isLeader
                      ? "bg-primary/5 border-primary/40 shadow-xs"
                      : "bg-card dark:bg-[#141418] border-border dark:border-white/8 hover:border-border/80 dark:hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] ${
                          idx === 0
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate">{v.name}</span>
                    </div>

                    <span className="text-xs font-mono font-bold text-foreground bg-muted dark:bg-white/5 px-2 py-0.5 rounded border border-border dark:border-white/10">
                      {v.trafficWeight}%
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="text-[11px] font-mono text-muted-foreground bg-muted/60 dark:bg-black/40 p-1.5 rounded-md border border-border/50 dark:border-white/5 truncate mb-2.5 flex items-center gap-1.5">
                    <span className="text-muted-foreground">➔</span>
                    <a
                      href={v.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:text-foreground flex-1"
                    >
                      {v.destinationUrl}
                    </a>
                    <ExternalLink className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-border/60 dark:border-white/5">
                    <div className="text-muted-foreground">
                      <span>SCANS: </span>
                      <span className="text-foreground font-semibold">{v.totalScans.toLocaleString()}</span>
                    </div>
                    <div className="text-muted-foreground">
                      <span>RATE: </span>
                      <span className="text-primary font-bold">{convRate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Convergence Level 4: Reconnecting Conduits into Measurement */}
        <div className="w-full relative pt-2 flex flex-col items-center">
          {/* Inverted horizontal convergence line */}
          <div className="w-1/2 h-px bg-border/80 dark:bg-white/15" />
          <div className="w-px h-3 bg-border/80 dark:bg-white/15" />

          {/* Measurement Convergence Box */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-card dark:bg-black/40 border border-border dark:border-white/10 text-foreground dark:text-zinc-300 font-mono text-[10px]">
            <Activity className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
            <span>MEASUREMENT &amp; CONVERSION SIGNAL ENGINE</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE TELEMETRY</span>
          </div>
        </div>
      </div>

      {/* Mobile Linear Vertical Pipeline (Section 76) */}
      <div className="flex md:hidden flex-col gap-3">
        {/* Source */}
        <div className="p-2.5 rounded-lg bg-card dark:bg-white/[0.02] border border-border dark:border-white/10 flex items-center gap-2">
          <QrCode className="h-3.5 w-3.5 text-primary shrink-0" />
          <div className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
            {qrName} <span className="text-muted-foreground font-mono text-[10px]">({qrSlug})</span>
          </div>
        </div>

        {/* Stem */}
        <div className="flex justify-center text-muted-foreground">
          <ArrowDown className="h-3.5 w-3.5 text-primary" />
        </div>

        {/* Variants */}
        <div className="space-y-2">
          {variants.map((v, idx) => (
            <div key={v.id || idx} className="p-3 rounded-lg bg-card dark:bg-[#141418] border border-border dark:border-white/8 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  {String.fromCharCode(65 + idx)}: {v.name}
                </span>
                <span className="font-mono font-bold text-primary">{v.trafficWeight}%</span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground truncate bg-muted/60 dark:bg-black/30 p-1 rounded border border-border/50 dark:border-white/5">
                {v.destinationUrl}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
