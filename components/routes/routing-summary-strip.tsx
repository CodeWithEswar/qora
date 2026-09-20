"use client";

import * as React from "react";
import { QrCode, Route, Compass, CheckCircle2, ArrowRight } from "lucide-react";
import { RoutingSummaryMetrics } from "./types";

interface RoutingSummaryStripProps {
  metrics: RoutingSummaryMetrics;
}

export function RoutingSummaryStrip({ metrics }: RoutingSummaryStripProps) {
  return (
    <section
      aria-label="Routing instrumentation summary"
      className="relative rounded-xl border border-white/[0.08] bg-[#141414] overflow-hidden shadow-sm"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 divide-x divide-y md:divide-y-0 divide-white/[0.07]">
        {/* Metric 1: Total Dynamic QR */}
        <div className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-[#181818] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#85827B]">
            <span className="font-medium tracking-wider uppercase text-[10px]">
              Dynamic QRs
            </span>
            <QrCode className="h-3.5 w-3.5 text-[#85827B] group-hover:text-[#FA520F] transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F7F4EC]">
              {metrics.totalDynamicQr}
            </span>
            <span className="text-[11px] font-mono text-[#85827B]">assets</span>
          </div>
          <p className="mt-1 text-[11px] text-[#85827B] truncate">
            Tenant-isolated QR codes
          </p>
        </div>

        {/* Metric 2: Active Rules */}
        <div className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-[#181818] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#85827B]">
            <span className="font-medium tracking-wider uppercase text-[10px]">
              Active Rules
            </span>
            <Route className="h-3.5 w-3.5 text-[#85827B] group-hover:text-[#FA520F] transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F7F4EC]">
              {metrics.activeRules}
            </span>
            <span className="text-[11px] font-mono text-[#85827B]">evaluated</span>
          </div>
          <p className="mt-1 text-[11px] text-[#85827B] truncate">
            Contextual decision branches
          </p>
        </div>

        {/* Metric 3: Destinations */}
        <div className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-[#181818] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#85827B]">
            <span className="font-medium tracking-wider uppercase text-[10px]">
              Destinations
            </span>
            <Compass className="h-3.5 w-3.5 text-[#85827B] group-hover:text-[#FA520F] transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F7F4EC]">
              {metrics.destinationsCount}
            </span>
            <span className="text-[11px] font-mono text-[#85827B]">endpoints</span>
          </div>
          <p className="mt-1 text-[11px] text-[#85827B] truncate">
            Default & conditional targets
          </p>
        </div>

        {/* Metric 4: Published Config */}
        <div className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-[#181818] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#85827B]">
            <span className="font-medium tracking-wider uppercase text-[10px]">
              Published Policies
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-[#85827B] group-hover:text-[#FA520F] transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F7F4EC]">
              {metrics.publishedPolicies}
            </span>
            <span className="text-[11px] font-mono text-[#85827B]">live</span>
          </div>
          <p className="mt-1 text-[11px] text-[#85827B] truncate">
            Live edge snapshots committed
          </p>
        </div>

        {/* Metric 5 / Topology Visual: Real counts deterministic signal flow */}
        <div className="col-span-2 md:col-span-4 lg:col-span-1 p-4 sm:p-5 flex flex-col justify-between bg-[#111111]/80 hover:bg-[#181818] transition-colors">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#85827B] font-medium">
            <span>Routing Topology</span>
            <span className="text-[#FA520F] font-mono">1:1</span>
          </div>

          <div className="py-2 flex items-center justify-between gap-1 text-[10px] font-mono text-[#B8B5AD]">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#85827B]">SCAN</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white mt-0.5">
                {metrics.totalDynamicQr}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="h-[1px] w-full bg-gradient-to-r from-white/10 via-[#FA520F]/40 to-white/10 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-[#FA520F] rotate-45" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#85827B]">RULES</span>
              <span className="px-1.5 py-0.5 rounded bg-[#FA520F]/10 border border-[#FA520F]/30 text-[#FA520F] mt-0.5">
                {metrics.activeRules}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="h-[1px] w-full bg-gradient-to-r from-white/10 via-[#FA520F]/40 to-white/10 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-[#FA520F] rotate-45" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#85827B]">TARGET</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white mt-0.5">
                {metrics.destinationsCount}
              </span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#85827B] text-center">
            Deterministic Engine
          </div>
        </div>
      </div>
    </section>
  );
}
