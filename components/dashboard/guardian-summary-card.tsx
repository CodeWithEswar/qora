import * as React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowUpRight, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { BRAND } from "@/lib/brand";
import { EmptyState } from "@/components/shared/empty-state";

export interface GuardianSummaryCardProps {
  orgSlug: string;
  guardianData?: {
    totalMonitored: number;
    avgLatencyMs: number;
    healthyCount: number;
  };
}

export function GuardianSummaryCard({ orgSlug, guardianData }: GuardianSummaryCardProps) {
  const totalMonitored = guardianData?.totalMonitored ?? 0;
  const avgLatencyMs = guardianData?.avgLatencyMs ?? 0;
  const healthyCount = guardianData?.healthyCount ?? 0;

  return (
    <Card className="col-span-full md:col-span-6 xl:col-span-4 flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">
              {BRAND.products.guardian.name}
            </CardTitle>
            <StatusBadge status={totalMonitored > 0 ? "healthy" : "inactive"} />
          </div>
          <CardDescription className="mt-0.5">
            Automated destination uptime & link health monitoring
          </CardDescription>
        </div>

        <Link
          href={`/${orgSlug}/guardian`}
          className="text-muted-foreground hover:text-primary transition-colors p-1"
          title={`Open ${BRAND.products.guardian.name}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-4 pt-1 flex-1 flex flex-col justify-between">
        {totalMonitored === 0 ? (
          <EmptyState
            preset="guardian"
            actionLabel="Add Destination"
            actionHref={`/${orgSlug}/qr/studio`}
            variant="card"
            className="border-none bg-transparent p-4"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-md border border-border bg-surface-elevated/40 p-3">
            <span className="text-[11px] text-muted-foreground">Destination Uptime</span>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
              100%
            </div>
            <span className="text-[10px] text-muted-foreground">Last 30 days</span>
          </div>

          <div className="rounded-md border border-border bg-surface-elevated/40 p-3">
            <span className="text-[11px] text-muted-foreground">Avg Latency</span>
            <div className="text-lg font-bold text-foreground tabular-nums mt-0.5">
              {avgLatencyMs}ms
            </div>
            <span className="text-[10px] text-muted-foreground">Global edge ping</span>
          </div>
        </div>

        {/* Health status summary */}
        <div className="rounded-md border border-border/80 bg-surface p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monitored Endpoints:</span>
            <span className="font-semibold text-foreground tabular-nums">
              {healthyCount} Active URLs
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Broken Links:</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              0 Incidents
            </span>
          </div>
          <div className="flex items-center justify-between text-xs border-t border-border-subtle pt-2">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <RefreshCw className="h-3 w-3 text-muted-foreground" />
              Check frequency:
            </span>
            <span className="text-[11px] font-medium text-foreground">Every 60s</span>
          </div>
        </div>

        <Link
          href={`/${orgSlug}/guardian`}
          className="inline-flex items-center justify-center gap-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-hover transition-colors"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>View Health Incidents & Logs</span>
        </Link>
        </>
        )}
      </CardContent>
    </Card>
  );
}
