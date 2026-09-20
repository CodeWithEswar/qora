"use client";

import * as React from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Route,
  Activity,
  History,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { VersionHistoryPanel } from "./version-history-panel";
import { StoredQrVersion } from "@/lib/domains/qr-store";

interface DynamicQrTabsProps {
  orgSlug: string;
  qrId: string;
  totalScans: number;
  uniqueScans: number;
  publishedRevision: number;
  routingRuleCount: number;
  versions: StoredQrVersion[];
  onRestoreVersion: (versionId: string) => Promise<void>;
}

export function DynamicQrTabs({
  orgSlug,
  qrId,
  totalScans,
  uniqueScans,
  publishedRevision,
  routingRuleCount,
  versions,
  onRestoreVersion,
}: DynamicQrTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full mt-4">
      <TabsList className="bg-muted/60 p-1 border border-border/60 rounded-xl">
        <TabsTrigger value="overview" className="text-xs font-medium gap-1.5 rounded-lg">
          <Layers className="w-3.5 h-3.5" />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger value="routing" className="text-xs font-medium gap-1.5 rounded-lg">
          <Route className="w-3.5 h-3.5" />
          <span>Routing Rules</span>
          {routingRuleCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5">
              {routingRuleCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="versions" className="text-xs font-medium gap-1.5 rounded-lg">
          <History className="w-3.5 h-3.5" />
          <span>Versions</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5">
            {versions.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="text-xs font-medium gap-1.5 rounded-lg">
          <Activity className="w-3.5 h-3.5" />
          <span>Scan Signal</span>
        </TabsTrigger>
      </TabsList>

      {/* 1. OVERVIEW TAB */}
      <TabsContent value="overview" className="mt-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Routing Summary Card */}
          <div className="p-5 rounded-2xl border border-border bg-card/60 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold text-muted-foreground">
                    Routing Engine
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {routingRuleCount > 0 ? `${routingRuleCount} Rules Active` : "Default Only"}
                </Badge>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  {routingRuleCount > 0
                    ? `Scans evaluate conditional rules (device, location, time window) before falling through to the default destination.`
                    : `All scans currently resolve directly to the primary default destination without conditional branching.`}
                </p>

                <div className="p-3 rounded-xl bg-background/80 border border-border/60 flex items-center justify-between font-mono text-[11px] mt-3">
                  <span className="text-muted-foreground">Default Fallthrough:</span>
                  <span className="font-semibold text-foreground">Enabled</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border/50">
              <Button asChild variant="outline" size="sm" className="w-full text-xs gap-1.5">
                <Link href={`/${orgSlug}/qr/${qrId}/brain`}>
                  <span>Manage in QR Brain</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Scan Signal Mini Panel */}
          <div className="p-5 rounded-2xl border border-border bg-card/60 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold text-muted-foreground">
                    Scan Telemetry
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Last 30 Days</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-background/80 border border-border/60">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Total Scans
                  </div>
                  <div className="text-2xl font-bold font-mono text-foreground mt-1">
                    {totalScans.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-background/80 border border-border/60">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Unique Scanners
                  </div>
                  <div className="text-2xl font-bold font-mono text-foreground mt-1">
                    {uniqueScans.toLocaleString()}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground mt-3">
                Scans are processed asynchronously with sub-second zero-block latency.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-border/50">
              <Button asChild variant="outline" size="sm" className="w-full text-xs gap-1.5">
                <Link href={`/${orgSlug}/analytics`}>
                  <span>Open Full Analytics</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* 2. ROUTING RULES TAB */}
      <TabsContent value="routing" className="mt-4 space-y-4">
        <div className="p-6 rounded-2xl border border-border bg-card/60 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Intelligent Routing Policy</h3>
              <p className="text-xs text-muted-foreground">
                Evaluated deterministically in high-speed edge runtime via routing engine.
              </p>
            </div>
            <Button asChild size="sm" className="text-xs gap-1.5">
              <Link href={`/${orgSlug}/qr/${qrId}/brain`}>
                <Route className="w-3.5 h-3.5" />
                <span>Configure in QR Brain</span>
              </Link>
            </Button>
          </div>

          <div className="py-6 text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-primary mx-auto opacity-75" />
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Dynamic QRs support multi-branch conditional routing by device OS (iOS/Android), geocoding (country/region), and time windows with automatic overnight interval handling.
            </p>
          </div>
        </div>
      </TabsContent>

      {/* 3. VERSIONS TAB */}
      <TabsContent value="versions" className="mt-4">
        <VersionHistoryPanel
          versions={versions}
          currentPublishedRevision={publishedRevision}
          onRestoreVersion={onRestoreVersion}
        />
      </TabsContent>

      {/* 4. ANALYTICS TAB */}
      <TabsContent value="analytics" className="mt-4 space-y-4">
        <div className="p-6 rounded-2xl border border-border bg-card/60 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Scan Telemetry & Ingestion</h3>
              <p className="text-xs text-muted-foreground">
                Anonymized client telemetry captured non-blockingly via durable event pipeline.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="text-xs gap-1.5">
              <Link href={`/${orgSlug}/analytics`}>
                <span>Analytics Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-background/80 border border-border/60">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Total Scans Recorded
              </div>
              <div className="text-3xl font-mono font-bold text-foreground mt-1">
                {totalScans.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-background/80 border border-border/60">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Unique Scanner IPs
              </div>
              <div className="text-3xl font-mono font-bold text-foreground mt-1">
                {uniqueScans.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-background/80 border border-border/60">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Telemetry Queue
              </div>
              <div className="text-base font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active (Zero Block)</span>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
