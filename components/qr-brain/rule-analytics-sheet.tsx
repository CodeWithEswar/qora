"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { QrBrainAnalyticsReport } from "@/lib/domains/routing";

interface RuleAnalyticsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analytics: QrBrainAnalyticsReport | null;
  isLoading: boolean;
}

export function RuleAnalyticsSheet({
  open,
  onOpenChange,
  analytics,
  isLoading,
}: RuleAnalyticsSheetProps) {
  const totalScans = Number(analytics?.totalScans ?? 0);
  const routedScans = Number(analytics?.routedScans ?? 0);
  const defaultScans = Number(analytics?.defaultScans ?? 0);

  const routedPercentage =
    totalScans > 0
      ? ((routedScans / totalScans) * 100).toFixed(1)
      : "0.0";

  const defaultPercentage =
    totalScans > 0
      ? ((defaultScans / totalScans) * 100).toFixed(1)
      : "0.0";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col bg-surface dark:bg-[#141414] border-border text-xs font-mono select-none"
      >
        <SheetHeader className="p-4 sm:p-6 border-b border-border bg-surface-elevated/40 dark:bg-[#171717] text-left">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
              <NxtqrIcon icon="solar:chart-2-bold" size={20} />
            </span>
            <div className="min-w-0">
              <SheetTitle className="text-base sm:text-lg font-bold text-foreground font-serif truncate">
                Routing Signal Telemetry
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Real-time scan distributions, branch efficiency, and fallback metrics.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* HIGH-LEVEL METRIC TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 sm:p-3.5 rounded-xl border border-border bg-surface-elevated/50 dark:bg-black/40 space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                Total Scans
              </span>
              <div className="text-lg font-bold text-foreground">
                {isLoading ? "…" : totalScans.toLocaleString()}
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl border border-border bg-surface-elevated/50 dark:bg-black/40 space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                Routed Matches
              </span>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {isLoading ? "…" : routedScans.toLocaleString()}
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {routedPercentage}% of total
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl border border-border bg-surface-elevated/50 dark:bg-black/40 space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                Default Fallthrough
              </span>
              <div className="text-lg font-bold text-foreground">
                {isLoading ? "…" : defaultScans.toLocaleString()}
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {defaultPercentage}% of total
              </span>
            </div>
          </div>

          {/* PER-RULE BREAKDOWN */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-muted-foreground">
              Rule Distribution Performance
            </span>

            {isLoading ? (
              <div className="space-y-2">
                <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
              </div>
            ) : !analytics?.ruleStats || analytics.ruleStats.length === 0 ? (
              <div className="p-8 rounded-xl border border-border/80 bg-surface-elevated/30 dark:bg-black/30 text-center text-muted-foreground space-y-1">
                <NxtqrIcon
                  icon="solar:chart-2-linear"
                  size={24}
                  className="mx-auto text-muted-foreground/40 mb-2"
                />
                <p className="text-xs font-semibold text-foreground">
                  No rule routing telemetry recorded yet.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Routing decisions will appear after this QR receives scans.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {analytics.ruleStats.map((stat, idx) => (
                  <div
                    key={stat.ruleId || idx}
                    className="p-3 sm:p-3.5 rounded-xl border border-border bg-surface-elevated/50 dark:bg-black/30 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20"
                        >
                          #{idx + 1}
                        </Badge>
                        <span className="font-semibold text-foreground">
                          {stat.ruleName}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      >
                        {Number(stat.routingSharePercentage ?? 0).toFixed(1)}% Share
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono truncate">
                      <span className="truncate flex-1">{stat.destinationUrl}</span>
                      <span className="shrink-0 font-semibold text-foreground ml-2">
                        {Number(stat.matchedScans ?? 0).toLocaleString()} matches
                      </span>
                    </div>

                    <Progress
                      value={Number(stat.routingSharePercentage ?? 0)}
                      className="h-1.5"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Infrastructure Info Footer */}
          <div className="p-3 rounded-xl bg-surface-elevated/40 dark:bg-black/40 border border-border text-[11px] text-muted-foreground leading-relaxed">
            Routing telemetry is processed non-blockingly at the edge, ensuring zero latency penalty on scanner redirection.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
