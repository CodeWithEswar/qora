"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ActivityPageHeader } from "./shell/activity-page-header";
import { OperationalSignalRail } from "./shell/operational-signal-rail";
import { ActivityTabs, type ActivityViewTab } from "./shell/activity-tabs";
import { OperationalObservatory } from "./observatory/operational-observatory";
import { ActivityStream } from "./stream/activity-stream";
import { ResourceActivityView } from "./resources/resource-activity-view";
import { PeopleActivityView } from "./people/people-activity-view";
import { ActivityFilterSheet } from "./filters/activity-filter-sheet";
import { ActivityFilterChips } from "./filters/activity-filter-chips";
import { EventInspectorSheet } from "./inspector/event-inspector-sheet";
import { ExportActivityDialog } from "./dialogs/export-activity-dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import type {
  ActivityProjection,
  ActivitySignalMetrics,
  ActivityTimeSeriesPoint,
  ActivityDensityCell,
  ResourcePulseSegment,
  ActorResourceCell,
  EventCompositionItem,
  ChangeFlowLink,
} from "@/lib/supabase/types/activity";

interface ActivityObservatoryViewProps {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  initialEvents: ActivityProjection[];
  initialMetrics: ActivitySignalMetrics;
  initialTimeSeries: ActivityTimeSeriesPoint[];
  initialDensityMatrix: ActivityDensityCell[];
  initialResourcePulse: ResourcePulseSegment[];
  initialActorResourceMatrix: ActorResourceCell[];
  initialEventComposition: EventCompositionItem[];
  initialChangeFlow: ChangeFlowLink[];
  initialRange?: "24h" | "7d" | "30d" | "90d";
  initialCategory?: string;
  initialResourceType?: string;
  initialActorId?: string;
  initialView?: ActivityViewTab;
}

export function ActivityObservatoryView({
  organization,
  initialEvents,
  initialMetrics,
  initialTimeSeries,
  initialDensityMatrix,
  initialResourcePulse,
  initialActorResourceMatrix,
  initialEventComposition,
  initialChangeFlow,
  initialRange = "30d",
  initialCategory,
  initialResourceType,
  initialActorId,
  initialView = "stream",
}: ActivityObservatoryViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active view
  const [activeTab, setActiveTab] = React.useState<ActivityViewTab>(
    (searchParams.get("view") as ActivityViewTab) || initialView
  );

  // Filters state
  const [dateRange, setDateRange] = React.useState<"24h" | "7d" | "30d" | "90d">(
    (searchParams.get("range") as any) || initialRange
  );
  const [categoryFilter, setCategoryFilter] = React.useState<string>(
    searchParams.get("category") || initialCategory || "all"
  );
  const [resourceFilter, setResourceFilter] = React.useState<string>(
    searchParams.get("resourceType") || initialResourceType || "all"
  );
  const [actorFilter, setActorFilter] = React.useState<string | undefined>(
    searchParams.get("actorId") || initialActorId || undefined
  );
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Data state
  const [events, setEvents] = React.useState<ActivityProjection[]>(initialEvents);
  const [metrics, setMetrics] = React.useState<ActivitySignalMetrics>(initialMetrics);
  const [timeSeries, setTimeSeries] = React.useState<ActivityTimeSeriesPoint[]>(initialTimeSeries);
  const [densityMatrix, setDensityMatrix] = React.useState<ActivityDensityCell[]>(initialDensityMatrix);
  const [resourcePulse, setResourcePulse] = React.useState<ResourcePulseSegment[]>(initialResourcePulse);
  const [actorResourceMatrix, setActorResourceMatrix] = React.useState<ActorResourceCell[]>(initialActorResourceMatrix);
  const [eventComposition, setEventComposition] = React.useState<EventCompositionItem[]>(initialEventComposition);
  const [changeFlow, setChangeFlow] = React.useState<ChangeFlowLink[]>(initialChangeFlow);

  const [isLoading, setIsLoading] = React.useState(false);

  // Modals
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<ActivityProjection | null>(null);

  // Synchronize URL query params
  const syncUrl = React.useCallback(
    (params: {
      view?: ActivityViewTab;
      range?: string;
      category?: string;
      resourceType?: string;
      actorId?: string;
    }) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (params.view) sp.set("view", params.view);
      if (params.range) sp.set("range", params.range);
      if (params.category && params.category !== "all") {
        sp.set("category", params.category);
      } else if (params.category === "all") {
        sp.delete("category");
      }
      if (params.resourceType && params.resourceType !== "all") {
        sp.set("resourceType", params.resourceType);
      } else if (params.resourceType === "all") {
        sp.delete("resourceType");
      }
      if (params.actorId) {
        sp.set("actorId", params.actorId);
      } else if (params.actorId === undefined) {
        sp.delete("actorId");
      }
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Refetch when server-authoritative filters change
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set("range", dateRange);
      if (categoryFilter && categoryFilter !== "all") sp.set("category", categoryFilter);
      if (resourceFilter && resourceFilter !== "all") sp.set("resourceType", resourceFilter);
      if (actorFilter) sp.set("actorId", actorFilter);

      const res = await fetch(`/api/v1/organizations/${organization.slug}/activity?${sp.toString()}`);
      if (res.ok) {
        const payload = await res.json();
        const data = payload?.data ?? payload;
        if (data?.events) setEvents(data.events);
        const signalMetrics = data?.signalMetrics ?? data?.metrics;
        if (signalMetrics) setMetrics(signalMetrics);
        if (data?.timeSeries) setTimeSeries(data.timeSeries);
        if (data?.densityMatrix) setDensityMatrix(data.densityMatrix);
        if (data?.resourcePulse) setResourcePulse(data.resourcePulse);
        if (data?.actorResourceMatrix) setActorResourceMatrix(data.actorResourceMatrix);
        if (data?.eventComposition) setEventComposition(data.eventComposition);
        if (data?.changeFlow) setChangeFlow(data.changeFlow);
      }
    } catch (err) {
      console.error("[ActivityObservatoryView] Failed to refetch activity data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, categoryFilter, resourceFilter, actorFilter, organization.slug]);

  // Track initial mount and filter state to avoid redundant refetching on load
  const initialMountFilters = React.useRef({
    range: initialRange,
    category: initialCategory || "all",
    resourceType: initialResourceType || "all",
    actorId: initialActorId,
  });

  const hasMounted = React.useRef(false);

  React.useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      if (
        dateRange === initialMountFilters.current.range &&
        categoryFilter === initialMountFilters.current.category &&
        resourceFilter === initialMountFilters.current.resourceType &&
        actorFilter === initialMountFilters.current.actorId
      ) {
        return;
      }
    }
    fetchData();
  }, [fetchData, dateRange, categoryFilter, resourceFilter, actorFilter]);

  // Tab change handler
  const handleTabChange = (tab: ActivityViewTab) => {
    setActiveTab(tab);
    syncUrl({ view: tab });
  };

  // Date range change handler
  const handleDateRangeChange = (range: "24h" | "7d" | "30d" | "90d") => {
    setDateRange(range);
    syncUrl({ range });
  };

  // Signal rail filter select
  const handleSignalRailSelect = (key: "all" | "publish" | "approval" | "changes") => {
    if (key === "all") {
      setCategoryFilter("all");
      syncUrl({ category: "all" });
    } else if (key === "publish") {
      setCategoryFilter("publish");
      syncUrl({ category: "publish" });
    } else if (key === "approval") {
      setCategoryFilter("approval");
      syncUrl({ category: "approval" });
    } else if (key === "changes") {
      setCategoryFilter("update");
      syncUrl({ category: "update" });
    }
  };

  // Filter clear handlers
  const handleClearCategory = () => {
    setCategoryFilter("all");
    syncUrl({ category: "all" });
  };

  const handleClearResourceType = () => {
    setResourceFilter("all");
    syncUrl({ resourceType: "all" });
  };

  const handleClearActor = () => {
    setActorFilter(undefined);
    syncUrl({ actorId: undefined });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleClearAll = () => {
    setCategoryFilter("all");
    setResourceFilter("all");
    setActorFilter(undefined);
    setSearchQuery("");
    syncUrl({ category: "all", resourceType: "all", actorId: undefined });
  };

  // Client-side text search over current loaded events
  const filteredEvents = React.useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase().trim();
    return events.filter(
      (e) =>
        e.actor.name.toLowerCase().includes(q) ||
        e.verb.toLowerCase().includes(q) ||
        e.resource.name.toLowerCase().includes(q) ||
        e.resource.type.toLowerCase().includes(q) ||
        (e.changeSummary &&
          e.changeSummary.some(
            (cs) =>
              cs.field?.toLowerCase().includes(q) ||
              String(cs.before || "").toLowerCase().includes(q) ||
              String(cs.after || "").toLowerCase().includes(q)
          ))
    );
  }, [events, searchQuery]);

  // Derived counts for tabs
  const tabCounts = React.useMemo(() => {
    const distinctResources = new Set(events.map((e) => `${e.resource.type}:${e.resource.id}`)).size;
    const distinctPeople = new Set(events.map((e) => e.actor.id)).size;
    return {
      stream: events.length,
      resources: distinctResources,
      people: distinctPeople,
    };
  }, [events]);

  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (resourceFilter !== "all" ? 1 : 0) +
    (actorFilter ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-16">
      {/* 01 Page Header */}
      <ActivityPageHeader
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onOpenFilters={() => setFilterSheetOpen(true)}
        onOpenExport={() => setExportDialogOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* 02 Operational Signal Rail */}
      <OperationalSignalRail
        metrics={metrics}
        activeFilter={categoryFilter}
        onFilterSelect={handleSignalRailSelect}
      />

      {/* 03 View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-1">
        <ActivityTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={tabCounts}
        />

        {/* Quick Search Bar */}
        <div className="relative w-full sm:w-64 pb-1 sm:pb-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operational events..."
            className="pl-8 h-8 text-xs font-mono bg-muted/40 border-border/80 focus-visible:ring-1 focus-visible:ring-[#FA520F]"
          />
          {isLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
          )}
        </div>
      </div>

      {/* 04 Active Filter Chips */}
      <ActivityFilterChips
        category={categoryFilter}
        onClearCategory={handleClearCategory}
        resourceType={resourceFilter}
        onClearResourceType={handleClearResourceType}
        actorId={actorFilter}
        onClearActor={handleClearActor}
        search={searchQuery}
        onClearSearch={handleClearSearch}
        onClearAll={handleClearAll}
      />

      {/* 05 Main Views */}
      <main className="min-h-[450px]">
        {activeTab === "stream" && (
          <ActivityStream
            events={filteredEvents}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            onClearFilters={handleClearAll}
            isFiltered={activeFilterCount > 0}
          />
        )}

        {activeTab === "observatory" && (
          <OperationalObservatory
            events={filteredEvents}
            densityMatrix={densityMatrix}
            resourcePulse={resourcePulse}
            actorResourceMatrix={actorResourceMatrix}
            eventComposition={eventComposition}
            changeFlow={changeFlow}
            timeSeries={timeSeries}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            onSelectResource={(resType) => {
              setResourceFilter(resType);
              syncUrl({ resourceType: resType });
            }}
            onSelectActor={(actId) => {
              setActorFilter(actId);
              syncUrl({ actorId: actId });
            }}
            onSelectCategory={(cat) => {
              setCategoryFilter(cat);
              syncUrl({ category: cat });
            }}
          />
        )}

        {activeTab === "resources" && (
          <ResourceActivityView
            events={filteredEvents}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
          />
        )}

        {activeTab === "people" && (
          <PeopleActivityView
            events={filteredEvents}
            onFilterByActor={(actId) => {
              setActorFilter(actId);
              syncUrl({ actorId: actId });
              setActiveTab("stream");
            }}
          />
        )}
      </main>

      {/* 06 Filter Sheet */}
      <ActivityFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(cat) => {
          setCategoryFilter(cat);
          syncUrl({ category: cat });
        }}
        resourceFilter={resourceFilter}
        onResourceFilterChange={(res) => {
          setResourceFilter(res);
          syncUrl({ resourceType: res });
        }}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onClearAll={handleClearAll}
        matchingCount={filteredEvents.length}
      />

      {/* 07 Event Inspector Sheet */}
      <EventInspectorSheet
        event={selectedEvent}
        open={Boolean(selectedEvent)}
        onOpenChange={(isOpen) => !isOpen && setSelectedEvent(null)}
        orgSlug={organization.slug}
      />

      {/* 08 Export Dialog */}
      <ExportActivityDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        orgSlug={organization.slug}
        filters={{
          view: activeTab,
          range: dateRange,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          resourceType: resourceFilter !== "all" ? resourceFilter : undefined,
          actorId: actorFilter,
        }}
        estimatedCount={filteredEvents.length}
      />
    </div>
  );
}
