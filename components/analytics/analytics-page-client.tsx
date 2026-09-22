"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { OrganizationAnalyticsDTO, ReportJobRecord } from "@/lib/supabase/repositories/analytics";
import { AnalyticsHeader } from "./analytics-header";
import { AnalyticsNav, AnalyticsTab } from "./analytics-nav";
import { AnalyticsFilterBar } from "./analytics-filter-bar";
import { AnalyticsFilterDrawer } from "./analytics-filter-drawer";
import { SignalStrip } from "./instruments/signal-strip";
import { ScanAtlas } from "./atlas/scan-atlas";
import { GeographicSignal } from "./atlas/geographic-signal";
import { RecentSignalStream } from "./atlas/recent-signal-stream";
import { SignalRiver } from "./activity/signal-river";
import { ScanVelocity } from "./activity/scan-velocity";
import { DeviceOrbit } from "./devices/device-orbit";
import { DestinationFlow } from "./destinations/destination-flow";
import { DestinationSignalBoard } from "./destinations/destination-signal-board";
import { RoutingDecisionField } from "./routing/routing-decision-field";
import { TemporalMatrix } from "./time/temporal-matrix";
import { TrafficQualitySpectrum } from "./quality/traffic-quality-spectrum";
import { ConversionJourney } from "./conversion/conversion-journey";
import { ExperimentSplitField } from "./experiments/experiment-split-field";
import { QrPerformanceLedger } from "./ledger/qr-performance-ledger";
import { SignalInspector, InspectorDatum } from "./inspector/signal-inspector";
import { ReportTable } from "./reports/report-table";
import { ExportDialog } from "./reports/export-dialog";
import { AnalyticsDormantState } from "./shared/analytics-dormant-state";
import { AnalyticsErrorState } from "./shared/analytics-error-state";
import { AnalyticsSkeleton } from "./shared/analytics-skeleton";
import { toast } from "sonner";

interface AnalyticsPageClientProps {
  orgSlug: string;
  initialData: OrganizationAnalyticsDTO;
  initialReports?: ReportJobRecord[];
}

export function AnalyticsPageClient({
  orgSlug,
  initialData,
  initialReports = [],
}: AnalyticsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State derived from URL query params (Zero localStorage!)
  const range = (searchParams.get("range") || "30d") as "24h" | "7d" | "30d" | "90d";
  const activeTab = (searchParams.get("tab") || "overview") as AnalyticsTab;
  const countryFilter = searchParams.get("country") || undefined;
  const deviceFilter = searchParams.get("device") || undefined;
  const qrFilter = searchParams.get("qrId") || undefined;
  const ruleFilter = searchParams.get("ruleId") || undefined;
  const qualityFilter = searchParams.get("trafficQuality") || undefined;

  // Active data & state
  const [data, setData] = React.useState<OrganizationAnalyticsDTO>(initialData);
  const [reports, setReports] = React.useState<ReportJobRecord[]>(initialReports);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  // Dialogs & drawers
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [inspectorOpen, setInspectorOpen] = React.useState(false);
  const [inspectorDatum, setInspectorDatum] = React.useState<InspectorDatum | null>(null);

  // Synchronize URL helper
  const updateUrlParams = React.useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === undefined || val === "") {
          current.delete(key);
        } else {
          current.set(key, val);
        }
      });
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Fetch updated analytics whenever URL filter params change
  const fetchAnalytics = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = searchParams.toString();
      const res = await fetch(`/api/v1/organizations/${orgSlug}/analytics${query ? `?${query}` : ""}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error?.message || "Failed to load telemetry");
      }
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (err: any) {
      console.error("[AnalyticsPageClient] Fetch error:", err);
      setError(err.message || "Could not retrieve analytics.");
    } finally {
      setIsLoading(false);
    }
  }, [orgSlug, searchParams]);

  // Track if searchParams changed after mount
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Quick CSV download
  const handleQuickExportCsv = async () => {
    setIsExporting(true);
    try {
      const query = searchParams.toString();
      window.location.href = `/api/v1/organizations/${orgSlug}/analytics/export?${query}`;
      toast.success("CSV export initiated");
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch report jobs list
  const fetchReports = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/analytics/export?action=list_reports`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) setReports(json.data);
      }
    } catch {}
  }, [orgSlug]);

  // Handlers for cross-filtering
  const handleSelectCountry = (countryCode: string) => {
    if (!countryCode) {
      updateUrlParams({ country: null });
      return;
    }
    const point = data.geography.find((g) => g.countryCode === countryCode);
    setInspectorDatum({
      type: "country",
      id: countryCode,
      name: point?.countryName || countryCode,
      scans: point?.scans,
      share: point?.percentage,
      topQr: point?.topDestination,
    });
    setInspectorOpen(true);
  };

  const handleSelectDevice = (dev: string) => {
    const devItem = data.devices.deviceClasses.find((d) => d.name.toLowerCase() === dev.toLowerCase());
    setInspectorDatum({
      type: "device",
      id: dev,
      name: dev,
      scans: devItem?.value,
      share: devItem?.percentage,
    });
    setInspectorOpen(true);
  };

  const handleSelectRule = (ruleId: string) => {
    const ruleItem = data.routing.rules.find((r) => r.ruleId === ruleId);
    setInspectorDatum({
      type: "rule",
      id: ruleId,
      name: ruleItem?.ruleName || "Routing Rule",
      scans: ruleItem?.scansRouted,
      share: ruleItem?.sharePercentage,
      destinationUrl: ruleItem?.destinationUrl,
    });
    setInspectorOpen(true);
  };

  const handleSelectDestination = (url: string) => {
    const destItem = data.destinationFlow.topDestinations.find((d) => d.url === url);
    setInspectorDatum({
      type: "destination",
      id: url,
      name: destItem?.domain || url,
      scans: destItem?.scans,
      share: destItem?.sharePercentage,
      destinationUrl: url,
    });
    setInspectorOpen(true);
  };

  const handleApplyInspectorFilter = (type: string, id: string) => {
    if (type === "country") updateUrlParams({ country: id });
    else if (type === "device") updateUrlParams({ device: id });
    else if (type === "rule") updateUrlParams({ ruleId: id });
    else if (type === "qr") updateUrlParams({ qrId: id });
    toast.success(`Filtered dashboard by ${id}`);
  };

  // Active filter chips calculation
  const filterChips = React.useMemo(() => {
    const chips = [];
    if (countryFilter) chips.push({ key: "country", label: "Country", value: countryFilter });
    if (deviceFilter) chips.push({ key: "device", label: "Device", value: deviceFilter });
    if (qrFilter) {
      const qrName = data.filtersAvailable.qrs.find((q) => q.id === qrFilter)?.name || qrFilter;
      chips.push({ key: "qrId", label: "QR Code", value: qrName });
    }
    if (ruleFilter) chips.push({ key: "ruleId", label: "Route Rule", value: ruleFilter });
    if (qualityFilter) chips.push({ key: "trafficQuality", label: "Quality", value: qualityFilter });
    return chips;
  }, [countryFilter, deviceFilter, qrFilter, ruleFilter, qualityFilter, data.filtersAvailable.qrs]);

  const hasActiveFilters = filterChips.length > 0;
  const isWorkspaceDormant = data.totals.totalScans === 0 && !hasActiveFilters;

  return (
    <div className="space-y-6 mb-12 font-sans">
      {/* 01. Analytics Header */}
      <AnalyticsHeader
        orgSlug={orgSlug}
        range={range}
        onRangeChange={(r) => updateUrlParams({ range: r })}
        onOpenFilterDrawer={() => setFilterDrawerOpen(true)}
        activeFilterCount={filterChips.length}
        onOpenExportDialog={() => setExportDialogOpen(true)}
        onQuickExportCsv={handleQuickExportCsv}
        isExporting={isExporting}
      />

      {/* 02. Analytics Navigation Rail */}
      <AnalyticsNav
        activeTab={activeTab}
        onTabChange={(t) => updateUrlParams({ tab: t })}
      />

      {/* 02b. Active Filter Chips */}
      {hasActiveFilters && (
        <AnalyticsFilterBar
          chips={filterChips}
          onRemoveChip={(key) => updateUrlParams({ [key]: null })}
          onClearAll={() =>
            updateUrlParams({
              country: null,
              device: null,
              qrId: null,
              ruleId: null,
              trafficQuality: null,
            })
          }
        />
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <AnalyticsSkeleton />
      ) : error ? (
        <AnalyticsErrorState message={error} onRetry={fetchAnalytics} />
      ) : (
        <>
          {/* 03. Signal Strip / 4 KPI Instruments */}
          <SignalStrip data={data} />

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {isWorkspaceDormant ? (
                <AnalyticsDormantState orgSlug={orgSlug} />
              ) : (
                <>
                  {/* Row 1: Global Scan Field (8 cols) + Geographic Signal (4 cols) */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <ScanAtlas
                      data={data.geography}
                      selectedCountry={countryFilter}
                      onSelectCountry={handleSelectCountry}
                      className="col-span-full xl:col-span-8"
                    />
                    <GeographicSignal
                      data={data.geography}
                      selectedCountry={countryFilter}
                      onSelectCountry={handleSelectCountry}
                      className="col-span-full xl:col-span-4"
                    />
                  </div>

                  {/* Row 2: Signal River (8 cols) + Device Orbit (4 cols) */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <SignalRiver
                      series={data.series}
                      rangeKey={data.range.key}
                      className="col-span-full xl:col-span-8"
                    />
                    <DeviceOrbit
                      deviceClasses={data.devices.deviceClasses}
                      operatingSystems={data.devices.operatingSystems}
                      browsers={data.devices.browsers}
                      totalScans={data.totals.totalScans}
                      selectedDevice={deviceFilter}
                      onSelectDevice={handleSelectDevice}
                      className="col-span-full xl:col-span-4"
                    />
                  </div>

                  {/* Row 3: Destination Flow (7 cols) + Routing Decision Field (5 cols) */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <DestinationFlow
                      nodes={data.destinationFlow.nodes}
                      links={data.destinationFlow.links}
                      className="col-span-full xl:col-span-7"
                    />
                    <RoutingDecisionField
                      rules={data.routing.rules}
                      defaultScans={data.routing.defaultScans}
                      fallbackScans={data.routing.fallbackScans}
                      totalScans={data.totals.totalScans}
                      orgSlug={orgSlug}
                      onSelectRule={handleSelectRule}
                      className="col-span-full xl:col-span-5"
                    />
                  </div>

                  {/* Row 4: Temporal Matrix (7 cols) + Traffic Quality Spectrum (5 cols) */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <TemporalMatrix
                      cells={data.temporalMatrix}
                      timezone={data.range.timezone}
                      className="col-span-full xl:col-span-7"
                    />
                    <TrafficQualitySpectrum
                      data={data.trafficQuality}
                      className="col-span-full xl:col-span-5"
                    />
                  </div>

                  {/* Row 5: Conversion Journey */}
                  <ConversionJourney data={data.conversionJourney} />

                  {/* Row 6: QR Performance Ledger (7 cols) + Recent Scan Signals (5 cols) */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <QrPerformanceLedger
                      assets={data.topQrAssets}
                      orgSlug={orgSlug}
                      onSelectQr={(qId) => updateUrlParams({ qrId: qId })}
                      className="col-span-full xl:col-span-7"
                    />
                    <RecentSignalStream
                      signals={data.recentSignals}
                      className="col-span-full xl:col-span-5"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: PERFORMANCE */}
          {activeTab === "performance" && (
            <div className="space-y-6">
              <SignalRiver series={data.series} rangeKey={data.range.key} />
              <ScanVelocity velocity={data.velocity} />
            </div>
          )}

          {/* TAB 3: GEOGRAPHY */}
          {activeTab === "geography" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <ScanAtlas
                data={data.geography}
                selectedCountry={countryFilter}
                onSelectCountry={handleSelectCountry}
                className="col-span-full xl:col-span-8"
              />
              <GeographicSignal
                data={data.geography}
                selectedCountry={countryFilter}
                onSelectCountry={handleSelectCountry}
                className="col-span-full xl:col-span-4"
              />
            </div>
          )}

          {/* TAB 4: DEVICES */}
          {activeTab === "devices" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <DeviceOrbit
                deviceClasses={data.devices.deviceClasses}
                operatingSystems={data.devices.operatingSystems}
                browsers={data.devices.browsers}
                totalScans={data.totals.totalScans}
                selectedDevice={deviceFilter}
                onSelectDevice={handleSelectDevice}
                className="col-span-full xl:col-span-6"
              />
              <div className="col-span-full xl:col-span-6 space-y-6">
                <TrafficQualitySpectrum data={data.trafficQuality} />
              </div>
            </div>
          )}

          {/* TAB 5: TIME DISTRIBUTION */}
          {activeTab === "time" && (
            <div className="space-y-6">
              <TemporalMatrix cells={data.temporalMatrix} timezone={data.range.timezone} />
              <ScanVelocity velocity={data.velocity} />
            </div>
          )}

          {/* TAB 6: ROUTING */}
          {activeTab === "routing" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <DestinationFlow
                nodes={data.destinationFlow.nodes}
                links={data.destinationFlow.links}
                className="col-span-full xl:col-span-7"
              />
              <RoutingDecisionField
                rules={data.routing.rules}
                defaultScans={data.routing.defaultScans}
                fallbackScans={data.routing.fallbackScans}
                totalScans={data.totals.totalScans}
                orgSlug={orgSlug}
                onSelectRule={handleSelectRule}
                className="col-span-full xl:col-span-5"
              />
              <DestinationSignalBoard
                destinations={data.destinationFlow.topDestinations}
                onSelectDestination={handleSelectDestination}
                className="col-span-full"
              />
            </div>
          )}

          {/* TAB 7: EXPERIMENTS */}
          {activeTab === "experiments" && (
            <ExperimentSplitField experiments={data.experiments} orgSlug={orgSlug} />
          )}

          {/* TAB 8: TRAFFIC QUALITY */}
          {activeTab === "trafficQuality" && (
            <div className="space-y-6">
              <TrafficQualitySpectrum data={data.trafficQuality} />
            </div>
          )}

          {/* TAB 9: REPORTS */}
          {activeTab === "reports" && (
            <ReportTable
              reports={reports}
              orgSlug={orgSlug}
              onRefresh={fetchReports}
              onOpenExportDialog={() => setExportDialogOpen(true)}
            />
          )}
        </>
      )}

      {/* Filter Drawer / Sheet */}
      <AnalyticsFilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        availableCountries={data.filtersAvailable.countries}
        availableDevices={data.filtersAvailable.devices}
        availableQrs={data.filtersAvailable.qrs}
        currentFilters={{
          country: countryFilter,
          device: deviceFilter,
          qrId: qrFilter,
          trafficQuality: qualityFilter,
        }}
        onApplyFilters={(filters) => updateUrlParams(filters)}
        onResetFilters={() =>
          updateUrlParams({
            country: null,
            device: null,
            qrId: null,
            ruleId: null,
            trafficQuality: null,
          })
        }
      />

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        orgSlug={orgSlug}
        onExportCreated={fetchReports}
      />

      {/* Signal Inspector Sheet */}
      <SignalInspector
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        datum={inspectorDatum}
        rangeLabel={data.range.key.toUpperCase()}
        onFilterDashboard={handleApplyInspectorFilter}
        isFiltered={
          Boolean(countryFilter) ||
          Boolean(deviceFilter) ||
          Boolean(ruleFilter) ||
          Boolean(qrFilter)
        }
        onClearFilter={() =>
          updateUrlParams({
            country: null,
            device: null,
            qrId: null,
            ruleId: null,
            trafficQuality: null,
          })
        }
      />
    </div>
  );
}
