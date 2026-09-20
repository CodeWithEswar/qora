"use client";

import * as React from "react";
import { ArrowDown, ScanLine, Globe, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConversionJourneyData {
  scans: number;
  destinationsReached: number;
  conversions: number;
  conversionRate: number;
}

interface ConversionJourneyProps {
  data?: ConversionJourneyData;
  className?: string;
}

export function ConversionJourney({
  data = { scans: 0, destinationsReached: 0, conversions: 0, conversionRate: 0 },
  className,
}: ConversionJourneyProps) {
  const destRate = data.scans > 0 ? Number(((data.destinationsReached / data.scans) * 100).toFixed(1)) : 100;

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
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="font-serif text-base font-normal tracking-tight text-foreground">
                Conversion Journey
              </h4>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Observable progression from initial physical scan to recorded conversion outcome
            </p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
            OBSERVED FUNNEL
          </span>
        </div>

        {/* Observable Funnel Steps */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
          {/* Step 1: Scan Event */}
          <div className="flex-1 w-full p-4 rounded-xl border border-border bg-muted/40 space-y-1 text-center">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center mb-2">
              <ScanLine className="h-4 w-4" />
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">
              01 · SCAN CAPTURED
            </span>
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {data.scans.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-500 font-semibold block">100% Inbound</span>
          </div>

          <ArrowDown className="md:-rotate-90 h-5 w-5 text-muted-foreground shrink-0 opacity-40" />

          {/* Step 2: Destination Reached */}
          <div className="flex-1 w-full p-4 rounded-xl border border-border bg-muted/40 space-y-1 text-center">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 mx-auto flex items-center justify-center mb-2">
              <Globe className="h-4 w-4" />
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">
              02 · TARGET RESOLVED
            </span>
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {data.destinationsReached.toLocaleString()}
            </div>
            <span className="text-[11px] text-amber-500 font-semibold block">
              {destRate}% Delivery
            </span>
          </div>

          <ArrowDown className="md:-rotate-90 h-5 w-5 text-muted-foreground shrink-0 opacity-40" />

          {/* Step 3: Conversion Signal */}
          <div className="flex-1 w-full p-4 rounded-xl border border-border bg-muted/40 space-y-1 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center mb-2">
              <Target className="h-4 w-4" />
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">
              03 · GOAL CONVERTED
            </span>
            <div className="text-2xl font-bold text-emerald-500 tabular-nums">
              {data.conversions.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-500 font-semibold block">
              {data.conversionRate}% Conv. Rate
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Verified telemetry events only</span>
        <span>Zero simulated attrition</span>
      </div>
    </div>
  );
}
