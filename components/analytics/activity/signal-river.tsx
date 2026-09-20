"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface RiverPoint {
  timestamp: string;
  label: string;
  totalScans: number;
  uniqueScans: number;
  conversions: number;
  topQrName?: string;
  topDestination?: string;
}

interface SignalRiverProps {
  series: RiverPoint[];
  rangeKey?: string;
  className?: string;
}

// Custom structured tooltip
const RiverTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as RiverPoint;

    return (
      <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-md p-3.5 shadow-2xl text-xs space-y-2 min-w-[210px] text-popover-foreground">
        {/* Header timestamp */}
        <div className="flex items-center justify-between border-b border-border pb-1.5 font-mono text-[11px] text-muted-foreground">
          <span>{data.label}</span>
          <span className="text-[10px] text-muted-foreground">UTC</span>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary" />
              TOTAL SCANS:
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {data.totalScans.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              EST. UNIQUE:
            </span>
            <span className="font-bold text-amber-500 tabular-nums">
              {data.uniqueScans.toLocaleString()}
            </span>
          </div>

          {data.conversions > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                CONVERSIONS:
              </span>
              <span className="font-bold text-emerald-500 tabular-nums">
                {data.conversions.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Context metadata if available */}
        {(data.topQrName || data.topDestination) && (
          <div className="pt-1.5 border-t border-border text-[10px] space-y-0.5 text-muted-foreground">
            {data.topQrName && (
              <div className="flex items-center justify-between">
                <span>Top QR:</span>
                <span className="text-foreground font-medium truncate max-w-[120px]">{data.topQrName}</span>
              </div>
            )}
            {data.topDestination && (
              <div className="flex items-center justify-between">
                <span>Target:</span>
                <span className="text-foreground font-medium truncate max-w-[120px]">{data.topDestination}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function SignalRiver({ series = [], className }: SignalRiverProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const hasData = series.length > 0 && series.some((s) => s.totalScans > 0);

  const renderChart = (height: number | string = "100%") => (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={series}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            {/* NXTQR Saturated Orange Waveform Gradient */}
            <linearGradient id="riverOrangeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FA520F" stopOpacity={0.4} />
              <stop offset="60%" stopColor="#FA520F" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#FA520F" stopOpacity={0.0} />
            </linearGradient>

            {/* Warm Amber Unique Scan Gradient */}
            <linearGradient id="riverCreamGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFB83E" stopOpacity={0.3} />
              <stop offset="80%" stopColor="#FF8105" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#FF8105" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(128, 128, 128, 0.15)"
          />

          <XAxis
            dataKey="label"
            stroke="currentColor"
            className="text-muted-foreground"
            fontSize={10}
            fontFamily="var(--font-jetbrains-mono, monospace)"
            tickLine={false}
            axisLine={false}
            dy={8}
          />

          <YAxis
            stroke="currentColor"
            className="text-muted-foreground"
            fontSize={10}
            fontFamily="var(--font-jetbrains-mono, monospace)"
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
            dx={-4}
          />

          <Tooltip
            content={<RiverTooltip />}
            cursor={{ stroke: "rgba(250, 82, 15, 0.4)", strokeWidth: 1.5, strokeDasharray: "4 4" }}
          />

          {/* Layer 1: Total Scans Flow */}
          <Area
            type="monotone"
            dataKey="totalScans"
            name="Total Scans"
            stroke="#FA520F"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#riverOrangeGradient)"
          />

          {/* Layer 2: Estimated Unique Waveform */}
          <Area
            type="monotone"
            dataKey="uniqueScans"
            name="Unique Scans"
            stroke="#FFB83E"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            fillOpacity={1}
            fill="url(#riverCreamGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between text-card-foreground",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-serif text-lg font-normal tracking-tight text-foreground">
              Signal River
            </h4>
            <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
              TELEMETRY WAVEFORM
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Temporal scan volume density layered with estimated unique signal velocity
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted-foreground mr-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-foreground">Total Scans</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB83E]" />
              <span className="text-foreground">Est. Unique</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(true)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Expand River"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] sm:h-[320px] w-full mt-4 flex items-center justify-center">
        {!hasData ? (
          <div className="text-center text-xs text-muted-foreground font-mono space-y-2">
            <div className="w-8 h-8 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              ~
            </div>
            <div>No scan signals recorded for this time slice.</div>
          </div>
        ) : (
          renderChart("100%")
        )}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] w-[1400px] h-[80vh] bg-card border-border p-6 flex flex-col justify-between text-card-foreground">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
            <div>
              <DialogTitle className="font-serif text-xl font-normal text-foreground">
                Signal River — Expanded Telemetry Waveform
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                High-resolution temporal scan distribution
              </p>
            </div>
          </DialogHeader>

          <div className="flex-1 w-full my-4 flex items-center justify-center">
            {renderChart("100%")}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
