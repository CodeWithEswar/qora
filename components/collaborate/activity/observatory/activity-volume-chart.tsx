"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ActivityTimeSeriesPoint } from "@/lib/supabase/types/activity";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface ActivityVolumeChartProps {
  data: ActivityTimeSeriesPoint[];
  className?: string;
}

export function ActivityVolumeChart({ data, className }: ActivityVolumeChartProps) {
  const totalVolume = React.useMemo(() => {
    return data.reduce((sum, d) => sum + d.total, 0);
  }, [data]);

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md font-mono text-xs select-none",
        className
      )}
      role="region"
      aria-label="Activity Volume Chart"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#FA520F] font-bold">
            07 / CHANGE VOLUME
          </span>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-xs text-muted-foreground font-sans">
            Temporal time-series tracking overall operational volume
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-muted-foreground">
            Total: <strong className="text-foreground">{totalVolume}</strong> events
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-xs font-mono">
          No time-series data available for the selected period.
        </div>
      ) : (
        <div className="h-[200px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FA520F" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FA520F" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pubGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB83E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFB83E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fontSize: 10, fill: "currentColor" }}
                tickFormatter={(val) => {
                  const parts = val.split("-");
                  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
                }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fontSize: 10, fill: "currentColor" }}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-2.5 rounded-lg bg-popover border border-border text-popover-foreground shadow-md font-mono text-xs space-y-1">
                        <p className="text-[10px] text-muted-foreground font-bold">{label}</p>
                        <p className="text-[#FA520F] font-semibold">
                          Total Events: {payload[0]?.value}
                        </p>
                        {payload[1] && (
                          <p className="text-[#FFB83E] text-[11px]">
                            Publishes: {payload[1]?.value}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#FA520F"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#totalGrad)"
                name="Total Activity"
              />
              <Area
                type="monotone"
                dataKey="publishes"
                stroke="#FFB83E"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#pubGrad)"
                name="Publishes"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
