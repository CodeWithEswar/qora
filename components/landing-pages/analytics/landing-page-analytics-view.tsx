"use client";

import React from "react";
import Link from "next/link";
import type { LandingPageRecord } from "@nxtqr/contracts";
import { QrEmptyMonogram } from "@/components/empty-state/qr-empty-monogram";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface AnalyticsPayload {
  views: number;
  actions: number;
  conversions: number;
  actionBreakdown: Array<{ actionId: string; actionType: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  recentEvents: Array<{
    id: string;
    eventType: string;
    actionType?: string;
    deviceType?: string;
    createdAt: string;
  }>;
}

interface LandingPageAnalyticsViewProps {
  page: LandingPageRecord;
  analytics: AnalyticsPayload;
  orgSlug: string;
}

export function LandingPageAnalyticsView({
  page,
  analytics,
  orgSlug,
}: LandingPageAnalyticsViewProps) {
  const hasSignal = analytics.views > 0 || analytics.actions > 0 || analytics.recentEvents.length > 0;
  const conversionRate =
    analytics.views > 0
      ? ((analytics.actions / analytics.views) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
            <Link href={`/${orgSlug}/landing-pages`} className="hover:text-foreground transition-colors">
              Landing Pages
            </Link>
            <span>/</span>
            <Link href={`/${orgSlug}/landing-pages/${page.id}`} className="hover:text-foreground transition-colors truncate max-w-[200px]">
              {page.name}
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Analytics</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Destination Performance
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real visitor scans, page impressions, and conversion actions for /p/{page.slug}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
            <Link href={`/${orgSlug}/landing-pages/${page.id}`}>
              <NxtqrIcon icon="solar:eye-linear" size={14} />
              <span>Destination Trace</span>
            </Link>
          </Button>

          <Button asChild size="sm" className="h-9 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold">
            <Link href={`/${orgSlug}/landing-pages/${page.id}/edit`}>
              <NxtqrIcon icon="solar:pen-bold" size={14} />
              <span>Edit in Studio</span>
            </Link>
          </Button>
        </div>
      </div>

      {!hasSignal ? (
        /* Analytics Empty State: Monogram L */
        <div className="min-h-[420px] rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <QrEmptyMonogram letter="L" size="lg" />
          </div>

          <h2 className="text-xl font-bold text-foreground">No destination signal yet</h2>
          <p className="text-xs text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
            Activity will appear after visitors begin opening this landing page via QR scan or direct link.
          </p>

          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href={`/${orgSlug}/landing-pages/${page.id}`}>
                Connect QR Codes
              </Link>
            </Button>

            {page.status === "published" && (
              <Button asChild size="sm" className="text-xs">
                <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer">
                  Open Destination Test
                </a>
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Real Telemetry Surface */
        <div className="space-y-8">
          {/* 1. Distinct Semantics KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-border/60 bg-card">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>PAGE VIEWS</span>
                <NxtqrIcon icon="solar:eye-bold" size={16} className="text-blue-500" />
              </div>
              <div className="mt-2 text-2xl font-extrabold text-foreground">
                {analytics.views.toLocaleString()}
              </div>
              <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">
                Visitor impressions
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-border/60 bg-card">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>CTA ACTIONS</span>
                <NxtqrIcon icon="solar:cursor-square-bold" size={16} className="text-purple-500" />
              </div>
              <div className="mt-2 text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                {analytics.actions.toLocaleString()}
              </div>
              <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">
                Link &amp; button clicks
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-border/60 bg-card">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>CONVERSIONS</span>
                <NxtqrIcon icon="solar:check-circle-bold" size={16} className="text-emerald-500" />
              </div>
              <div className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {analytics.conversions.toLocaleString()}
              </div>
              <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">
                Downstream goal completions
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-border/60 bg-card">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>CONVERSION RATE</span>
                <NxtqrIcon icon="solar:chart-2-bold" size={16} className="text-[#FA520F]" />
              </div>
              <div className="mt-2 text-2xl font-extrabold text-foreground">
                {conversionRate}%
              </div>
              <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">
                Actions per page view
              </span>
            </div>
          </div>

          {/* 2. Action Breakdown & Device Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Action Breakdown */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="font-bold text-sm text-foreground">Action Breakdown</h3>
                <p className="text-xs text-muted-foreground">Which buttons and links generated engagements.</p>
              </div>

              {analytics.actionBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No CTA interactions recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {analytics.actionBreakdown.map((item) => (
                    <div key={item.actionId} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <NxtqrIcon icon="solar:cursor-linear" size={14} className="text-primary" />
                        <span className="text-xs font-semibold text-foreground">{item.actionId}</span>
                        <Badge variant="outline" className="text-[9px] uppercase font-mono">
                          {item.actionType}
                        </Badge>
                      </div>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {item.count} clicks
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Device Distribution */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="font-bold text-sm text-foreground">Device Distribution</h3>
                <p className="text-xs text-muted-foreground">Hardware viewport mix opening this destination.</p>
              </div>

              {analytics.deviceBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No device data available.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {analytics.deviceBreakdown.map((dev) => (
                    <div key={dev.device} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <NxtqrIcon
                          icon={
                            dev.device === "mobile"
                              ? "solar:smartphone-linear"
                              : dev.device === "tablet"
                              ? "solar:tablet-linear"
                              : "solar:laptop-linear"
                          }
                          size={15}
                          className="text-muted-foreground"
                        />
                        <span className="text-xs font-semibold capitalize text-foreground">
                          {dev.device}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {dev.count} events
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Live Telemetry Event Stream */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
            <div className="border-b border-border/40 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Recent Event Stream</h3>
                <p className="text-xs text-muted-foreground">Last 15 real visitor interactions.</p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                LIVE TELEMETRY
              </Badge>
            </div>

            <div className="divide-y divide-border/40 font-mono text-xs">
              {analytics.recentEvents.map((e) => (
                <div key={e.id} className="py-2.5 flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        e.eventType === "view"
                          ? "bg-blue-500"
                          : e.eventType === "action_click"
                          ? "bg-purple-500"
                          : "bg-emerald-500"
                      )}
                    />
                    <span className="font-semibold text-foreground uppercase text-[11px]">
                      {e.eventType.replace("_", " ")}
                    </span>
                    {e.actionType && (
                      <span className="text-[10px] text-muted-foreground">({e.actionType})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="capitalize">{e.deviceType || "mobile"}</span>
                    <span>•</span>
                    <span>{new Date(e.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
