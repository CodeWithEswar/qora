"use client";

import * as React from "react";
import { GeoDataPoint } from "./scan-atlas";
import { cn } from "@/lib/utils";

interface GeographicSignalProps {
  data: GeoDataPoint[];
  selectedCountry?: string;
  onSelectCountry?: (countryCode: string) => void;
  className?: string;
}

export function GeographicSignal({
  data = [],
  selectedCountry,
  onSelectCountry,
  className,
}: GeographicSignalProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between text-card-foreground",
        className
      )}
    >
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h4 className="font-serif text-base font-normal tracking-tight text-foreground">
              Geographic Signal
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Top origin regions ranked by scan volume
            </p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
            {data.length} REGIONS
          </span>
        </div>

        {/* Region Rows */}
        <div className="mt-4 space-y-2">
          {data.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No regional scan signals recorded in this period.
            </div>
          ) : (
            data.slice(0, 7).map((point, idx) => {
              const isSelected = selectedCountry === point.countryCode;

              return (
                <div
                  key={point.countryCode}
                  onClick={() => onSelectCountry?.(point.countryCode)}
                  className={cn(
                    "group relative p-2.5 rounded-lg border border-transparent transition-all cursor-pointer",
                    isSelected
                      ? "bg-muted border-primary/40 shadow-xs"
                      : "hover:bg-muted/60 hover:border-border"
                  )}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground/60 w-3">
                        0{idx + 1}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
                        {point.countryCode}
                      </span>
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[120px]">
                        {point.countryName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-foreground font-semibold tabular-nums">
                        {point.scans.toLocaleString()}
                      </span>
                      <span className="text-amber-500 font-medium w-11 text-right tabular-nums">
                        {point.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Micro Intensity Bar */}
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden border border-border/40">
                    <div
                      style={{ width: `${Math.min(100, Math.max(3, point.percentage))}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        isSelected
                          ? "bg-primary shadow-[0_0_6px_rgba(250,82,15,0.8)]"
                          : "bg-primary/80 group-hover:bg-primary"
                      )}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Click region to filter dashboard</span>
        {selectedCountry && (
          <button
            onClick={() => onSelectCountry?.("")}
            className="text-primary hover:underline text-[10px] font-mono"
          >
            Reset region filter
          </button>
        )}
      </div>
    </div>
  );
}
