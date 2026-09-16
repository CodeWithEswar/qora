import * as React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowUpRight, Zap, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { GUARDIAN_STATUS } from "@/lib/mock-data/dashboard";

export function GuardianSummaryCard({ orgSlug }: { orgSlug: string }) {
  const { uptime, avgLatency, healthyCount, brokenCount, checkInterval } = GUARDIAN_STATUS;

  return (
    <Card className="col-span-full md:col-span-6 xl:col-span-4 flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Qora Guardian</CardTitle>
            <StatusBadge status="healthy" />
          </div>
          <CardDescription className="mt-0.5">
            Automated destination uptime & link health monitoring
          </CardDescription>
        </div>

        <Link
          href={`/${orgSlug}/guardian`}
          className="text-muted-foreground hover:text-primary transition-colors p-1"
          title="Open Qora Guardian"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-4 pt-1 flex-1 flex flex-col justify-between">
        {/* Metric tiles */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-border bg-surface-elevated/40 p-3">
            <span className="text-[11px] text-muted-foreground">Destination Uptime</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {uptime}
            </div>
            <span className="text-[10px] text-muted-foreground">Last 30 days</span>
          </div>

          <div className="rounded-lg border border-border bg-surface-elevated/40 p-3">
            <span className="text-[11px] text-muted-foreground">Avg Response</span>
            <div className="text-lg font-bold text-foreground tabular-nums mt-0.5">
              {avgLatency}
            </div>
            <span className="text-[10px] text-muted-foreground">Global edge ping</span>
          </div>
        </div>

        {/* Health status summary */}
        <div className="rounded-lg border border-border/80 bg-surface p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monitored Endpoints:</span>
            <span className="font-semibold text-foreground tabular-nums">
              {healthyCount} Active URLs
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Broken Links:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              0 Incidents
            </span>
          </div>
          <div className="flex items-center justify-between text-xs border-t border-border-subtle pt-2">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <RefreshCw className="h-3 w-3 text-muted-foreground" />
              Check frequency:
            </span>
            <span className="text-[11px] font-medium text-foreground">{checkInterval}</span>
          </div>
        </div>

        <Link
          href={`/${orgSlug}/guardian`}
          className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-hover transition-colors"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>View Health Incidents & Logs</span>
        </Link>
      </CardContent>
    </Card>
  );
}
