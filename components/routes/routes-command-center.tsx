"use client";

import * as React from "react";
import { RoutingRule } from "@nxtqr/contracts";
import { QrCode, Route, Play, BarChart3, Layers } from "lucide-react";
import { toast } from "sonner";

import {
  RoutingAssetItem,
  RoutingSummaryMetrics,
  RoutingViewTab,
  RoutingLayoutMode,
  RoutingFilterState,
} from "./types";
import { RoutesPageHeader } from "./routes-page-header";
import { RoutingSummaryStrip } from "./routing-summary-strip";
import { RoutingToolbar } from "./routing-toolbar";
import { RoutingAssetGrid } from "./assets/routing-asset-grid";
import { RoutingAssetList } from "./assets/routing-asset-list";
import { RoutingRulesTable } from "./rules/routing-rules-table";
import { RoutingAnalyticsView } from "./analytics/routing-analytics-view";
import { EdgeRoutingSimulator } from "./simulator/edge-routing-simulator";
import { RouteInspectorSheet } from "./inspectors/route-inspector-sheet";
import { QrRoutingInspectorSheet } from "./inspectors/qr-routing-inspector-sheet";
import { SelectQrBrainDialog } from "./dialogs/select-qr-brain-dialog";

interface RoutesCommandCenterProps {
  initialAssets: RoutingAssetItem[];
  orgSlug: string;
}

export function RoutesCommandCenter({
  initialAssets,
  orgSlug,
}: RoutesCommandCenterProps) {
  // Navigation tab
  const [activeTab, setActiveTab] = React.useState<RoutingViewTab>("assets");

  // Layout mode for QR Assets view
  const [layoutMode, setLayoutMode] = React.useState<RoutingLayoutMode>("grid");

  // Filters & Search
  const [filters, setFilters] = React.useState<RoutingFilterState>({
    searchQuery: "",
    status: "all",
    mode: "all",
    sort: "updated",
  });

  // Simulator target QR
  const [simulatorTargetQrId, setSimulatorTargetQrId] = React.useState<string>(
    initialAssets.length > 0 ? initialAssets[0].id : ""
  );

  // Inspector sheets state
  const [inspectedRule, setInspectedRule] = React.useState<RoutingRule | null>(
    null
  );
  const [inspectedRuleAsset, setInspectedRuleAsset] =
    React.useState<RoutingAssetItem | null>(null);
  const [ruleInspectorOpen, setRuleInspectorOpen] = React.useState(false);

  const [inspectedAsset, setInspectedAsset] =
    React.useState<RoutingAssetItem | null>(null);
  const [assetInspectorOpen, setAssetInspectorOpen] = React.useState(false);

  // Configure / Test dialog
  const [selectQrDialogOpen, setSelectQrDialogOpen] = React.useState(false);
  const [selectQrDialogMode, setSelectQrDialogMode] = React.useState<
    "configure" | "test"
  >("configure");

  // Summary instrumentation metrics (strictly truthful, computed from real assets)
  const metrics: RoutingSummaryMetrics = React.useMemo(() => {
    let totalRules = 0;
    const destSet = new Set<string>();
    let publishedCount = 0;

    for (const a of initialAssets) {
      totalRules += a.ruleCount || 0;
      if (a.defaultUrl) destSet.add(a.defaultUrl);
      if (a.fallbackUrl) destSet.add(a.fallbackUrl);
      for (const r of a.rules || []) {
        if (r.action?.destinationUrl) destSet.add(r.action.destinationUrl);
      }
      if (a.publishedRevision > 0 && a.status === "ACTIVE") {
        publishedCount++;
      }
    }

    return {
      totalDynamicQr: initialAssets.length,
      activeRules: totalRules,
      destinationsCount: destSet.size,
      publishedPolicies: publishedCount,
    };
  }, [initialAssets]);

  // Filtered & Sorted Assets
  const filteredAssets = React.useMemo(() => {
    let result = [...initialAssets];

    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          a.defaultUrl.toLowerCase().includes(q) ||
          (a.rules || []).some((r) => r.name.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter(
        (a) => a.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Mode filter
    if (filters.mode === "conditional") {
      result = result.filter((a) => a.ruleCount > 0);
    } else if (filters.mode === "default") {
      result = result.filter((a) => a.ruleCount === 0);
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rules":
          return b.ruleCount - a.ruleCount;
        case "slug":
          return a.slug.localeCompare(b.slug);
        case "updated":
        default:
          return (
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
          );
      }
    });

    return result;
  }, [initialAssets, filters]);

  const handleFilterChange = (newFilters: Partial<RoutingFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      status: "all",
      mode: "all",
      sort: "updated",
    });
  };

  // Jump to simulator for a specific asset
  const handleSelectForSimulator = (asset: RoutingAssetItem) => {
    setSimulatorTargetQrId(asset.id);
    setActiveTab("simulator");
    toast.info(`Loaded '${asset.name}' into Edge Simulator`);
  };

  // Trigger inspection sheets
  const handleInspectRule = (rule: RoutingRule, asset: RoutingAssetItem) => {
    setInspectedRule(rule);
    setInspectedRuleAsset(asset);
    setRuleInspectorOpen(true);
  };

  const handleInspectProfile = (asset: RoutingAssetItem) => {
    setInspectedAsset(asset);
    setAssetInspectorOpen(true);
  };

  // Export configuration as JSON
  const handleExportConfiguration = () => {
    const exportData = {
      organizationSlug: orgSlug,
      exportedAt: new Date().toISOString(),
      routingPolicies: initialAssets.map((a) => ({
        qrId: a.id,
        name: a.name,
        slug: a.slug,
        status: a.status,
        publishedRevision: a.publishedRevision,
        defaultUrl: a.defaultUrl,
        fallbackUrl: a.fallbackUrl,
        rules: a.rules,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nxtqr-routing-${orgSlug}-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Routing configuration exported successfully");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Page Header */}
      <RoutesPageHeader
        orgSlug={orgSlug}
        onOpenConfigureDialog={() => {
          setSelectQrDialogMode("configure");
          setSelectQrDialogOpen(true);
        }}
        onOpenTestRouteDialog={() => {
          setSelectQrDialogMode("test");
          setSelectQrDialogOpen(true);
        }}
        onExportConfiguration={handleExportConfiguration}
      />

      {/* 2. Routing Summary Strip */}
      <RoutingSummaryStrip metrics={metrics} />

      {/* 3. Primary Command Rail Navigation */}
      <div className="border-b border-border/80 pb-1 overflow-x-auto scrollbar-none">
        <nav
          aria-label="Routing Command Rail"
          className="flex items-center gap-1 min-w-max"
        >
          <button
            type="button"
            onClick={() => setActiveTab("assets")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "assets"
                ? "bg-[#FA520F]/10 text-[#FA520F] border border-[#FA520F]/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>QR Assets</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                activeTab === "assets"
                  ? "bg-[#FA520F]/20 text-[#FA520F]"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {initialAssets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "rules"
                ? "bg-[#FA520F]/10 text-[#FA520F] border border-[#FA520F]/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Routing Rules</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                activeTab === "rules"
                  ? "bg-[#FA520F]/20 text-[#FA520F]"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {metrics.activeRules}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "simulator"
                ? "bg-[#FA520F]/10 text-[#FA520F] border border-[#FA520F]/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Edge Simulator</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "analytics"
                ? "bg-[#FA520F]/10 text-[#FA520F] border border-[#FA520F]/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Routing Signal</span>
          </button>
        </nav>
      </div>

      {/* 4. Tab Views Content */}
      {activeTab === "assets" && (
        <div className="space-y-4">
          <RoutingToolbar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            layoutMode={layoutMode}
            onLayoutModeChange={setLayoutMode}
            totalAssetsCount={initialAssets.length}
            filteredAssetsCount={filteredAssets.length}
          />

          {layoutMode === "grid" ? (
            <RoutingAssetGrid
              assets={filteredAssets}
              totalAssetsCount={initialAssets.length}
              orgSlug={orgSlug}
              onResetFilters={handleResetFilters}
              onSelectForSimulator={handleSelectForSimulator}
              onInspectProfile={handleInspectProfile}
            />
          ) : (
            <RoutingAssetList
              assets={filteredAssets}
              orgSlug={orgSlug}
              onSelectForSimulator={handleSelectForSimulator}
              onInspectProfile={handleInspectProfile}
            />
          )}
        </div>
      )}

      {activeTab === "rules" && (
        <RoutingRulesTable
          assets={initialAssets}
          orgSlug={orgSlug}
          onInspectRule={handleInspectRule}
        />
      )}

      {activeTab === "simulator" && (
        <EdgeRoutingSimulator
          assets={initialAssets}
          selectedAssetId={simulatorTargetQrId}
          onInspectRule={handleInspectRule}
          orgSlug={orgSlug}
        />
      )}

      {activeTab === "analytics" && (
        <RoutingAnalyticsView assets={initialAssets} />
      )}

      {/* 5. Inspectors & Modals */}
      <RouteInspectorSheet
        open={ruleInspectorOpen}
        onOpenChange={setRuleInspectorOpen}
        rule={inspectedRule}
        qrAsset={inspectedRuleAsset}
        orgSlug={orgSlug}
      />

      <QrRoutingInspectorSheet
        open={assetInspectorOpen}
        onOpenChange={setAssetInspectorOpen}
        asset={inspectedAsset}
        orgSlug={orgSlug}
        onSelectForSimulator={handleSelectForSimulator}
      />

      <SelectQrBrainDialog
        open={selectQrDialogOpen}
        onOpenChange={setSelectQrDialogOpen}
        assets={initialAssets}
        orgSlug={orgSlug}
        mode={selectQrDialogMode}
        onSelectForSimulator={handleSelectForSimulator}
      />
    </div>
  );
}
