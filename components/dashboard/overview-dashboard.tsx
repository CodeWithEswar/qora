"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Download, Sparkles } from "lucide-react";
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
import { SunsetStripe } from "@/components/shared/sunset-stripe";

interface OverviewDashboardProps {
  orgSlug: string;
}

export function OverviewDashboard({ orgSlug }: OverviewDashboardProps) {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header with Greeting & Action Slots */}
      <PageHeader
        title="Good afternoon, Alex"
        description="Workspace overview, real-time routing telemetry, and recent QR performance across all channels."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0c2] dark:bg-[#383024] px-3 py-0.5 text-xs font-semibold text-[#1f1f1f] dark:text-[#ffedd5] border border-[#e6d5a8] dark:border-[#4a4031]">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Live Telemetry Active
          </span>
        }
        actions={
          <>
            <Button variant="secondary" size="sm" className="gap-2 text-xs">
              <Download className="h-3.5 w-3.5" />
              <span>Export Report</span>
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

      {/* Secondary Insights Row: Top QR Table (8 cols) + Qora Guardian Card (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <TopQRTable orgSlug={orgSlug} />
        <GuardianSummaryCard orgSlug={orgSlug} />
      </div>

      {/* Tertiary Insights Row: Geographic Breakdown (4 cols) + Recent Activity Feed (4 cols) + Qora Brain Card (4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        <TopLocations />
        <RecentActivity orgSlug={orgSlug} />

        {/* Qora Brain Card on Warm Cream Surface (card-cream) */}
        <Card variant="cream" className="col-span-full md:col-span-12 xl:col-span-4 p-6 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5 fill-primary" />
                Qora Brain Routing
              </span>
              <span className="text-[10px] bg-primary text-white px-2.5 py-0.5 rounded-full font-semibold">
                Autonomous
              </span>
            </div>
            <h3 className="font-display text-xl font-normal tracking-tight text-foreground leading-tight">
              Dynamic Destination Routing
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Serving tailored destinations based on visitor device, geo-location, and operating system without reprinting physical codes.
            </p>

            <div className="rounded-md border border-[#e6d5a8] dark:border-[#383024] bg-white/70 dark:bg-black/30 p-3.5 text-xs space-y-1.5 my-2">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-muted-foreground">Active rules:</span>
                <span className="font-semibold text-foreground">6 condition sets</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-muted-foreground">Routed scans:</span>
                <span className="font-semibold text-primary tabular-nums">41,890 (28.2%)</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-muted-foreground">Fallback rate:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">1.4% (Optimal)</span>
              </div>
            </div>
          </div>

          <Button variant="cream" size="sm" asChild className="w-full text-xs mt-3">
            <Link href={`/${orgSlug}/brain`}>
              Open Rule Builder & Routing Paths →
            </Link>
          </Button>
        </Card>
      </div>

      {/* Signature Sunset Stripe closing section */}
      <div className="pt-6">
        <SunsetStripe height="sm" />
      </div>
    </div>
  );
}
