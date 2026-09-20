"use client";

import * as React from "react";
import { FolderPulseMetrics } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn, formatNumber } from "@/lib/utils";

export interface FolderPulseProps {
  pulse: FolderPulseMetrics;
  className?: string;
}

export function FolderPulse({ pulse, className }: FolderPulseProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 dark:border-white/[0.06] bg-white dark:bg-[#18181B] shadow-2xs overflow-hidden",
        className
      )}
    >
      <div className="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-3 p-2.5 sm:p-3 overflow-x-auto no-scrollbar snap-x">
        {/* 1. Total Assets */}
        <div className="min-w-[105px] sm:min-w-0 flex-1 shrink-0 snap-start bg-muted/20 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none space-y-0.5 sm:space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            <NxtqrIcon icon="solar:qr-code-linear" size={13} className="text-primary shrink-0" />
            <span>Total Assets</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
            {formatNumber(pulse.qrCount)}
          </div>
        </div>

        {/* 2. Dynamic QRs */}
        <div className="min-w-[105px] sm:min-w-0 flex-1 shrink-0 snap-start bg-muted/20 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none space-y-0.5 sm:space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            <NxtqrIcon icon="solar:bolt-linear" size={13} className="text-amber-500 shrink-0" />
            <span>Dynamic</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
            {formatNumber(pulse.dynamicCount)}
          </div>
        </div>

        {/* 3. Static QRs */}
        <div className="min-w-[105px] sm:min-w-0 flex-1 shrink-0 snap-start bg-muted/20 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none space-y-0.5 sm:space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            <NxtqrIcon icon="solar:code-linear" size={13} className="text-zinc-400 shrink-0" />
            <span>Static</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
            {formatNumber(pulse.staticCount)}
          </div>
        </div>

        {/* 4. Destinations */}
        <div className="min-w-[105px] sm:min-w-0 flex-1 shrink-0 snap-start bg-muted/20 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none space-y-0.5 sm:space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            <NxtqrIcon icon="solar:link-square-linear" size={13} className="text-sky-500 shrink-0" />
            <span>Destinations</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
            {formatNumber(pulse.destinationCount)}
          </div>
        </div>

        {/* 5. Total Scans */}
        <div className="min-w-[105px] sm:min-w-0 flex-1 shrink-0 snap-start bg-muted/20 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none space-y-0.5 sm:space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            <NxtqrIcon icon="solar:chart-2-linear" size={13} className="text-emerald-500 shrink-0" />
            <span>Total Scans</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-foreground">
            {formatNumber(pulse.scanCount)}
          </div>
        </div>
      </div>
    </div>
  );
}
