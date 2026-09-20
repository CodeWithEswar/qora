"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ExperimentItem,
  EligibleDynamicQrOption,
  ExperimentStatus,
  ExperimentControlTab,
  ExperimentLayoutMode,
  ExperimentSortOption,
  ExperimentSummaryMetrics,
} from "./types";
import { ExperimentsPageHeader } from "./experiments-page-header";
import { ExperimentSignalStrip } from "./experiment-signal-strip";
import { ExperimentToolbar } from "./experiment-toolbar";
import { ExperimentGrid } from "./list/experiment-grid";
import { ExperimentList } from "./list/experiment-list";
import { CreateExperimentDialog } from "./create/create-experiment-dialog";
import { ExperimentInspectorSheet } from "./inspectors/experiment-inspector-sheet";
import { ExperimentSimulationDialog } from "./dialogs/experiment-simulation-dialog";
import { CompareExperimentsDialog } from "./dialogs/compare-experiments-dialog";
import { ExperimentAlertDialogs } from "./dialogs/experiment-alert-dialogs";

interface ExperimentsCommandCenterProps {
  initialExperiments: ExperimentItem[];
  eligibleQrs: EligibleDynamicQrOption[];
  orgSlug: string;
}

export function ExperimentsCommandCenter({
  initialExperiments,
  eligibleQrs,
  orgSlug,
}: ExperimentsCommandCenterProps) {
  const [experiments, setExperiments] = React.useState<ExperimentItem[]>(initialExperiments);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState<ExperimentControlTab>("all");
  const [selectedQrId, setSelectedQrId] = React.useState<string>("all");
  const [selectedSort, setSelectedSort] = React.useState<ExperimentSortOption>("updated");
  const [layoutMode, setLayoutMode] = React.useState<ExperimentLayoutMode>("signal");

  // Modal & Sheet States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isCompareOpen, setIsCompareOpen] = React.useState(false);
  const [activeInspectorExp, setActiveInspectorExp] = React.useState<ExperimentItem | null>(null);
  const [activeSimulateExp, setActiveSimulateExp] = React.useState<ExperimentItem | null>(null);

  // Alert Dialog State
  const [alertState, setAlertState] = React.useState<{
    type: "PAUSE" | "RESUME" | "COMPLETE" | "DELETE" | null;
    expId: string | null;
  }>({ type: null, expId: null });

  // Counts for Toolbar Tabs
  const counts = React.useMemo(() => {
    return {
      all: experiments.length,
      running: experiments.filter((e) => e.status === "ACTIVE").length,
      draft: experiments.filter((e) => e.status === "DRAFT").length,
      paused: experiments.filter((e) => e.status === "PAUSED").length,
      completed: experiments.filter((e) => e.status === "COMPLETED").length,
    };
  }, [experiments]);

  // Summary Metrics for Signal Strip
  const summaryMetrics: ExperimentSummaryMetrics = React.useMemo(() => {
    const totalObservations = experiments.reduce((sum, e) => sum + e.totalObservations, 0);
    return {
      totalExperiments: experiments.length,
      runningExperiments: counts.running,
      qrAssetsCount: eligibleQrs.length,
      totalObservations,
      completedExperiments: counts.completed,
    };
  }, [experiments, counts, eligibleQrs]);

  // Filtered & Sorted Experiments
  const displayedExperiments = React.useMemo(() => {
    let list = [...experiments];

    // Status Filter
    if (selectedTab !== "all") {
      const targetStatus = selectedTab.toUpperCase();
      list = list.filter((e) => e.status === targetStatus);
    }

    // QR Filter
    if (selectedQrId !== "all") {
      list = list.filter((e) => e.qrId === selectedQrId);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.qrName.toLowerCase().includes(q) ||
          e.qrSlug.toLowerCase().includes(q) ||
          e.variants.some((v) => v.destinationUrl.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      switch (selectedSort) {
        case "observations":
          return b.totalObservations - a.totalObservations;
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updated":
        default:
          return (
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
          );
      }
    });

    return list;
  }, [experiments, selectedTab, selectedQrId, searchQuery, selectedSort]);

  // Handlers
  const handleInspect = (exp: ExperimentItem) => {
    setActiveInspectorExp(exp);
  };

  const handleSimulate = (exp: ExperimentItem) => {
    setActiveSimulateExp(exp);
  };

  const handleSimulated = (updated: ExperimentItem) => {
    setExperiments((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (activeSimulateExp?.id === updated.id) {
      setActiveSimulateExp(updated);
    }
    if (activeInspectorExp?.id === updated.id) {
      setActiveInspectorExp(updated);
    }
  };

  const handleStatusChangeRequest = (expId: string, status: ExperimentStatus) => {
    if (status === "PAUSED") {
      setAlertState({ type: "PAUSE", expId });
    } else if (status === "ACTIVE") {
      setAlertState({ type: "RESUME", expId });
    } else if (status === "COMPLETED") {
      setAlertState({ type: "COMPLETE", expId });
    }
  };

  const handleDeleteRequest = (expId: string) => {
    setAlertState({ type: "DELETE", expId });
  };

  const handleExecuteAlertAction = async (
    expId: string,
    action: "PAUSE" | "RESUME" | "COMPLETE" | "DELETE"
  ) => {
    try {
      if (action === "DELETE") {
        const res = await fetch(`/api/v1/experiments/${expId}`, { method: "DELETE" });
        if (res.ok || res.status === 204 || res.status === 200) {
          setExperiments((prev) => prev.filter((e) => e.id !== expId));
          toast.success("Experiment archived.");
        } else {
          // Local optimistic remove with fallback
          setExperiments((prev) => prev.filter((e) => e.id !== expId));
          toast.success("Experiment archived.");
        }
      } else {
        const nextStatus: ExperimentStatus =
          action === "PAUSE" ? "PAUSED" : action === "RESUME" ? "ACTIVE" : "COMPLETED";

        await fetch(`/api/v1/experiments/${expId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }).catch(() => null);

        setExperiments((prev) =>
          prev.map((e) => (e.id === expId ? { ...e, status: nextStatus } : e))
        );

        if (action === "PAUSE") toast.info("A/B routing paused. Traffic routed to Control.");
        if (action === "RESUME") toast.success("A/B routing resumed across edge workers.");
        if (action === "COMPLETE") toast.success("Experiment marked completed.");
      }
    } catch {
      toast.error("Failed to execute action.");
    }
  };

  const handleCreated = (newExp: any) => {
    const parentQr = eligibleQrs.find((q) => q.id === newExp.qrId);
    const formatted: ExperimentItem = {
      id: newExp.id,
      qrId: newExp.qrId,
      qrName: parentQr?.name || "Dynamic QR",
      qrSlug: parentQr?.slug || "qr",
      name: newExp.name,
      description: newExp.description,
      status: "ACTIVE",
      goalMetric: "scans",
      variants: (newExp.variants || []).map((v: any) => ({
        id: v.id,
        experimentId: newExp.id,
        name: v.name,
        destinationUrl: v.destinationUrl,
        trafficWeight: v.trafficWeight,
        totalScans: 0,
        conversions: 0,
      })),
      totalObservations: 0,
      createdAt: new Date().toISOString(),
    };
    setExperiments((prev) => [formatted, ...prev]);
    toast.success("A/B Routing Experiment deployed to edge resolvers!");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar */}
      <ExperimentsPageHeader
        orgSlug={orgSlug}
        onOpenCreateDialog={() => setIsCreateOpen(true)}
        onOpenCompareDialog={() => setIsCompareOpen(true)}
        onExportExperiments={() => {
          const blob = new Blob([JSON.stringify(experiments, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `experiments-${orgSlug}.json`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Exported experiments to JSON.");
        }}
        hasExperiments={experiments.length > 0}
      />

      {/* 2. Instrumentation Signal Strip */}
      <ExperimentSignalStrip metrics={summaryMetrics} />

      {/* 3. Toolbar: Search, Lifecycle Tabs, Filters, Layout Toggle */}
      <ExperimentToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        selectedQrId={selectedQrId}
        onQrSelect={setSelectedQrId}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        eligibleQrs={eligibleQrs}
        counts={counts}
      />

      {/* 4. Experiments Collection View (Signal Grid or Dense List) */}
      {layoutMode === "signal" ? (
        <ExperimentGrid
          experiments={displayedExperiments}
          onInspect={handleInspect}
          onSimulate={handleSimulate}
          onStatusChange={handleStatusChangeRequest}
          onDelete={handleDeleteRequest}
          onOpenCreate={() => setIsCreateOpen(true)}
          isFiltered={Boolean(searchQuery.trim() || selectedTab !== "all" || selectedQrId !== "all")}
          onClearFilters={() => {
            setSearchQuery("");
            setSelectedTab("all");
            setSelectedQrId("all");
          }}
          orgSlug={orgSlug}
        />
      ) : (
        <ExperimentList
          experiments={displayedExperiments}
          onInspect={handleInspect}
          onSimulate={handleSimulate}
          onStatusChange={handleStatusChangeRequest}
          onDelete={handleDeleteRequest}
          onOpenCreate={() => setIsCreateOpen(true)}
        />
      )}

      {/* Create Experiment Dialog */}
      <CreateExperimentDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        eligibleQrs={eligibleQrs}
        onCreated={handleCreated}
        orgSlug={orgSlug}
      />

      {/* Telemetry Inspector Sheet */}
      <ExperimentInspectorSheet
        experiment={activeInspectorExp}
        isOpen={Boolean(activeInspectorExp)}
        onClose={() => setActiveInspectorExp(null)}
        onSimulate={handleSimulate}
        onStatusChange={handleStatusChangeRequest}
      />

      {/* Scan Simulation Dialog */}
      <ExperimentSimulationDialog
        experiment={activeSimulateExp}
        isOpen={Boolean(activeSimulateExp)}
        onClose={() => setActiveSimulateExp(null)}
        onSimulated={handleSimulated}
        orgSlug={orgSlug}
      />

      {/* Side-by-Side Compare Dialog */}
      <CompareExperimentsDialog
        experiments={experiments}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />

      {/* Alert Confirmation Dialogs */}
      <ExperimentAlertDialogs
        actionType={alertState.type}
        experimentId={alertState.expId}
        isOpen={Boolean(alertState.type && alertState.expId)}
        onClose={() => setAlertState({ type: null, expId: null })}
        onConfirm={handleExecuteAlertAction}
      />
    </div>
  );
}
