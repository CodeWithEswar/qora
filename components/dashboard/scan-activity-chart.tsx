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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SCAN_ACTIVITY_7D,
  SCAN_ACTIVITY_30D,
  SCAN_ACTIVITY_90D,
  ScanTimeseriesPoint,
} from "@/lib/mock-data/dashboard";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const ChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-[#e6d5a8] dark:border-[#3f3f46] bg-[#fff8e0] dark:bg-[#18181b] p-2.5 shadow-md text-xs space-y-1">
        <p className="font-semibold text-[#1f1f1f] dark:text-[#f4f4f5] border-b border-[#e6d5a8]/60 dark:border-[#27272a] pb-1">
          {label}
        </p>
        <div className="flex items-center justify-between gap-4 text-primary">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#fa520f]" />
            Total Scans:
          </span>
          <span className="font-bold tabular-nums text-foreground">
            {payload[0].value.toLocaleString()}
          </span>
        </div>
        {payload[1] && (
          <div className="flex items-center justify-between gap-4 text-[#ffa110]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ffa110]" />
              Unique Scans:
            </span>
            <span className="font-bold tabular-nums text-foreground">
              {payload[1].value.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function ScanActivityChart() {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("30d");

  const data: ScanTimeseriesPoint[] = React.useMemo(() => {
    switch (timeRange) {
      case "7d":
        return SCAN_ACTIVITY_7D;
      case "90d":
        return SCAN_ACTIVITY_90D;
      case "30d":
      default:
        return SCAN_ACTIVITY_30D;
    }
  }, [timeRange]);

  return (
    <Card className="col-span-full xl:col-span-8">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
        <div>
          <CardTitle className="font-display text-lg font-normal tracking-tight">Scan Activity</CardTitle>
          <CardDescription>
            Total and unique scan telemetry across all published destinations
          </CardDescription>
        </div>

        <Tabs
          value={timeRange}
          onValueChange={(val) => setTimeRange(val as "7d" | "30d" | "90d")}
          className="w-auto"
        >
          <TabsList className="rounded-md bg-muted">
            <TabsTrigger value="7d">7D</TabsTrigger>
            <TabsTrigger value="30d">30D</TabsTrigger>
            <TabsTrigger value="90d">90D</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="pt-2 pb-6 px-3 sm:px-6">
        <div className="h-[280px] sm:h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Mistral Saturated Orange Gradient */}
                <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fa520f" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#fa520f" stopOpacity={0.0} />
                </linearGradient>
                {/* Sunset Sunshine 700 Gradient */}
                <linearGradient id="uniqueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffa110" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ffa110" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.8}
              />

              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={6}
              />

              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                dx={-4}
              />

              <Tooltip content={<ChartTooltip />} />

              <Area
                type="monotone"
                dataKey="scans"
                name="Total Scans"
                stroke="#fa520f"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#scansGradient)"
              />

              <Area
                type="monotone"
                dataKey="unique"
                name="Unique Scans"
                stroke="#ffa110"
                strokeWidth={1.75}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#uniqueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-end gap-5 text-xs text-muted-foreground mt-3 pr-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#fa520f]" />
            <span className="font-medium text-foreground">Total Scans</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ffa110]" />
            <span className="font-medium text-foreground">Unique Scans</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
