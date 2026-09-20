"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  GuardianMonitorSummaryV1,
  GuardianPulseMetricsV1,
  GuardianIncidentDetailV1,
} from "@nxtqr/contracts";
import { GuardianHeader } from "./guardian-header";
import { GuardianPulse } from "./guardian-pulse";
import { GuardianHealthRail } from "./guardian-health-rail";
import { GuardianNavTabs, GuardianTab } from "./guardian-nav-tabs";
import { DestinationHealthMatrix } from "./destination-health-matrix";
import { HealthRibbon } from "./health-ribbon";
import { IncidentTimeline } from "./incident-timeline";
import { RecoveryPath } from "./recovery-path";
import { MonitorsRegistry } from "./monitors-registry";
import { AddMonitorDialog } from "./dialogs/add-monitor-dialog";
import { ConfigureFallbackDialog } from "./dialogs/configure-fallback-dialog";
import { MonitorInspectorSheet } from "./inspector/monitor-inspector-sheet";
import { IncidentInspectorSheet } from "./inspector/incident-inspector-sheet";
import { GuardianSettingsSheet } from "./dialogs/guardian-settings-sheet";
import { GuardianError } from "./states/guardian-error";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GuardianPageClientProps {
  orgSlug: string;
  initialMonitors: GuardianMonitorSummaryV1[];
  initialPulse: GuardianPulseMetricsV1;
  initialIncidents: GuardianIncidentDetailV1[];
}

export function GuardianPageClient({
  orgSlug,
  initialMonitors,
  initialPulse,
  initialIncidents,
}: GuardianPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Core Data State
  const [monitors, setMonitors] = React.useState<GuardianMonitorSummaryV1[]>(initialMonitors);
  const [pulse, setPulse] = React.useState<GuardianPulseMetricsV1>(initialPulse);
  const [incidents, setIncidents] = React.useState<GuardianIncidentDetailV1[]>(initialIncidents);
  const [hasError, setHasError] = React.useState(false);

  // Tab & Filter State
  const [activeTab, setActiveTab] = React.useState<GuardianTab>("overview");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [healthFilter, setHealthFilter] = React.useState<string>("all");
  const [sortOption, setSortOption] = React.useState<string>("recent");

  // Read URL search params on mount
  React.useEffect(() => {
    const healthParam = searchParams.get("health");
    if (healthParam) setHealthFilter(healthParam.toLowerCase());

    const tabParam = searchParams.get("tab") as GuardianTab;
    if (tabParam && ["overview", "monitors", "incidents", "recovery"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Modals & Sheets State
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [selectedMonitor, setSelectedMonitor] = React.useState<GuardianMonitorSummaryV1 | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = React.useState(false);
  const [fallbackTarget, setFallbackTarget] = React.useState<GuardianMonitorSummaryV1 | null>(null);
  const [isFallbackOpen, setIsFallbackOpen] = React.useState(false);
  const [selectedIncident, setSelectedIncident] = React.useState<GuardianIncidentDetailV1 | null>(null);
  const [isIncidentOpen, setIsIncidentOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<GuardianMonitorSummaryV1 | null>(null);

  // Real backend refresh
  const refreshData = React.useCallback(async () => {
    try {
      setHasError(false);
      const [monitorsRes, incidentsRes] = await Promise.all([
        fetch(`/api/v1/guardian`),
        fetch(`/api/v1/guardian/incidents`),
      ]);

      if (!monitorsRes.ok) throw new Error("Failed to fetch monitors");
      const monitorsData = await monitorsRes.json();
      setMonitors(monitorsData.data || []);
      if (monitorsData.meta?.pulse) {
        setPulse(monitorsData.meta.pulse);
      }

      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json();
        setIncidents(incidentsData.data || []);
      }
    } catch (err) {
      console.error("[Guardian] Refresh failed:", err);
      setHasError(true);
    }
  }, []);

  // Filter change handler with URL sync
  const handleHealthFilterChange = (filter: string) => {
    setHealthFilter(filter);
    const params = new URLSearchParams(window.location.search);
    if (filter === "all") {
      params.delete("health");
    } else {
      params.set("health", filter);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  const handleTabChange = (tab: GuardianTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  // Run immediate server-side probe
  const handleRunCheck = async (monitor: GuardianMonitorSummaryV1) => {
    toast.info(`Running probe for ${monitor.destinationUrl}...`);
    try {
      const res = await fetch(`/api/v1/guardian/${monitor.id}/check`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Probe failed to schedule");
      const data = await res.json();
      const result = data.data?.observation?.result || "COMPLETED";
      toast.success(`Check finished: ${result}`);
      await refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to run health check");
    }
  };

  // Toggle monitor pause/resume
  const handleTogglePause = async (monitor: GuardianMonitorSummaryV1) => {
    const nextStatus = monitor.status === "PAUSED" ? "ACTIVE" : "PAUSED";
    try {
      const res = await fetch(`/api/v1/guardian/${monitor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(nextStatus === "ACTIVE" ? "Monitoring resumed" : "Monitoring paused");
      await refreshData();
    } catch (err: any) {
      toast.error(err.message || "Could not update monitor status");
    }
  };

  // Confirm delete monitor
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/v1/guardian/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete monitor");
      toast.success("Monitor deleted successfully");
      setDeleteTarget(null);
      await refreshData();
    } catch (err: any) {
      toast.error(err.message || "Could not delete monitor");
    }
  };

  // Filtered monitors list
  const filteredMonitors = React.useMemo(() => {
    return monitors.filter((m) => {
      // Health filter
      if (healthFilter === "healthy" && m.currentHealth !== "HEALTHY") return false;
      if (healthFilter === "degraded" && m.currentHealth !== "DEGRADED") return false;
      if (healthFilter === "unavailable" && m.currentHealth !== "UNAVAILABLE") return false;
      if (healthFilter === "paused" && m.status !== "PAUSED") return false;
      if (healthFilter === "incidents" && !m.activeIncidentId) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = m.name.toLowerCase().includes(q);
        const matchUrl = m.destinationUrl.toLowerCase().includes(q);
        const matchQr = m.qrName && m.qrName.toLowerCase().includes(q);
        return matchName || matchUrl || matchQr;
      }

      return true;
    });
  }, [monitors, healthFilter, searchQuery]);

  if (hasError) {
    return (
      <div className="space-y-6 pb-12">
        <GuardianHeader
          monitoredCount={0}
          openIncidentsCount={0}
          onOpenAddMonitor={() => setIsAddOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleFilters={() => {}}
        />
        <GuardianError onRetry={refreshData} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <GuardianHeader
        monitoredCount={pulse.monitoredCount}
        openIncidentsCount={pulse.openIncidentsCount}
        onOpenAddMonitor={() => setIsAddOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleFilters={() => {
          setActiveTab("monitors");
        }}
        hasActiveFilters={healthFilter !== "all" || searchQuery !== ""}
      />

      {/* 2. Signature Guardian Pulse */}
      <GuardianPulse
        monitors={monitors}
        onSelectMonitor={(m) => {
          setSelectedMonitor(m);
          setIsInspectorOpen(true);
        }}
        onAddMonitor={() => setIsAddOpen(true)}
      />

      {/* 3. Top Health Rail */}
      <GuardianHealthRail
        pulse={pulse}
        activeFilter={healthFilter}
        onFilterSelect={(f) => {
          handleHealthFilterChange(f);
        }}
      />

      {/* 4. Navigation Sub-Tabs */}
      <GuardianNavTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        incidentsCount={pulse.openIncidentsCount}
        monitorsCount={pulse.monitoredCount}
      />

      {/* 5. Tab Content Panes */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Destination Health Matrix */}
          <DestinationHealthMatrix
            monitors={monitors}
            onSelectMonitor={(m) => {
              setSelectedMonitor(m);
              setIsInspectorOpen(true);
            }}
          />

          {/* Health Ribbon Timeline */}
          {monitors.length > 0 && (
            <HealthRibbon monitors={monitors} selectedMonitor={selectedMonitor} />
          )}

          {/* Recovery Path Flow */}
          {monitors.length > 0 && (
            <RecoveryPath
              monitors={monitors}
              onConfigureFallback={(m) => {
                setFallbackTarget(m);
                setIsFallbackOpen(true);
              }}
            />
          )}

          {/* Monitored Registry Overview */}
          <MonitorsRegistry
            monitors={filteredMonitors}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            healthFilter={healthFilter}
            onHealthFilterChange={handleHealthFilterChange}
            sortOption={sortOption}
            onSortChange={setSortOption}
            onSelectMonitor={(m) => {
              setSelectedMonitor(m);
              setIsInspectorOpen(true);
            }}
            onRunCheck={handleRunCheck}
            onConfigureFallback={(m) => {
              setFallbackTarget(m);
              setIsFallbackOpen(true);
            }}
            onTogglePause={handleTogglePause}
            onDeleteMonitor={(m) => setDeleteTarget(m)}
            onClearFilters={() => {
              setSearchQuery("");
              handleHealthFilterChange("all");
            }}
          />
        </div>
      )}

      {activeTab === "monitors" && (
        <div className="space-y-6">
          <MonitorsRegistry
            monitors={filteredMonitors}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            healthFilter={healthFilter}
            onHealthFilterChange={handleHealthFilterChange}
            sortOption={sortOption}
            onSortChange={setSortOption}
            onSelectMonitor={(m) => {
              setSelectedMonitor(m);
              setIsInspectorOpen(true);
            }}
            onRunCheck={handleRunCheck}
            onConfigureFallback={(m) => {
              setFallbackTarget(m);
              setIsFallbackOpen(true);
            }}
            onTogglePause={handleTogglePause}
            onDeleteMonitor={(m) => setDeleteTarget(m)}
            onClearFilters={() => {
              setSearchQuery("");
              handleHealthFilterChange("all");
            }}
          />
        </div>
      )}

      {activeTab === "incidents" && (
        <div className="space-y-6">
          <IncidentTimeline
            incidents={incidents}
            onSelectIncident={(inc) => {
              setSelectedIncident(inc);
              setIsIncidentOpen(true);
            }}
          />
        </div>
      )}

      {activeTab === "recovery" && (
        <div className="space-y-6">
          <RecoveryPath
            monitors={monitors}
            onConfigureFallback={(m) => {
              setFallbackTarget(m);
              setIsFallbackOpen(true);
            }}
          />
        </div>
      )}

      {/* Modals, Dialogs & Sheets */}
      <AddMonitorDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        orgSlug={orgSlug}
        onMonitorCreated={refreshData}
      />

      <ConfigureFallbackDialog
        open={isFallbackOpen}
        onOpenChange={setIsFallbackOpen}
        monitor={fallbackTarget}
        onFallbackUpdated={refreshData}
      />

      <MonitorInspectorSheet
        open={isInspectorOpen}
        onOpenChange={setIsInspectorOpen}
        monitor={selectedMonitor}
        onRunCheck={handleRunCheck}
        onConfigureFallback={(m) => {
          setFallbackTarget(m);
          setIsFallbackOpen(true);
        }}
        onTogglePause={handleTogglePause}
        onDeleteMonitor={(m) => setDeleteTarget(m)}
      />

      <IncidentInspectorSheet
        open={isIncidentOpen}
        onOpenChange={setIsIncidentOpen}
        incident={selectedIncident}
      />

      <GuardianSettingsSheet
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="bg-surface border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Delete Destination Monitor?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to stop monitoring{" "}
              <strong className="text-foreground">{deleteTarget?.destinationUrl}</strong>?
              This will remove historical probe records and incidents. The underlying QR asset and routing will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              Delete Monitor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
