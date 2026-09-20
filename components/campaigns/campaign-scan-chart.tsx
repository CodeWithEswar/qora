"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export interface ScanChartDataPoint {
  date: string;
  scans: number;
  uniqueScans: number;
}

export interface CampaignScanChartProps {
  data: ScanChartDataPoint[];
  className?: string;
}

export function CampaignScanChart({ data, className }: CampaignScanChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.scans === 0)) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-surface/30 rounded-xl border border-border/50">
        <div className="text-xs font-semibold text-foreground mb-1">
          No scan activity recorded yet
        </div>
        <p className="text-[11px] text-muted-foreground max-w-xs">
          When QR codes in this campaign receive real scans, the signal wave will chart daily scan trends here.
        </p>
      </div>
    );
  }

  return (
    <div className={`h-56 w-full ${className || ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="campaignScanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FA520F" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FA520F" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke="currentColor"
            className="text-[10px] text-muted-foreground font-mono"
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => {
              try {
                const parts = val.split("-");
                return `${parts[1]}/${parts[2]}`;
              } catch {
                return val;
              }
            }}
          />
          <YAxis
            stroke="currentColor"
            className="text-[10px] text-muted-foreground font-mono"
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-surface p-2 shadow-md text-xs font-mono">
                    <div className="text-muted-foreground text-[10px] mb-1">{label}</div>
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                      <span>{Number(payload[0].value).toLocaleString()} scans</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="scans"
            stroke="#FA520F"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#campaignScanGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
