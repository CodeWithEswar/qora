"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, BarChart3, CheckCircle2, GitFork } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { ScanActivityChart } from "@/components/dashboard/scan-activity-chart";
import { DeviceBreakdownChart } from "@/components/dashboard/device-breakdown-chart";
import { TopQRTable } from "@/components/dashboard/top-qr-table";
import { TopLocations } from "@/components/dashboard/top-locations";
import { GuardianSummaryCard } from "@/components/dashboard/guardian-summary-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { NytraPixelSpectrum } from "@/components/shared/nytra-pixel-spectrum";
import { BRAND } from "@/lib/brand";

interface OverviewDashboardProps {
  orgSlug: string;
}

export function OverviewDashboard({ orgSlug }: OverviewDashboardProps) {
  const [userName, setUserName] = React.useState<string>("");

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user?.name) {
          const firstName = data.user.name.split(" ")[0];
          setUserName(firstName);
        }
      })
      .catch(() => {});
  }, []);

  const greeting = userName ? `Good morning, ${userName}` : "Workspace Overview";

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header with Official NXTQR Copy & System Health Section */}
      <PageHeader
        title={greeting}
        description={`Here's what's happening across your ${BRAND.name} workspace.`}
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            All systems healthy
          </span>
        }
        actions={
          <>
            <Button variant="secondary" size="sm" asChild className="gap-2 text-xs">
              <Link href={`/${orgSlug}/analytics`}>
                <BarChart3 className="h-3.5 w-3.5" />
                <span>View Analytics</span>
              </Link>
            </Button>
            <Button size="sm" asChild className="gap-2 text-xs bg-primary hover:bg-[#cc3a05] text-white">
              <Link href={`/${orgSlug}/qr/studio`}>
                <Plus className="h-3.5 w-3.5" />
                <span>Create QR</span>
              </Link>
            </Button>
          </>
        }
      />

      {/* KPI Metric Cards */}
      <KPIRow />

      {/* Main Analytics Row: Scan Activity (8 cols) + Device Donut (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <ScanActivityChart />
        <DeviceBreakdownChart />
      </div>

      {/* Secondary Insights Row: Top QR Table (8 cols) + NXTQR Guardian Card (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <TopQRTable orgSlug={orgSlug} />
        <GuardianSummaryCard orgSlug={orgSlug} />
      </div>

      {/* Tertiary Insights Row: Geographic Breakdown (4 cols) + Recent Activity Feed (4 cols) + NXTQR Routes Card (4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        <TopLocations />
        <RecentActivity orgSlug={orgSlug} />

        {/* NXTQR Routes Card on Warm Cream Surface */}
        <Card variant="cream" className="col-span-full md:col-span-12 xl:col-span-4 p-6 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <GitFork className="h-3.5 w-3.5 text-primary" />
                {BRAND.products.routes.name}
              </span>
              <span className="text-[10px] bg-primary text-white px-2.5 py-0.5 rounded-full font-semibold">
                Smart Engine
              </span>
            </div>
            <h3 className="font-display text-xl font-normal tracking-tight text-foreground leading-tight">
              Route every scan to the right destination.
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dynamically route visitors based on device, geo-location, operating system, and time rules without reprinting QR assets.
            </p>

            <div className="rounded-md border border-[#e6d5a8] dark:border-[#383024] bg-white/70 dark:bg-black/30 p-3.5 text-xs space-y-1.5 my-2">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-muted-foreground">Active rules:</span>
                <span className="font-semibold text-foreground">0 condition sets</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-muted-foreground">Routed scans:</span>
                <span className="font-semibold text-primary tabular-nums">0 (0.0%)</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-muted-foreground">Fallback rate:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">0.0% (Optimal)</span>
              </div>
            </div>
          </div>

          <Button variant="cream" size="sm" asChild className="w-full text-xs mt-3">
            <Link href={`/${orgSlug}/routes`}>
              Open Routing Paths & Rule Builder →
            </Link>
          </Button>
        </Card>
      </div>

      {/* Signature NYTRA Pixel Spectrum closing bar */}
      <div className="pt-6">
        <NytraPixelSpectrum height="sm" />
      </div>
    </div>
  );
}
