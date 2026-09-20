"use client";

import * as React from "react";
import Link from "next/link";
import { CampaignAnalyticsV1 } from "@nxtqr/contracts";
import { CampaignScanChart } from "./campaign-scan-chart";
import { cn, formatNumber } from "@/lib/utils";

export interface CampaignPerformanceProps {
  analytics: CampaignAnalyticsV1 | null;
  selectedPeriod: "7d" | "30d" | "90d" | "all";
  onPeriodChange: (period: "7d" | "30d" | "90d" | "all") => void;
  orgSlug: string;
  className?: string;
}

export function CampaignPerformance({
  analytics,
  selectedPeriod,
  onPeriodChange,
  orgSlug,
  className,
}: CampaignPerformanceProps) {
  const periods: Array<{ id: "7d" | "30d" | "90d" | "all"; label: string }> = [
    { id: "7d", label: "7D" },
    { id: "30d", label: "30D" },
    { id: "90d", label: "90D" },
    { id: "all", label: "All time" },
  ];

  const totalScans = analytics?.totalScans || 0;
  const uniqueScans = analytics?.uniqueScans || 0;
  const activeQrs = analytics?.activeQrs || 0;
  const topQrAssets = analytics?.topQrAssets || [];

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface p-5 shadow-2xs space-y-5",
        className
      )}
    >
      {/* Header with period toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
            Telemetry
          </div>
          <h2 className="text-sm font-bold text-foreground">
            Campaign Performance
          </h2>
        </div>

        <div className="flex items-center border border-border rounded-lg p-0.5 bg-surface-elevated/40 w-full sm:w-auto">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPeriodChange(p.id)}
              className={cn(
                "flex-1 sm:flex-initial px-2.5 py-1 text-xs rounded-md font-medium transition-colors text-center",
                selectedPeriod === p.id
                  ? "bg-surface text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-surface-elevated/50 border border-border/40 font-mono">
        <div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider truncate">Total Scans</div>
          <div className="text-base sm:text-xl font-bold text-foreground mt-0.5">{formatNumber(totalScans)}</div>
        </div>
        <div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider truncate">Unique Scans</div>
          <div className="text-base sm:text-xl font-bold text-foreground mt-0.5">{formatNumber(uniqueScans)}</div>
        </div>
        <div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider truncate">Active QRs</div>
          <div className="text-base sm:text-xl font-bold text-foreground mt-0.5">{formatNumber(activeQrs)}</div>
        </div>
      </div>

      {/* Scan Signal Chart */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-foreground">Scan Trends</div>
        <CampaignScanChart data={analytics?.timeSeries || []} />
      </div>

      {/* Top QR Assets List */}
      {topQrAssets.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-border/50">
          <div className="text-xs font-semibold text-foreground">
            Most Scanned QR Codes
          </div>
          <div className="space-y-1.5">
            {topQrAssets.map((qr) => (
              <div
                key={qr.id}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated/40 border border-border/40 text-xs"
              >
                <div className="min-w-0 pr-3">
                  <Link
                    href={`/${orgSlug}/qr/${qr.id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors block truncate"
                  >
                    {qr.name}
                  </Link>
                  <span className="text-[10px] text-muted-foreground font-mono block truncate">
                    {qr.destinationUrl}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono">
                  <div className="text-right">
                    <div className="font-bold text-foreground">{formatNumber(qr.scans)}</div>
                    <div className="text-[10px] text-muted-foreground">{qr.share}% share</div>
                  </div>
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, qr.share)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
