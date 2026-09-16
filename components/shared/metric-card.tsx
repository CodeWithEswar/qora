import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  comparison?: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  sparklineData?: number[];
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  comparison = "vs. last month",
  prefix,
  suffix,
  icon,
  sparklineData,
  className,
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const step = width / (sparklineData.length - 1);

    const points = sparklineData
      .map((val, idx) => {
        const x = idx * step;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    const strokeColor = isNegative
      ? "#dc2626"
      : isPositive
      ? "#fa520f"
      : "#ffa110";

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0 opacity-90">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <Card className={cn("relative overflow-hidden transition-all hover:border-border-strong", className)}>
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          {icon && <div className="text-muted-foreground/70">{icon}</div>}
        </div>

        <div className="flex items-baseline justify-between gap-2 mt-3">
          <div className="flex items-baseline">
            {prefix && <span className="text-lg text-muted-foreground mr-1 font-serif">{prefix}</span>}
            <span className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-foreground tabular-nums leading-none">
              {value}
            </span>
            {suffix && <span className="text-sm text-muted-foreground ml-1.5 font-normal">{suffix}</span>}
          </div>

          {renderSparkline()}
        </div>

        {change !== undefined && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-subtle text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold text-[11px] px-2 py-0.5 rounded-full",
                isPositive && "text-white bg-primary",
                isNegative && "text-red-700 bg-red-500/15 dark:text-red-400",
                isNeutral && "text-muted-foreground bg-muted"
              )}
            >
              {isPositive && <TrendingUp className="h-3 w-3 shrink-0" />}
              {isNegative && <TrendingDown className="h-3 w-3 shrink-0" />}
              {isNeutral && <Minus className="h-3 w-3 shrink-0" />}
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-muted-foreground text-[11px] truncate">{comparison}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
