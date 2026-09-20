"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

export interface ScanTimeseriesPoint {
  timestamp: string;
  scans: number;
  estimatedUniqueScans?: number;
}

export interface ScanPerformanceProps {
  qrId: string;
  orgSlug: string;
  totalScans: number;
  estimatedUniqueScans: number;
  timeseries?: ScanTimeseriesPoint[];
  topDevice?: string;
  topCountry?: string;
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function ScanPerformance({
  qrId,
  orgSlug,
  totalScans,
  estimatedUniqueScans,
  timeseries: initialTimeseries = [],
  topDevice,
  topCountry,
  isLoading: initialLoading = false,
  hasError: initialError = false,
  onRetry,
  className,
}: ScanPerformanceProps) {
  const [period, setPeriod] = React.useState<"7d" | "30d" | "90d" | "all">("30d");
  const [timeseries, setTimeseries] = React.useState<ScanTimeseriesPoint[]>(initialTimeseries);
  const [metrics, setMetrics] = React.useState({ totalScans, estimatedUniqueScans });
  const [deviceSummary, setDeviceSummary] = React.useState<string | undefined>(topDevice);
  const [countrySummary, setCountrySummary] = React.useState<string | undefined>(topCountry);
  const [isLoading, setIsLoading] = React.useState(initialLoading);
  const [hasError, setHasError] = React.useState(initialError);

  const periods: Array<{ id: "7d" | "30d" | "90d" | "all"; label: string }> = [
    { id: "7d", label: "7D" },
    { id: "30d", label: "30D" },
    { id: "90d", label: "90D" },
    { id: "all", label: "All Time" },
  ];

  const fetchAnalytics = React.useCallback(async (selectedPeriod: "7d" | "30d" | "90d" | "all") => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await fetch(`/api/v1/qrs/${qrId}/analytics?period=${selectedPeriod}`, {
        headers: { "x-organization-slug": orgSlug },
      });
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = await res.json();
      const payload = data.data;
      if (payload) {
        setMetrics({
          totalScans: payload.metrics?.totalScans || 0,
          estimatedUniqueScans: payload.metrics?.estimatedUniqueScans || 0,
        });
        setTimeseries(payload.timeseries || []);

        // Derive top device
        if (payload.breakdowns?.devices) {
          const devEntries = Object.entries(payload.breakdowns.devices as Record<string, number>);
          if (devEntries.length > 0) {
            devEntries.sort((a, b) => b[1] - a[1]);
            setDeviceSummary(devEntries[0][0]);
          }
        }

        // Derive top country
        if (payload.breakdowns?.countries) {
          const cEntries = Object.entries(payload.breakdowns.countries as Record<string, number>);
          if (cEntries.length > 0) {
            cEntries.sort((a, b) => b[1] - a[1]);
            setCountrySummary(cEntries[0][0]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load scan analytics:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [qrId, orgSlug]);

  const handlePeriodChange = (newPeriod: "7d" | "30d" | "90d" | "all") => {
    setPeriod(newPeriod);
    fetchAnalytics(newPeriod);
  };

  const chartData = React.useMemo(() => {
    return timeseries.map((pt) => ({
      date: new Date(pt.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      scans: pt.scans,
      unique: pt.estimatedUniqueScans || 0,
    }));
  }, [timeseries]);

  const hasScans = metrics.totalScans > 0;

  return (
    <div
      className={cn(
        "flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-5",
        className
      )}
    >
      {/* 1. Header & Period Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-1.5">
            <Icon icon="hugeicons:analytics-01" className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-muted-foreground">
              Scan Performance
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Observability and aggregate scan telemetry for this QR asset.
          </p>
        </div>

        {/* Period Picker */}
        <div className="flex items-center border border-border rounded-lg p-0.5 bg-surface-elevated/40 shrink-0">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePeriodChange(p.id)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors",
                period === p.id
                  ? "bg-primary text-white shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Connected Metric Rail */}
      <div className="rounded-xl border border-border/70 bg-surface-elevated/40 p-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
          {/* Total Scans */}
          <div className="p-3 space-y-0.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Total Scans
            </div>
            <div className="font-mono text-xl font-bold text-foreground">
              {metrics.totalScans.toLocaleString()}
            </div>
          </div>

          {/* Estimated Unique Scans */}
          <div className="p-3 space-y-0.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Est. Unique Scans
            </div>
            <div className="font-mono text-xl font-bold text-foreground">
              {metrics.estimatedUniqueScans.toLocaleString()}
            </div>
          </div>

          {/* Top Device */}
          <div className="p-3 space-y-0.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Top Device
            </div>
            <div className="font-mono text-sm font-semibold text-foreground truncate mt-1">
              {deviceSummary ? (
                <span className="capitalize">{deviceSummary}</span>
              ) : (
                <span className="text-muted-foreground font-normal">None recorded</span>
              )}
            </div>
          </div>

          {/* Top Region */}
          <div className="p-3 space-y-0.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Top Country
            </div>
            <div className="font-mono text-sm font-semibold text-foreground truncate mt-1">
              {countrySummary ? (
                <span>{countrySummary}</span>
              ) : (
                <span className="text-muted-foreground font-normal">None recorded</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recharts Scan Activity Chart */}
      <div className="min-h-[220px] flex items-center justify-center">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
            <Icon icon="hugeicons:reload" className="w-5 h-5 animate-spin text-primary" />
            <span>Loading telemetry data…</span>
          </div>
        ) : hasError ? (
          <div className="py-10 px-4 text-center rounded-xl border border-rose-500/20 bg-rose-500/[0.03] space-y-2 w-full">
            <div className="text-xs font-semibold text-foreground">Scan analytics unavailable</div>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              Telemetry pipeline encountered a query timeout. Your QR resolution remains fully active.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry ? onRetry() : fetchAnalytics(period)}
              className="text-xs h-8 px-3 gap-1.5"
            >
              <Icon icon="hugeicons:reload" className="w-3 h-3" />
              <span>Retry Query</span>
            </Button>
          </div>
        ) : !hasScans || chartData.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-xl border border-dashed border-border/70 bg-surface-elevated/20 w-full space-y-2">
            <div className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mx-auto">
              <Icon icon="hugeicons:chart-line-data-02" className="w-4 h-4" />
            </div>
            <div className="text-xs font-semibold text-foreground">No scan activity yet</div>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Telemetry will automatically visualize here once this dynamic QR begins receiving scans.
            </p>
          </div>
        ) : (
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="qrScansGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FA520F" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FA520F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E5E5", opacity: 0.5 }}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface, #ffffff)",
                    borderColor: "var(--color-border, #e5e5e5)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value: unknown) => [Number(value || 0).toLocaleString(), "Scans"]}
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#FA520F"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#qrScansGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 4. Telemetry Pipeline Disclaimer */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <div className="flex items-center gap-1.5">
          <Icon icon="hugeicons:server-03" className="w-3.5 h-3.5 text-muted-foreground/70" />
          <span>Scan telemetry is processed asynchronously via durable event pipelines.</span>
        </div>
      </div>
    </div>
  );
}
