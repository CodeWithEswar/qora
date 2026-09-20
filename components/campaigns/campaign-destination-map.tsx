"use client";

import * as React from "react";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface DestinationTopologyNode {
  domain: string;
  count: number;
  qrCount: number;
}

export interface CampaignDestinationMapProps {
  destinations: DestinationTopologyNode[];
  onSelectDestination?: (dest: DestinationTopologyNode) => void;
  className?: string;
}

export function CampaignDestinationMap({
  destinations,
  onSelectDestination,
  className,
}: CampaignDestinationMapProps) {
  if (destinations.length === 0) {
    return (
      <div
        className={cn(
          "p-6 text-center rounded-xl border border-dashed border-border/70 bg-surface/30",
          className
        )}
      >
        <div className="text-xs font-semibold text-foreground">
          No Destinations Configured
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Add QR codes with target destination URLs to visualize the routing distribution.
        </p>
      </div>
    );
  }

  const totalScans = destinations.reduce((sum, d) => sum + d.count, 0);

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface p-4 sm:p-5 shadow-2xs space-y-3.5",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
          <NxtqrIcon icon="solar:link-square-bold" size={12} />
          <span>Traffic Attribution</span>
        </div>
        <h2 className="text-sm font-bold text-foreground mt-0.5">
          Destination Distribution
        </h2>
      </div>

      <div className="space-y-2">
        {destinations.map((dest) => {
          const share = totalScans > 0 ? Math.round((dest.count / totalScans) * 100) : 0;

          return (
            <button
              key={dest.domain}
              type="button"
              onClick={() => onSelectDestination?.(dest)}
              className={cn(
                "w-full p-3 rounded-xl bg-surface-elevated/40 border border-border/60 space-y-2 text-xs text-left transition-all",
                "hover:border-primary/40 hover:bg-surface-elevated/70 group cursor-pointer"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <NxtqrIcon icon="solar:link-square-bold" size={12} />
                  </div>
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {dest.domain}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                    {dest.qrCount} {dest.qrCount === 1 ? "QR" : "QRs"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold border border-primary/20">
                    {dest.count.toLocaleString()} scans
                  </span>
                  <NxtqrIcon
                    icon="solar:arrow-right-up-bold"
                    size={11}
                    className="text-primary opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline"
                  />
                </div>
              </div>

              {/* Share Bar */}
              <div className="w-full h-1.5 rounded-full bg-muted/80 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, share)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
