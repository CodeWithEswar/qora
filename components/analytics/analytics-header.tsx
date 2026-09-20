"use client";

import * as React from "react";
import { Download, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnalyticsHeaderProps {
  orgSlug: string;
  range: "24h" | "7d" | "30d" | "90d" | "custom";
  onRangeChange: (range: "24h" | "7d" | "30d" | "90d") => void;
  onOpenFilterDrawer: () => void;
  activeFilterCount: number;
  onOpenExportDialog: () => void;
  onQuickExportCsv: () => void;
  isExporting?: boolean;
}

export function AnalyticsHeader({
  orgSlug,
  range,
  onRangeChange,
  onOpenFilterDrawer,
  activeFilterCount,
  onQuickExportCsv,
  isExporting = false,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-2">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
        <span className="hover:text-foreground transition-colors cursor-pointer capitalize">
          {orgSlug}
        </span>
        <span>/</span>
        <span className="text-foreground font-medium">Analytics</span>
      </div>

      {/* Main Title Row & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
              Analytics & Telemetry
            </h1>

            {/* Honest Telemetry Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-mono font-medium text-primary border border-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Edge Telemetry (UTC)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Understand how scans move through your QR infrastructure.
          </p>
        </div>

        {/* Global Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Quick Range Segmented Buttons */}
          <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5 text-xs font-mono shadow-xs">
            {(["24h", "7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRangeChange(r)}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors",
                  range === r
                    ? "bg-primary text-white font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Filter Trigger Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFilterDrawer}
            className={cn(
              "h-8 text-xs border-border bg-card text-foreground gap-1.5 hover:bg-muted shadow-xs",
              activeFilterCount > 0 && "border-primary/50 text-primary"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-mono flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Export Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={onQuickExportCsv}
            disabled={isExporting}
            className="h-8 text-xs border-border bg-card text-foreground gap-1.5 hover:bg-muted shadow-xs"
          >
            {isExporting ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>Export CSV</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
