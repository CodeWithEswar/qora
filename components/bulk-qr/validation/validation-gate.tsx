"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { BulkValidationGateMetrics, RowValidationStatus } from "@/lib/domains/bulk-qr";

interface ValidationGateProps {
  metrics: BulkValidationGateMetrics;
  activeFilter: RowValidationStatus | "ALL";
  onSelectFilter: (status: RowValidationStatus | "ALL") => void;
}

export function ValidationGate({
  metrics,
  activeFilter,
  onSelectFilter,
}: ValidationGateProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 backdrop-blur-xl shadow-lg relative overflow-hidden">
      {/* Subtle top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono tracking-wider uppercase mb-2 font-semibold">
          <Icon icon="lucide:shield-check" className="w-3.5 h-3.5" />
          NXTQR Validation Gate
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground font-serif">
          Preflight Asset Audit
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          Every incoming record is verified against QR Core schemas, SSRF safety rules, and scanability thresholds.
        </p>
      </div>

      {/* Branching Architecture Visual */}
      <div className="relative max-w-3xl mx-auto">
        {/* Source Stem */}
        <div className="flex flex-col items-center">
          <div className="px-4 py-1.5 rounded-lg border border-border/80 bg-muted/60 text-xs font-mono text-foreground flex items-center gap-2 shadow-xs">
            <Icon icon="lucide:layers" className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{metrics.totalRows} Ingested Records</span>
          </div>
          {/* Vertical Trunk */}
          <div className="w-px h-6 bg-border/60" />
          {/* Horizontal Split Rail */}
          <div className="w-3/4 h-px bg-border/60 relative">
            {/* Split markers */}
            <div className="absolute left-0 top-0 w-px h-4 bg-border/60" />
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-4 bg-border/60" />
            <div className="absolute right-0 top-0 w-px h-4 bg-border/60" />
          </div>
        </div>

        {/* 3 Status Lanes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Lane 1: READY */}
          <button
            type="button"
            onClick={() => onSelectFilter(activeFilter === "READY" ? "ALL" : "READY")}
            className={`flex flex-col items-center p-4 rounded-xl border text-center transition-all group cursor-pointer ${
              activeFilter === "READY"
                ? "border-emerald-500/60 bg-emerald-500/10 ring-2 ring-emerald-500/20"
                : "border-border/80 bg-surface/60 hover:border-emerald-500/30 hover:bg-muted/60"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-2 group-hover:scale-110 transition-transform">
              <Icon icon="lucide:check-circle" className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-semibold">
              Ready to Create
            </span>
            <span className="text-2xl font-bold font-mono text-foreground my-1">
              {metrics.readyRows}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Valid schema & safe destination
            </span>
          </button>

          {/* Lane 2: WARNING */}
          <button
            type="button"
            onClick={() => onSelectFilter(activeFilter === "WARNING" ? "ALL" : "WARNING")}
            className={`flex flex-col items-center p-4 rounded-xl border text-center transition-all group cursor-pointer ${
              activeFilter === "WARNING"
                ? "border-amber-500/60 bg-amber-500/10 ring-2 ring-amber-500/20"
                : "border-border/80 bg-surface/60 hover:border-amber-500/30 hover:bg-muted/60"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-2 group-hover:scale-110 transition-transform">
              <Icon icon="lucide:alert-triangle" className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-500 font-semibold">
              Scan Warnings
            </span>
            <span className="text-2xl font-bold font-mono text-foreground my-1">
              {metrics.warningRows}
            </span>
            <span className="text-[10px] text-muted-foreground">
              High density or scanability alert
            </span>
          </button>

          {/* Lane 3: BLOCKED */}
          <button
            type="button"
            onClick={() => onSelectFilter(activeFilter === "BLOCKED" ? "ALL" : "BLOCKED")}
            className={`flex flex-col items-center p-4 rounded-xl border text-center transition-all group cursor-pointer ${
              activeFilter === "BLOCKED"
                ? "border-red-500/60 bg-red-500/10 ring-2 ring-red-500/20"
                : "border-border/80 bg-surface/60 hover:border-red-500/30 hover:bg-muted/60"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-2 group-hover:scale-110 transition-transform">
              <Icon icon="lucide:x-octagon" className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-red-500 font-semibold">
              Blocked Records
            </span>
            <span className="text-2xl font-bold font-mono text-foreground my-1">
              {metrics.blockedRows}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Schema violations or SSRF risk
            </span>
          </button>
        </div>

        {/* View all reset trigger */}
        {activeFilter !== "ALL" && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => onSelectFilter("ALL")}
              className="text-xs font-mono text-neutral-400 hover:text-orange-400 underline underline-offset-4"
            >
              Reset filter (Show all {metrics.totalRows} rows)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
