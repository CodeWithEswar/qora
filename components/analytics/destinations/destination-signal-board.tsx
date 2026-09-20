"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DestinationBoardItem {
  url: string;
  domain: string;
  label: string;
  scans: number;
  sharePercentage: number;
  trend: number;
}

interface DestinationSignalBoardProps {
  destinations?: DestinationBoardItem[];
  onSelectDestination?: (url: string) => void;
  className?: string;
}

export function DestinationSignalBoard({
  destinations = [],
  onSelectDestination,
  className,
}: DestinationSignalBoardProps) {
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
            <h4 className="font-serif text-base font-normal tracking-tight text-foreground">
              Destination Signal Board
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Top resolved target URLs ranked by delivery volume
            </p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
            {destinations.length} TARGETS
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {destinations.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No resolved destination telemetry recorded in this period.
            </div>
          ) : (
            destinations.slice(0, 6).map((dest, idx) => (
              <div
                key={idx}
                onClick={() => onSelectDestination?.(dest.url)}
                className="p-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 cursor-pointer transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-[10px] text-muted-foreground/60 w-3">
                    0{idx + 1}
                  </span>
                  <div className="w-6 h-6 rounded-md bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate text-[11px]">
                      {dest.domain}
                    </p>
                    <span className="text-[10px] font-mono text-muted-foreground truncate block max-w-[140px] sm:max-w-[200px]">
                      {dest.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] shrink-0">
                  <span className="text-foreground font-semibold tabular-nums">
                    {dest.scans.toLocaleString()}
                  </span>
                  <span className="text-amber-500 font-medium w-11 text-right tabular-nums">
                    {dest.sharePercentage}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Click target to inspect flow</span>
        <span>Coarse URL sanitization</span>
      </div>
    </div>
  );
}
