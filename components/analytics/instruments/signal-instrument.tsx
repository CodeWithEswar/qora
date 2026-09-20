"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { MetricSparkline } from "./metric-sparkline";
import { cn } from "@/lib/utils";

export interface SignalInstrumentProps {
  title: string;
  value: string | number;
  icon: string;
  change?: number | null;
  comparisonLabel?: string;
  sparklineData?: number[];
  color?: string; // e.g. "#FA520F"
  gradientId: string;
  contextHint?: string;
  className?: string;
}

export function SignalInstrument({
  title,
  value,
  icon,
  change,
  comparisonLabel = "No previous-period data",
  sparklineData = [],
  color = "#FA520F",
  gradientId,
  contextHint,
  className,
}: SignalInstrumentProps) {
  const isPositive = typeof change === "number" && change > 0;
  const isNegative = typeof change === "number" && change < 0;
  const isNeutral = typeof change === "number" && change === 0;
  const hasChange = typeof change === "number";

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border bg-card hover:bg-muted/40 p-5 shadow-xs transition-all duration-200 hover:border-border/80",
        className
      )}
    >
      {/* Header: Title + Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
          <Icon icon={icon} className="h-4 w-4" />
        </div>
      </div>

      {/* Main Metric Row: Value + Sparkline */}
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div className="font-mono text-2xl sm:text-3xl font-semibold text-foreground tracking-tight tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="shrink-0">
          <MetricSparkline
            data={sparklineData}
            color={color}
            gradientId={gradientId}
            height={32}
            width={84}
          />
        </div>
      </div>

      {/* Comparison Delta / Context */}
      <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {hasChange ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded shrink-0",
                isPositive && "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                isNegative && "bg-rose-500/10 text-rose-500 border border-rose-500/20",
                isNeutral && "bg-muted text-muted-foreground border border-border"
              )}
            >
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
          ) : null}

          <span className="text-[11px] text-muted-foreground truncate block">
            {comparisonLabel}
          </span>
        </div>

        {contextHint && (
          <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0 hidden md:inline">
            {contextHint}
          </span>
        )}
      </div>
    </div>
  );
}
