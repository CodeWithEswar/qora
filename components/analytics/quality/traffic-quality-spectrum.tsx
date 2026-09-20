"use client";

import * as React from "react";
import { ShieldCheck, ShieldAlert, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrafficQualityData {
  normalScans: number;
  normalPercentage: number;
  suspectedAutomation: number;
  suspectedPercentage: number;
  blockedRequests: number;
  blockedPercentage: number;
}

interface TrafficQualitySpectrumProps {
  data?: TrafficQualityData;
  className?: string;
}

export function TrafficQualitySpectrum({
  data = {
    normalScans: 0,
    normalPercentage: 100,
    suspectedAutomation: 0,
    suspectedPercentage: 0,
    blockedRequests: 0,
    blockedPercentage: 0,
  },
  className,
}: TrafficQualitySpectrumProps) {
  const total = data.normalScans + data.suspectedAutomation + data.blockedRequests;

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
                Traffic Quality Spectrum
              </h4>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Conservative edge classification of scanner request telemetry
            </p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
            QUALITY SPECTRUM
          </span>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
          {/* Normal Traffic */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/40 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Normal Traffic</span>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="font-mono text-xl font-bold text-foreground tabular-nums">
              {data.normalScans.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-emerald-500 font-semibold">
              {data.normalPercentage}% of requests
            </div>
            <span className="text-[10px] text-muted-foreground block pt-1">
              Human scanner visits
            </span>
          </div>

          {/* Suspected Automation */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/40 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Suspected Automation</span>
              <ShieldAlert className="h-4 w-4 text-amber-500" />
            </div>
            <div className="font-mono text-xl font-bold text-amber-500 tabular-nums">
              {data.suspectedAutomation.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-amber-500 font-semibold">
              {data.suspectedPercentage}% of requests
            </div>
            <span className="text-[10px] text-muted-foreground block pt-1">
              Preview crawlers & unfurlers
            </span>
          </div>

          {/* Blocked Requests */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/40 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Blocked Requests</span>
              <AlertOctagon className="h-4 w-4 text-rose-500" />
            </div>
            <div className="font-mono text-xl font-bold text-rose-500 tabular-nums">
              {data.blockedRequests.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-rose-500 font-semibold">
              {data.blockedPercentage}% of requests
            </div>
            <span className="text-[10px] text-muted-foreground block pt-1">
              Paused or expired slugs
            </span>
          </div>
        </div>

        {/* Long Spectral Signal Band */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Spectral Request Distribution</span>
            <span>{total.toLocaleString()} Evaluated</span>
          </div>

          <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
            {total === 0 ? (
              <div className="w-full h-full bg-muted" />
            ) : (
              <>
                <div
                  style={{ width: `${data.normalPercentage}%` }}
                  className="h-full bg-emerald-500 transition-all duration-300"
                  title={`Normal: ${data.normalPercentage}%`}
                />
                <div
                  style={{ width: `${data.suspectedPercentage}%` }}
                  className="h-full bg-amber-500 transition-all duration-300"
                  title={`Suspected: ${data.suspectedPercentage}%`}
                />
                <div
                  style={{ width: `${data.blockedPercentage}%` }}
                  className="h-full bg-rose-500 transition-all duration-300"
                  title={`Blocked: ${data.blockedPercentage}%`}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Edge User-Agent Heuristic</span>
        <span>Transparent Quality Isolation</span>
      </div>
    </div>
  );
}
