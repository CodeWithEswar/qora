"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AuditLedgerOverview,
  AuditEvidenceRecord,
} from "@nxtqr/contracts";

import { AuditSignalRail } from "./audit-signal-rail";
import { AuditLens } from "./audit-lens";
import { EventDensityStrip } from "./event-density-strip";
import { EvidenceStream } from "./evidence-stream";
import { AuditTableView } from "./audit-table-view";
import { TraceView } from "./trace-view";
import { InvestigationCanvas } from "./investigation-canvas";

// Sheets & Dialogs
import { EventInspectorSheet } from "./sheets/event-inspector-sheet";
import { TargetHistorySheet } from "./sheets/target-history-sheet";
import { ActorHistorySheet } from "./sheets/actor-history-sheet";
import { ExportAuditDialog } from "./dialogs/export-audit-dialog";
import { AuditFilterSheet } from "./dialogs/audit-filter-sheet";

interface AuditLedgerClientProps {
  initialOverview: AuditLedgerOverview;
  currentUserId?: string;
  canExport?: boolean;
}

export function AuditLedgerClient({
  initialOverview,
  currentUserId,
  canExport = true,
}: AuditLedgerClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [overview, setOverview] = React.useState<AuditLedgerOverview>(initialOverview);
  const [activeView, setActiveView] = React.useState<"stream" | "table" | "trace">("stream");

  // Filters State
  const [range, setRange] = React.useState<string>(searchParams.get("range") || "30d");
  const [lens, setLens] = React.useState<string>(searchParams.get("lens") || "all");
  const [actorId, setActorId] = React.useState<string | undefined>(searchParams.get("actorId") || undefined);
  const [action, setAction] = React.useState<string | undefined>(searchParams.get("action") || undefined);
  const [resourceType, setResourceType] = React.useState<string | undefined>(searchParams.get("resourceType") || undefined);
  const [result, setResult] = React.useState<string>(searchParams.get("result") || "all");
  const [search, setSearch] = React.useState<string>(searchParams.get("search") || "");
  const [myActions, setMyActions] = React.useState<boolean>(searchParams.get("myActions") === "true");
  const [hasChanges, setHasChanges] = React.useState<boolean>(searchParams.get("hasChanges") === "true");

  // Investigation & Inspector States
  const [investigatingEvent, setInvestigatingEvent] = React.useState<AuditEvidenceRecord | null>(null);
  const [inspectingEvent, setInspectingEvent] = React.useState<AuditEvidenceRecord | null>(null);
  const [actorHistoryTarget, setActorHistoryTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [targetHistoryTarget, setTargetHistoryTarget] = React.useState<{ type: string; id: string; name: string } | null>(null);

  // Dialog States
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Re-fetch overview when filters change
  const fetchOverview = React.useCallback(
    async (cursor?: string) => {
      setIsLoading(true);
      try {
        const q = new URLSearchParams();
        if (range) q.set("range", range);
        if (lens && lens !== "all") q.set("lens", lens);
        if (actorId) q.set("actorId", actorId);
        if (action) q.set("action", action);
        if (resourceType) q.set("resourceType", resourceType);
        if (result && result !== "all") q.set("result", result);
        if (search.trim()) q.set("search", search.trim());
        if (myActions) q.set("myActions", "true");
        if (hasChanges) q.set("hasChanges", "true");
        if (cursor) q.set("cursor", cursor);

        const res = await fetch(`/api/v1/organizations/${overview.organization.slug}/audit?${q.toString()}`);
        const data = await res.json();
        if (res.ok && data.data) {
          if (cursor) {
            setOverview((prev) => ({
              ...data.data,
              events: [...prev.events, ...data.data.events],
            }));
          } else {
            setOverview(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to query audit overview:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [overview.organization.slug, range, lens, actorId, action, resourceType, result, search, myActions, hasChanges]
  );

  // Debounced search trigger
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchOverview();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, range, lens, actorId, action, resourceType, result, myActions, hasChanges, fetchOverview]);

  // Deep link check
  React.useEffect(() => {
    const eventIdParam = searchParams.get("event");
    if (eventIdParam && overview.events.length > 0) {
      const match = overview.events.find((e) => e.id === eventIdParam);
      if (match) {
        setInspectingEvent(match);
      }
    }
  }, [searchParams, overview.events]);

  const activeFilterCount = [
    range !== "30d",
    lens !== "all",
    Boolean(actorId),
    Boolean(action),
    Boolean(resourceType),
    result !== "all",
    myActions,
    hasChanges,
  ].filter(Boolean).length;

  const handleClearAllFilters = () => {
    setRange("30d");
    setLens("all");
    setActorId(undefined);
    setAction(undefined);
    setResourceType(undefined);
    setResult("all");
    setSearch("");
    setMyActions(false);
    setHasChanges(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#111111] text-[#F7F4EC]">
      {/* 01. Audit Header */}
      <header className="border-b border-white/[0.08] bg-[#121212]/80 backdrop-blur-xl px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#85827B]">
              <span>ORGANIZATION</span>
              <span>/</span>
              <span className="text-[#FA520F] font-semibold">AUDIT LOGS</span>
              <Badge
                variant="outline"
                className="ml-2 border-[#FA520F]/30 bg-[#FA520F]/10 text-[#FA520F] text-[10px] uppercase font-mono tracking-wider px-2 py-0.2"
              >
                EVIDENCE LEDGER
              </Badge>
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#F7F4EC]">
                Audit Logs
              </h1>
              <span className="text-xs text-[#85827B] font-mono hidden sm:inline-block">
                {overview.organization.slug}
              </span>
            </div>

            <p className="text-xs text-[#B8B5AD] max-w-2xl leading-relaxed">
              Investigate security-sensitive actions, configuration changes, and administrative events across this workspace.
            </p>
          </div>

          {/* Primary Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View switcher: Stream vs Table vs Trace */}
            <div className="inline-flex rounded-lg border border-white/[0.08] bg-[#191919] p-0.5 text-xs">
              <button
                onClick={() => {
                  setActiveView("stream");
                  setInvestigatingEvent(null);
                }}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all ${
                  activeView === "stream" && !investigatingEvent
                    ? "bg-[#FA520F] text-white shadow-sm"
                    : "text-[#B8B5AD] hover:text-[#F7F4EC] hover:bg-white/[0.04]"
                }`}
                title="Investigative Evidence Stream"
              >
                <Icon icon="solar:history-bold" className="w-3.5 h-3.5" />
                <span>Stream</span>
              </button>

              <button
                onClick={() => {
                  setActiveView("table");
                  setInvestigatingEvent(null);
                }}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all ${
                  activeView === "table" && !investigatingEvent
                    ? "bg-[#FA520F] text-white shadow-sm"
                    : "text-[#B8B5AD] hover:text-[#F7F4EC] hover:bg-white/[0.04]"
                }`}
                title="Dense Administrative Table"
              >
                <Icon icon="solar:list-check-bold" className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>

              <button
                onClick={() => {
                  setActiveView("trace");
                  setInvestigatingEvent(null);
                }}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all ${
                  activeView === "trace" && !investigatingEvent
                    ? "bg-[#FA520F] text-white shadow-sm"
                    : "text-[#B8B5AD] hover:text-[#F7F4EC] hover:bg-white/[0.04]"
                }`}
                title="Correlated Trace View"
              >
                <Icon icon="solar:route-bold" className="w-3.5 h-3.5" />
                <span>Trace</span>
              </button>
            </div>

            <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />

            {/* Filters Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterSheetOpen(true)}
              className="border-white/[0.1] bg-[#191919] hover:bg-[#222222] text-xs text-[#F7F4EC] h-8 gap-1.5"
            >
              <Icon icon="solar:filter-bold" className="w-3.5 h-3.5 text-[#FFB83E]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-[#FA520F] text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Export Evidence */}
            {canExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportDialogOpen(true)}
                className="border-white/[0.1] bg-[#191919] hover:bg-[#222222] text-xs text-[#F7F4EC] h-8 gap-1.5"
              >
                <Icon icon="solar:download-square-bold" className="w-3.5 h-3.5 text-[#B8B5AD]" />
                <span>Export</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 02. Connected Signal Rail */}
      <AuditSignalRail
        metrics={overview.metrics}
        activeFilter={null}
        onSelectFilter={() => {}}
      />

      {/* 03. Category Lens */}
      <AuditLens
        activeLens={lens}
        onSelectLens={(newLens) => setLens(newLens)}
        lensCounts={overview.lensCounts}
      />

      {/* 04. Temporal Density Rail */}
      <EventDensityStrip
        density={overview.density}
        onSelectBucket={() => {}}
      />

      {/* Search & Active Filter Chips Bar */}
      <div className="border-b border-white/[0.06] bg-[#141414] px-6 py-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Icon
              icon="solar:magnifer-linear"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#85827B]"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions, targets, request IDs or correlation tokens..."
              className="h-8 pl-9 text-xs bg-[#191919] border-white/[0.08] text-[#F7F4EC] placeholder:text-[#85827B]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#85827B] hover:text-[#F7F4EC]"
              >
                <Icon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMyActions((prev) => !prev)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                myActions
                  ? "bg-[#FA520F]/20 text-[#FA520F] border border-[#FA520F]/40 font-bold"
                  : "bg-white/[0.04] text-[#85827B] hover:text-[#F7F4EC]"
              }`}
            >
              My Actions
            </button>

            <button
              onClick={() => setHasChanges((prev) => !prev)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                hasChanges
                  ? "bg-[#FA520F]/20 text-[#FA520F] border border-[#FA520F]/40 font-bold"
                  : "bg-white/[0.04] text-[#85827B] hover:text-[#F7F4EC]"
              }`}
            >
              With Changes
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
            <span className="text-[#85827B] mr-1">FILTERS:</span>
            {range !== "30d" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06] text-[#F7F4EC]">
                Range: {range}
                <button onClick={() => setRange("30d")} className="hover:text-[#FA520F]">×</button>
              </span>
            )}
            {lens !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06] text-[#F7F4EC]">
                Category: {lens}
                <button onClick={() => setLens("all")} className="hover:text-[#FA520F]">×</button>
              </span>
            )}
            {actorId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06] text-[#F7F4EC]">
                Actor: {overview.actors.find((a) => a.id === actorId)?.name || actorId}
                <button onClick={() => setActorId(undefined)} className="hover:text-[#FA520F]">×</button>
              </span>
            )}
            {result !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06] text-[#F7F4EC]">
                Result: {result}
                <button onClick={() => setResult("all")} className="hover:text-[#FA520F]">×</button>
              </span>
            )}
            <button
              onClick={handleClearAllFilters}
              className="text-[#FA520F] hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Ledger Content */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Investigation Mode Active Banner */}
        {investigatingEvent && (
          <InvestigationCanvas
            event={investigatingEvent}
            onExit={() => setInvestigatingEvent(null)}
            onSelectEvent={(e) => setInvestigatingEvent(e)}
            orgSlug={overview.organization.slug}
          />
        )}

        {/* Evidence Stream View */}
        {!investigatingEvent && activeView === "stream" && (
          overview.events.length > 0 ? (
            <div className="space-y-4">
              <EvidenceStream
                events={overview.events}
                onInspectEvent={(e) => setInspectingEvent(e)}
                onInvestigateEvent={(e) => setInvestigatingEvent(e)}
              />

              {/* Cursor Pagination Loader */}
              {overview.hasMore && overview.nextCursor && (
                <div className="pt-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchOverview(overview.nextCursor!)}
                    disabled={isLoading}
                    className="border-white/[0.1] bg-[#161616] hover:bg-[#202020] text-xs text-[#F7F4EC] h-8 px-4"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Icon icon="solar:restart-bold" className="w-3.5 h-3.5 animate-spin text-[#FA520F]" />
                        Loading earlier events...
                      </span>
                    ) : (
                      "Load Earlier Events"
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center rounded-xl border border-dashed border-white/[0.08] bg-[#141414] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#FA520F]">
                <Icon icon="solar:shield-check-bold" className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F7F4EC]">No audit events in this range</h3>
              <p className="text-xs text-[#85827B] max-w-sm mx-auto leading-relaxed">
                No forensic evidence matches the current time range and filter parameters.
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="border-white/[0.1] text-xs text-[#FA520F] mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )
        )}

        {/* Table View */}
        {!investigatingEvent && activeView === "table" && (
          <div className="space-y-4">
            <AuditTableView
              events={overview.events}
              onInspectEvent={(e) => setInspectingEvent(e)}
            />

            {overview.hasMore && overview.nextCursor && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOverview(overview.nextCursor!)}
                  disabled={isLoading}
                  className="border-white/[0.1] bg-[#161616] hover:bg-[#202020] text-xs text-[#F7F4EC] h-8 px-4"
                >
                  Load Earlier Events
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Trace View */}
        {!investigatingEvent && activeView === "trace" && (
          <TraceView
            events={overview.events}
            onInspectEvent={(e) => setInspectingEvent(e)}
          />
        )}
      </main>

      {/* Sheets & Dialogs */}
      <EventInspectorSheet
        event={inspectingEvent}
        isOpen={Boolean(inspectingEvent)}
        onClose={() => setInspectingEvent(null)}
        onInvestigate={(e) => {
          setInspectingEvent(null);
          setInvestigatingEvent(e);
        }}
        onViewActorHistory={(id, name) => {
          setInspectingEvent(null);
          setActorHistoryTarget({ id, name });
        }}
        onViewTargetHistory={(type, id, name) => {
          setInspectingEvent(null);
          setTargetHistoryTarget({ type, id, name });
        }}
      />

      {targetHistoryTarget && (
        <TargetHistorySheet
          isOpen={Boolean(targetHistoryTarget)}
          onClose={() => setTargetHistoryTarget(null)}
          targetType={targetHistoryTarget.type}
          targetId={targetHistoryTarget.id}
          targetName={targetHistoryTarget.name}
          orgSlug={overview.organization.slug}
          onSelectEvent={(e) => {
            setTargetHistoryTarget(null);
            setInspectingEvent(e);
          }}
        />
      )}

      {actorHistoryTarget && (
        <ActorHistorySheet
          isOpen={Boolean(actorHistoryTarget)}
          onClose={() => setActorHistoryTarget(null)}
          actorId={actorHistoryTarget.id}
          actorName={actorHistoryTarget.name}
          orgSlug={overview.organization.slug}
          onSelectEvent={(e) => {
            setActorHistoryTarget(null);
            setInspectingEvent(e);
          }}
        />
      )}

      <ExportAuditDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        orgSlug={overview.organization.slug}
        currentRange={range}
        currentLens={lens}
      />

      <AuditFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        actors={overview.actors}
        actions={overview.actions}
        resourceTypes={overview.resourceTypes}
        currentFilters={{
          range,
          lens,
          actorId,
          action,
          resourceType,
          result,
          myActions,
          hasChanges,
        }}
        onApplyFilters={(f) => {
          setRange(f.range);
          setLens(f.lens);
          setActorId(f.actorId);
          setAction(f.action);
          setResourceType(f.resourceType);
          setResult(f.result);
          setMyActions(f.myActions);
          setHasChanges(f.hasChanges);
        }}
        onResetFilters={handleClearAllFilters}
      />
    </div>
  );
}
