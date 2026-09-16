"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Smartphone, Monitor, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DEVICE_BREAKDOWN } from "@/lib/mock-data/dashboard";

const COLORS = ["#fa520f", "#ffa110", "#ffd06a", "#a8a8a8"];

export function DeviceBreakdownChart() {
  const iconMap: Record<string, React.ReactNode> = {
    iOS: <Smartphone className="h-3.5 w-3.5 text-primary" />,
    Android: <Smartphone className="h-3.5 w-3.5 text-[#ffa110]" />,
    Desktop: <Monitor className="h-3.5 w-3.5 text-[#ffd06a]" />,
    Other: <Globe className="h-3.5 w-3.5 text-muted-foreground" />,
  };

  return (
    <Card className="col-span-full xl:col-span-4 flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg font-normal tracking-tight">Traffic by Device</CardTitle>
        <CardDescription>Operating system distribution from scan requests</CardDescription>
      </CardHeader>

      <CardContent className="pt-2 pb-6 flex flex-col justify-between flex-1">
        {/* Donut Chart */}
        <div className="relative h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    return (
                      <div className="rounded-md border border-border bg-surface p-2 shadow-md text-xs">
                        <span className="font-semibold text-foreground">{item.name}: </span>
                        <span className="tabular-nums font-bold text-primary">
                          {item.value}%
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={DEVICE_BREAKDOWN}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
              >
                {DEVICE_BREAKDOWN.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Badge with Serif Stat Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-display text-2xl font-normal tracking-tight text-foreground tabular-nums">
              92%
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Mobile OS
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border-subtle">
          {DEVICE_BREAKDOWN.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs p-1.5 rounded-md bg-surface-hover/60">
              <div className="flex items-center gap-1.5">
                {iconMap[item.name]}
                <span className="font-medium text-foreground">{item.name}</span>
              </div>
              <span className="font-semibold tabular-nums text-muted-foreground">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
