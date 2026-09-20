"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CampaignResponseV1,
  CampaignQrAssetV1,
  CampaignConstellationNodeV1,
  CampaignAnalyticsV1,
} from "@nxtqr/contracts";
import { CampaignDetailHeader } from "./campaign-detail-header";
import { CampaignPulse } from "./campaign-pulse";
import { CampaignMap } from "./campaign-map";
import { CampaignPerformance } from "./campaign-performance";
import { CampaignQrList } from "./campaign-qr-list";
import { CampaignRoutingSummary } from "./campaign-routing-summary";
import { CampaignDestinationMap, DestinationTopologyNode } from "./campaign-destination-map";
import { CampaignActivity, CampaignActivityItem } from "./campaign-activity";
import { EditCampaignDialog } from "./edit-campaign-dialog";
import { ArchiveCampaignAlert } from "./dialogs/archive-campaign-alert";
import { DeleteCampaignAlert } from "./dialogs/delete-campaign-alert";
import { RemoveQrAlert } from "./dialogs/remove-qr-alert";
import { AddQrSheet } from "./add-qr-sheet";
import { QrInspectorSheet } from "./inspectors/qr-inspector-sheet";
import { DestinationInspectorSheet } from "./inspectors/destination-inspector-sheet";
import { CampaignInspectorSheet } from "./inspectors/campaign-inspector-sheet";

export interface CampaignDetailViewProps {
  orgSlug: string;
  campaignId: string;
  initialCampaign: CampaignResponseV1;
  initialQrAssets: CampaignQrAssetV1[];
  initialConstellationNodes: CampaignConstellationNodeV1[];
  initialAnalytics: CampaignAnalyticsV1;
  initialDestinations: DestinationTopologyNode[];
  initialRoutingSummary: {
    defaultRoutesCount: number;
    conditionalRulesCount: number;
    monitoredCount: number;
  };
  initialActivity: CampaignActivityItem[];
}

export function CampaignDetailView({
  orgSlug,
  campaignId,
  initialCampaign,
  initialQrAssets,
  initialAnalytics,
  initialDestinations,
  initialRoutingSummary,
  initialActivity,
}: CampaignDetailViewProps) {
  const router = useRouter();

  const [campaign, setCampaign] = React.useState<CampaignResponseV1>(initialCampaign);
  const [qrAssets, setQrAssets] = React.useState<CampaignQrAssetV1[]>(initialQrAssets);
  const [analytics, setAnalytics] = React.useState<CampaignAnalyticsV1>(initialAnalytics);
  const [selectedPeriod, setSelectedPeriod] = React.useState<"7d" | "30d" | "90d" | "all">("30d");
  const [destinations] = React.useState<DestinationTopologyNode[]>(initialDestinations);
  const [routingSummary] = React.useState(initialRoutingSummary);
  const [activity] = React.useState<CampaignActivityItem[]>(initialActivity);

  const [activeTab, setActiveTab] = React.useState<string>("overview");

  // Dialog / Sheet states
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [archiveAlertOpen, setArchiveAlertOpen] = React.useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
  const [addQrSheetOpen, setAddQrSheetOpen] = React.useState(false);
  const [removingQr, setRemovingQr] = React.useState<CampaignQrAssetV1 | null>(null);

  // Inspector States
  const [selectedQrForInspect, setSelectedQrForInspect] = React.useState<CampaignQrAssetV1 | null>(null);
  const [selectedDestForInspect, setSelectedDestForInspect] = React.useState<DestinationTopologyNode | null>(null);
  const [campaignInspectorOpen, setCampaignInspectorOpen] = React.useState(false);

  // Period change fetch
  const handlePeriodChange = async (period: "7d" | "30d" | "90d" | "all") => {
    setSelectedPeriod(period);
    try {
      const res = await fetch(`/api/v1/campaigns/${campaignId}/analytics?period=${period}`, {
        headers: { "x-organization-slug": orgSlug },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error("Failed to load analytics for period:", err);
    }
  };

  // Refetch QRs after add/remove
  const refreshQrAssets = async () => {
    try {
      const res = await fetch(`/api/v1/campaigns/${campaignId}/qrs`, {
        headers: { "x-organization-slug": orgSlug },
      });
      if (res.ok) {
        const data = await res.json();
        const rawItems: CampaignQrAssetV1[] = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data?.items)
          ? data.data.items
          : [];
        setQrAssets(rawItems);
        setCampaign((prev) => ({ ...prev, qrCount: rawItems.length }));
      }
    } catch (err) {
      console.error("Failed to refresh campaign QR assets:", err);
    }
  };

  // QR remove handler
  const handleQrRemoved = (qrId: string) => {
    setQrAssets((prev) => prev.filter((q) => q.id !== qrId));
    setCampaign((prev) => ({
      ...prev,
      qrCount: Math.max(0, prev.qrCount - 1),
    }));
    if (selectedQrForInspect?.id === qrId) {
      setSelectedQrForInspect(null);
    }
  };

  // Pulse section click handler
  const handlePulseClick = (sectionId: string) => {
    if (sectionId === "qrs") setActiveTab("qrs");
    else if (sectionId === "routing" || sectionId === "destinations") setActiveTab("routing");
    else if (sectionId === "analytics") setActiveTab("analytics");
    else if (sectionId === "activity") setActiveTab("activity");
    else setActiveTab("overview");
  };

  const routesTotal = routingSummary.defaultRoutesCount + routingSummary.conditionalRulesCount;

  return (
    <div className="space-y-6 pb-16 max-w-[1600px] mx-auto">
      {/* 1. Campaign Identity Header */}
      <CampaignDetailHeader
        campaign={campaign}
        orgSlug={orgSlug}
        onEdit={() => setEditDialogOpen(true)}
        onAddQrs={() => setAddQrSheetOpen(true)}
        onArchive={() => setArchiveAlertOpen(true)}
        onDelete={() => setDeleteAlertOpen(true)}
        onInspectCampaign={() => setCampaignInspectorOpen(true)}
      />

      {/* 2. Signature Operational Campaign Pulse Strip */}
      <CampaignPulse
        qrCount={campaign.qrCount}
        routesCount={routesTotal > 0 ? routesTotal : (qrAssets.length > 0 ? 1 : 0)}
        destinationCount={destinations.length > 0 ? destinations.length : (qrAssets.length > 0 ? 1 : 0)}
        totalScans={campaign.totalScans}
        lastActivityAt={activity.length > 0 ? activity[0].createdAt : campaign.updatedAt}
        activeSection={activeTab}
        onSectionClick={handlePulseClick}
      />

      {/* 3. Adaptive Signature Campaign Map */}
      <CampaignMap
        campaign={campaign}
        qrAssets={qrAssets}
        destinations={destinations}
        routesCount={routesTotal > 0 ? routesTotal : (qrAssets.length > 0 ? 1 : 0)}
        orgSlug={orgSlug}
        onSelectQr={(qr) => setSelectedQrForInspect(qr)}
        onSelectDestination={(dest) => setSelectedDestForInspect(dest)}
        onSelectCampaign={() => setCampaignInspectorOpen(true)}
        onSelectRouting={() => setActiveTab("routing")}
        onAddQrs={() => setAddQrSheetOpen(true)}
      />

      {/* 4. Tabbed Operational Panels */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-surface border border-border/80 p-1 w-full sm:w-auto flex items-center justify-start overflow-x-auto no-scrollbar h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs px-3 sm:px-3.5 py-1.5 shrink-0">
            Overview
          </TabsTrigger>
          <TabsTrigger value="qrs" className="text-xs px-3 sm:px-3.5 py-1.5 gap-1.5 shrink-0">
            <span>QR Assets</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground">
              {campaign.qrCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs px-3 sm:px-3.5 py-1.5 shrink-0">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="routing" className="text-xs px-3 sm:px-3.5 py-1.5 shrink-0">
            Routing
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs px-3 sm:px-3.5 py-1.5 shrink-0">
            Activity
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 m-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CampaignPerformance
                analytics={analytics}
                selectedPeriod={selectedPeriod}
                onPeriodChange={handlePeriodChange}
                orgSlug={orgSlug}
              />
              <CampaignQrList
                items={qrAssets}
                orgSlug={orgSlug}
                onAddQrs={() => setAddQrSheetOpen(true)}
                onRemoveQr={(qr) => setRemovingQr(qr)}
                onInspectQr={(qr) => setSelectedQrForInspect(qr)}
              />
            </div>

            <div className="space-y-6">
              <CampaignRoutingSummary
                defaultRoutesCount={routingSummary.defaultRoutesCount}
                conditionalRulesCount={routingSummary.conditionalRulesCount}
                monitoredCount={routingSummary.monitoredCount}
              />
              <CampaignDestinationMap
                destinations={destinations}
                onSelectDestination={(dest) => setSelectedDestForInspect(dest)}
              />
            </div>
          </div>
        </TabsContent>

        {/* QR ASSETS TAB */}
        <TabsContent value="qrs" className="m-0">
          <CampaignQrList
            items={qrAssets}
            orgSlug={orgSlug}
            onAddQrs={() => setAddQrSheetOpen(true)}
            onRemoveQr={(qr) => setRemovingQr(qr)}
            onInspectQr={(qr) => setSelectedQrForInspect(qr)}
          />
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6 m-0">
          <CampaignPerformance
            analytics={analytics}
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            orgSlug={orgSlug}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CampaignDestinationMap
              destinations={destinations}
              onSelectDestination={(dest) => setSelectedDestForInspect(dest)}
            />
            <CampaignRoutingSummary
              defaultRoutesCount={routingSummary.defaultRoutesCount}
              conditionalRulesCount={routingSummary.conditionalRulesCount}
              monitoredCount={routingSummary.monitoredCount}
            />
          </div>
        </TabsContent>

        {/* ROUTING TAB */}
        <TabsContent value="routing" className="space-y-6 m-0">
          <CampaignRoutingSummary
            defaultRoutesCount={routingSummary.defaultRoutesCount}
            conditionalRulesCount={routingSummary.conditionalRulesCount}
            monitoredCount={routingSummary.monitoredCount}
            layout="grid"
          />
          <CampaignDestinationMap
            destinations={destinations}
            onSelectDestination={(dest) => setSelectedDestForInspect(dest)}
          />
        </TabsContent>

        {/* ACTIVITY TAB */}
        <TabsContent value="activity" className="m-0">
          <CampaignActivity items={activity} />
        </TabsContent>
      </Tabs>

      {/* Inspector Sheets */}
      <QrInspectorSheet
        open={Boolean(selectedQrForInspect)}
        onOpenChange={(open) => !open && setSelectedQrForInspect(null)}
        qr={selectedQrForInspect}
        orgSlug={orgSlug}
        campaignName={campaign.name}
        onRemove={() => {
          if (selectedQrForInspect) {
            setRemovingQr(selectedQrForInspect);
            setSelectedQrForInspect(null);
          }
        }}
      />

      <DestinationInspectorSheet
        open={Boolean(selectedDestForInspect)}
        onOpenChange={(open) => !open && setSelectedDestForInspect(null)}
        destination={selectedDestForInspect}
        qrAssets={qrAssets}
        orgSlug={orgSlug}
      />

      <CampaignInspectorSheet
        open={campaignInspectorOpen}
        onOpenChange={setCampaignInspectorOpen}
        campaign={campaign}
        orgSlug={orgSlug}
        onEdit={() => setEditDialogOpen(true)}
        onAddQrs={() => setAddQrSheetOpen(true)}
        onViewActivity={() => setActiveTab("activity")}
      />

      {/* Operational Dialogs & Alerts */}
      <EditCampaignDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        campaign={campaign}
        orgSlug={orgSlug}
        onUpdated={(updated) => setCampaign(updated)}
      />

      <ArchiveCampaignAlert
        open={archiveAlertOpen}
        onOpenChange={setArchiveAlertOpen}
        campaign={campaign}
        orgSlug={orgSlug}
        onArchived={(archived) => setCampaign(archived)}
      />

      <DeleteCampaignAlert
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        campaign={campaign}
        orgSlug={orgSlug}
        onDeleted={() => router.push(`/${orgSlug}/campaigns`)}
      />

      <AddQrSheet
        open={addQrSheetOpen}
        onOpenChange={setAddQrSheetOpen}
        campaignId={campaignId}
        campaignName={campaign.name}
        orgSlug={orgSlug}
        onAdded={() => refreshQrAssets()}
      />

      <RemoveQrAlert
        open={Boolean(removingQr)}
        onOpenChange={(open) => !open && setRemovingQr(null)}
        qrAsset={removingQr}
        campaignId={campaignId}
        campaignName={campaign.name}
        orgSlug={orgSlug}
        onRemoved={handleQrRemoved}
      />
    </div>
  );
}
