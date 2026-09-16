import * as React from "react";
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { GUARDIAN_STATUS, TOP_QR_CODES } from "@/lib/mock-data/dashboard";

export default async function GuardianPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        breadcrumbs={[
          { label: "Acme Corp", href: `/${orgSlug}` },
          { label: "Qora Guardian" },
        ]}
        title="Qora Guardian Link Health"
        description="Autonomous uptime and broken link detection across all published QR code endpoints."
        badge={
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            42 of 42 Endpoints Healthy
          </span>
        }
        actions={
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Run Health Check</span>
          </Button>
        }
      />

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Destination Uptime"
          value={GUARDIAN_STATUS.uptime}
          change={0.02}
          comparison="99.98% SLA maintained"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg Edge Latency"
          value={GUARDIAN_STATUS.avgLatency}
          comparison="Global CDN routing"
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          title="Broken Links Detected"
          value={GUARDIAN_STATUS.brokenCount}
          comparison="Zero HTTP 404/500 errors"
          icon={<AlertCircle className="h-4 w-4 text-emerald-500" />}
        />
        <MetricCard
          title="Resolved Incidents"
          value="12"
          comparison="Auto-recovered in past 90d"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      {/* Destination Endpoints Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Monitored Destinations</h3>
            <p className="text-xs text-muted-foreground">Every endpoint pinged every 5 minutes from 12 global regions</p>
          </div>
          <span className="text-xs text-muted-foreground font-mono">Last check: 2m ago</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-2.5 pl-5 pr-3">QR Code</th>
                <th className="px-3 py-2.5">Destination URL</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Latency</th>
                <th className="px-3 py-2.5">HTTP Code</th>
                <th className="py-2.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {TOP_QR_CODES.map((qr) => (
                <tr key={qr.id} className="hover:bg-surface-hover/60 transition-colors">
                  <td className="py-3 pl-5 pr-3 font-medium text-foreground">{qr.name}</td>
                  <td className="px-3 py-3 font-mono text-[11px] text-muted-foreground max-w-xs truncate">
                    {qr.destination}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status="healthy" />
                  </td>
                  <td className="px-3 py-3 tabular-nums font-medium text-foreground">138ms</td>
                  <td className="px-3 py-3">
                    <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      200 OK
                    </span>
                  </td>
                  <td className="py-3 pl-3 pr-5 text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
