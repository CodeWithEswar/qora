"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { DynamicQrHeader } from "./dynamic-qr-header";
import { QrIdentityPanel } from "./qr-identity-panel";
import { ResolutionPipeline } from "./resolution-pipeline";
import { DestinationPanel } from "./destination-panel";
import { ScanPerformance, ScanTimeseriesPoint } from "./scan-performance";
import { RoutingSummary, RoutingRuleSummaryItem } from "./routing-summary";
import { RecentActivity, QrActivityEventItem } from "./recent-activity";
import { VersionHistoryPanel } from "./version-history-panel";
import { UnpublishedDiffBanner } from "./unpublished-diff-banner";
import { EditDestinationDialog } from "./edit-destination-dialog";
import { PublishChangesDialog } from "./publish-changes-dialog";
import { ResolverInspectorSheet } from "./resolver-inspector-sheet";
import { TestResolutionSheet } from "./test-resolution-sheet";
import { PauseQrDialog } from "./pause-qr-dialog";
import { DeleteQrDialog } from "./delete-qr-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoredQrRecord, StoredQrVersion } from "@/lib/domains/qr-store";
import { buildShortResolverUrl } from "@nxtqr/config";

export interface DynamicQrControlSurfaceProps {
  orgSlug: string;
  qr: StoredQrRecord;
  versions: StoredQrVersion[];
  host: string;
  routingRuleCount?: number;
  routingRules?: RoutingRuleSummaryItem[];
  totalScans?: number;
  estimatedUniqueScans?: number;
  timeseries?: ScanTimeseriesPoint[];
  topDevice?: string;
  topCountry?: string;
  activityEvents?: QrActivityEventItem[];
  fallbackUrl?: string;
}

export function DynamicQrControlSurface({
  orgSlug,
  qr: initialQr,
  versions: initialVersions,
  host,
  routingRuleCount = 0,
  routingRules = [],
  totalScans = 0,
  estimatedUniqueScans = 0,
  timeseries = [],
  topDevice,
  topCountry,
  activityEvents = [],
  fallbackUrl,
}: DynamicQrControlSurfaceProps) {
  const router = useRouter();

  // Local React memory while page is active (Compliant with Rule 7)
  const [qr, setQr] = React.useState<StoredQrRecord>(initialQr);
  const [versions, setVersions] = React.useState<StoredQrVersion[]>(initialVersions);
  const [draftDestination, setDraftDestination] = React.useState<string>(
    initialQr.draftDestination || initialQr.destinationUrl || ""
  );
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = React.useState<boolean>(
    Boolean(initialQr.hasUnpublishedChanges)
  );

  // Active subnavigation tab
  const [activeTab, setActiveTab] = React.useState<string>("overview");

  // Dialog & sheet states
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isPublishOpen, setIsPublishOpen] = React.useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = React.useState(false);
  const [isTestScanOpen, setIsTestScanOpen] = React.useState(false);
  const [isPauseOpen, setIsPauseOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  const resolverUrl = buildShortResolverUrl(qr.slug, host);

  // 1. Save Destination as Draft to Cloudflare D1
  const handleSaveDraft = async (newDestination: string) => {
    try {
      const res = await fetch(`/api/v1/qrs/${qr.id}/destination`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationUrl: newDestination }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error?.message || "Could not save destination draft"
        );
      }

      setDraftDestination(newDestination);
      const isDifferent = newDestination !== qr.destinationUrl;
      setHasUnpublishedChanges(isDifferent);

      toast.success("Destination saved as draft", {
        description: isDifferent
          ? "Click 'Publish changes' to deploy to live edge resolvers."
          : "Matches current published destination.",
      });
    } catch (err: unknown) {
      toast.error("Couldn’t save destination", {
        description: (err as Error).message || "Failed to update draft.",
      });
      throw err;
    }
  };

  // 2. Publish Changes to Cloudflare D1 + KV Edge Snapshot
  const handleConfirmPublish = async (changeSummary: string) => {
    try {
      setIsPublishing(true);
      const res = await fetch(`/api/v1/qrs/${qr.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedVersion: qr.publishedRevision || 1,
          changeSummary,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error?.message || "Publication to edge failed");
      }

      const data = await res.json();
      const updatedRevision = data.meta?.revision || (qr.publishedRevision || 1) + 1;

      // Update state locally with authoritative response
      setQr((prev) => ({
        ...prev,
        destinationUrl: draftDestination,
        publishedRevision: updatedRevision,
        status: "ACTIVE",
        updatedAt: Math.floor(Date.now() / 1000),
      }));
      setHasUnpublishedChanges(false);

      // Re-fetch versions to include new immutable checkpoint from D1
      try {
        const verRes = await fetch(`/api/v1/qrs/${qr.id}/versions`);
        if (verRes.ok) {
          const verData = await verRes.json();
          if (verData.data) {
            setVersions(verData.data);
          }
        }
      } catch {}

      toast.success("Changes published", {
        description: `Revision ${updatedRevision} compiled and deployed to global edge resolvers.`,
      });

      router.refresh();
    } catch (err: unknown) {
      toast.error("Couldn’t publish changes", {
        description: (err as Error).message || "Publication transaction failed.",
      });
      throw err;
    } finally {
      setIsPublishing(false);
    }
  };

  // 3. Restore Historical Version as Draft
  const handleRestoreVersion = async (versionId: string) => {
    try {
      const res = await fetch(`/api/v1/qrs/${qr.id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error?.message || "Could not restore version");
      }

      const data = await res.json();
      const restoredDraft = data.data?.draftDestination || "";
      setDraftDestination(restoredDraft);
      setHasUnpublishedChanges(restoredDraft !== qr.destinationUrl);

      toast.success("Revision restored as draft", {
        description: "Review your restored draft and publish to make it live at the edge.",
      });
    } catch (err: unknown) {
      toast.error("Couldn’t restore revision", {
        description: (err as Error).message || "Version restoration failed.",
      });
      throw err;
    }
  };

  // 4. Toggle Pause / Resume Lifecycle
  const handleTogglePause = async () => {
    const isCurrentlyPaused = qr.status === "PAUSED";
    const nextAction = isCurrentlyPaused ? "RESUME" : "PAUSE";

    try {
      const res = await fetch(`/api/v1/qrs/${qr.id}/lifecycle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextAction }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error?.message || `Failed to ${nextAction.toLowerCase()} QR`);
      }

      const newStatus: StoredQrRecord["status"] = isCurrentlyPaused ? "ACTIVE" : "PAUSED";
      setQr((prev) => ({ ...prev, status: newStatus }));

      toast.success(isCurrentlyPaused ? "QR resumed" : "QR paused", {
        description: isCurrentlyPaused
          ? "Redirects are now active across global edge network."
          : "Future scans will receive the configured paused response.",
      });

      router.refresh();
    } catch (err: unknown) {
      toast.error(isCurrentlyPaused ? "Couldn’t resume QR" : "Couldn’t pause QR", {
        description: (err as Error).message || "Lifecycle operation failed.",
      });
      throw err;
    }
  };

  // 5. Delete / Archive QR
  const handleDeleteQr = async () => {
    try {
      const res = await fetch(`/api/v1/qrs/${qr.id}/lifecycle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ARCHIVE" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error?.message || "Failed to archive QR");
      }

      toast.success("QR archived", {
        description: "Edge snapshot deactivated. Scans will return 410 Gone.",
      });

      router.push(`/${orgSlug}/qr`);
    } catch (err: unknown) {
      toast.error("Couldn’t archive QR", {
        description: (err as Error).message || "Archive operation failed.",
      });
      throw err;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 px-4 sm:px-6 lg:px-8">
      {/* 1. Header with Breadcrumbs, Identity, Status, and Action Toolbar */}
      <DynamicQrHeader
        orgSlug={orgSlug}
        qrId={qr.id}
        qrName={qr.name}
        slug={qr.slug}
        host={host}
        status={qr.status}
        publishedRevision={qr.publishedRevision || 1}
        hasUnpublishedChanges={hasUnpublishedChanges}
        onTestScan={() => setIsTestScanOpen(true)}
        onInspectResolver={() => setIsInspectorOpen(true)}
        onEditDestination={() => setIsEditOpen(true)}
        onPublishClick={() => setIsPublishOpen(true)}
        onTogglePause={() => setIsPauseOpen(true)}
        onDeleteClick={() => setIsDeleteOpen(true)}
        isPublishing={isPublishing}
      />

      {/* 2. Subnavigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent p-0 border-b border-border/70 w-full justify-start rounded-none h-auto gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <TabsTrigger
            value="overview"
            className="h-10 px-3.5 text-xs font-medium gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all"
          >
            <Icon icon="hugeicons:dashboard-square-01" className="w-3.5 h-3.5" />
            <span>Overview</span>
          </TabsTrigger>

          <TabsTrigger
            value="routing"
            className="h-10 px-3.5 text-xs font-medium gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all"
          >
            <Icon icon="hugeicons:route-01" className="w-3.5 h-3.5" />
            <span>Routing Rules</span>
            {routingRuleCount > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono ml-0.5">
                {routingRuleCount}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="analytics"
            className="h-10 px-3.5 text-xs font-medium gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all"
          >
            <Icon icon="hugeicons:analytics-01" className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </TabsTrigger>

          <TabsTrigger
            value="versions"
            className="h-10 px-3.5 text-xs font-medium gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all"
          >
            <Icon icon="hugeicons:clock-01" className="w-3.5 h-3.5" />
            <span>Versions</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono ml-0.5">
              {versions.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="signal"
            className="h-10 px-3.5 text-xs font-medium gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-all"
          >
            <Icon icon="hugeicons:wifi-01" className="w-3.5 h-3.5" />
            <span>Scan Signal</span>
          </TabsTrigger>
        </TabsList>

        {/* 3. OVERVIEW TAB — THE SIGNATURE PRODUCT CONTROL SURFACE */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Unpublished Draft Banner (Shown only when draft !== published) */}
          {hasUnpublishedChanges && (
            <UnpublishedDiffBanner
              publishedDestination={qr.destinationUrl}
              draftDestination={draftDestination}
              onReviewChanges={() => setIsPublishOpen(true)}
              onPublishDirect={() =>
                handleConfirmPublish(`Published revision ${(qr.publishedRevision || 1) + 1}`)
              }
              isPublishing={isPublishing}
            />
          )}

          {/* Hero Grid (3 connected functional zones: 30% / 38% / 32%) */}
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.15fr_1fr] gap-5 items-stretch">
            {/* Left: QR Identity Panel */}
            <QrIdentityPanel
              slug={qr.slug}
              host={host}
              qrName={qr.name}
              orgSlug={orgSlug}
              qrId={qr.id}
              design={qr.design}
            />

            {/* Center: Signature Resolution Pipeline */}
            <ResolutionPipeline
              slug={qr.slug}
              publishedRevision={qr.publishedRevision || 1}
              publishedDestination={qr.destinationUrl}
              draftDestination={draftDestination}
              hasUnpublishedChanges={hasUnpublishedChanges}
              routingRuleCount={routingRuleCount}
              status={qr.status}
            />

            {/* Right: Destination Panel */}
            <DestinationPanel
              publishedDestination={qr.destinationUrl}
              draftDestination={draftDestination}
              hasUnpublishedChanges={hasUnpublishedChanges}
              publishedRevision={qr.publishedRevision || 1}
              updatedAt={new Date(qr.updatedAt * 1000).toISOString()}
              fallbackUrl={fallbackUrl}
              routingRuleCount={routingRuleCount}
              onEditDestination={() => setIsEditOpen(true)}
              onReviewChanges={() => setIsPublishOpen(true)}
            />
          </div>

          {/* Secondary Grid: Scan Performance (2fr) + Connected Right Stack (1fr) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-5 items-start">
            {/* Left: Scan Performance with authentic time-series chart */}
            <ScanPerformance
              qrId={qr.id}
              orgSlug={orgSlug}
              totalScans={totalScans}
              estimatedUniqueScans={estimatedUniqueScans}
              timeseries={timeseries}
              topDevice={topDevice}
              topCountry={topCountry}
            />

            {/* Right: Connected Routing Engine & Recent Activity */}
            <div className="flex flex-col gap-5">
              <RoutingSummary
                orgSlug={orgSlug}
                qrId={qr.id}
                routingRuleCount={routingRuleCount}
                rules={routingRules}
                defaultDestination={qr.destinationUrl}
              />

              <RecentActivity items={activityEvents} orgSlug={orgSlug} />
            </div>
          </div>
        </TabsContent>

        {/* 4. ROUTING RULES TAB */}
        <TabsContent value="routing" className="mt-6 space-y-6">
          <div className="p-6 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Icon icon="hugeicons:route-01" className="w-4 h-4 text-primary" />
                  <span>Intelligent Routing Policy</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Evaluated deterministically in high-speed edge runtime via routing engine.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTestScanOpen(true)}
                  className="h-8 text-xs gap-1.5"
                >
                  <Icon icon="hugeicons:play" className="w-3.5 h-3.5 text-primary" />
                  <span>Test Resolution</span>
                </Button>

                <Button asChild size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href={`/${orgSlug}/qr/${qr.id}/brain`}>
                    <span>Manage in QR Brain</span>
                    <Icon icon="hugeicons:arrow-up-right-01" className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Routing summary & rules preview */}
            <RoutingSummary
              orgSlug={orgSlug}
              qrId={qr.id}
              routingRuleCount={routingRuleCount}
              rules={routingRules}
              defaultDestination={qr.destinationUrl}
            />
          </div>
        </TabsContent>

        {/* 5. ANALYTICS TAB */}
        <TabsContent value="analytics" className="mt-6 space-y-6">
          <ScanPerformance
            qrId={qr.id}
            orgSlug={orgSlug}
            totalScans={totalScans}
            estimatedUniqueScans={estimatedUniqueScans}
            timeseries={timeseries}
            topDevice={topDevice}
            topCountry={topCountry}
          />
        </TabsContent>

        {/* 6. VERSIONS TAB */}
        <TabsContent value="versions" className="mt-6 space-y-6">
          <VersionHistoryPanel
            versions={versions}
            currentPublishedRevision={qr.publishedRevision || 1}
            onRestoreVersion={handleRestoreVersion}
          />
        </TabsContent>

        {/* 7. SCAN SIGNAL TAB */}
        <TabsContent value="signal" className="mt-6 space-y-6">
          <div className="p-6 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Icon icon="hugeicons:wifi-01" className="w-4 h-4 text-primary" />
                  <span>Global Edge Resolution Architecture</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  How scans are resolved at edge locations and ingested asynchronously into telemetry pipelines.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInspectorOpen(true)}
                className="h-8 text-xs gap-1.5"
              >
                <Icon icon="hugeicons:terminal" className="w-3.5 h-3.5 text-primary" />
                <span>Inspect Resolver</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border/70 bg-surface-elevated/40 space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  01 Edge Cache
                </div>
                <div className="text-xs font-bold text-foreground">Edge Resolver Cache</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Published routing configurations compile into immutable JSON snapshots distributed across 330+ global edge locations.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/70 bg-surface-elevated/40 space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  02 Asynchronous Telemetry
                </div>
                <div className="text-xs font-bold text-foreground">High-Throughput Queue</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Scan events are dispatched to high-throughput message queues without blocking redirection execution.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/70 bg-surface-elevated/40 space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  03 Authoritative State
                </div>
                <div className="text-xs font-bold text-foreground">Authoritative Core</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Relational source of truth for QR ownership, draft edits, routing policies, and version history checkpoints.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 8. Interactive Dialogs & Sheets */}
      <EditDestinationDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        currentDestination={draftDestination || qr.destinationUrl}
        onSaveDraft={handleSaveDraft}
        resolverUrl={resolverUrl}
      />

      <PublishChangesDialog
        open={isPublishOpen}
        onOpenChange={setIsPublishOpen}
        publishedDestination={qr.destinationUrl}
        draftDestination={draftDestination}
        publishedRevision={qr.publishedRevision || 1}
        onConfirmPublish={handleConfirmPublish}
      />

      <ResolverInspectorSheet
        open={isInspectorOpen}
        onOpenChange={setIsInspectorOpen}
        slug={qr.slug}
        host={host}
        publishedRevision={qr.publishedRevision || 1}
        publishedDestination={qr.destinationUrl}
        routingRuleCount={routingRuleCount}
        status={qr.status}
      />

      <TestResolutionSheet
        open={isTestScanOpen}
        onOpenChange={setIsTestScanOpen}
        qrId={qr.id}
        slug={qr.slug}
        defaultDestination={qr.destinationUrl}
        routingRuleCount={routingRuleCount}
      />

      <PauseQrDialog
        open={isPauseOpen}
        onOpenChange={setIsPauseOpen}
        qrName={qr.name}
        slug={qr.slug}
        isPaused={qr.status === "PAUSED"}
        onConfirm={handleTogglePause}
      />

      <DeleteQrDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        qrName={qr.name}
        slug={qr.slug}
        onConfirm={handleDeleteQr}
      />
    </div>
  );
}
