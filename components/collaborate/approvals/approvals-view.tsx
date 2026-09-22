"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApprovalSignalRail } from "./approval-signal-rail";
import { ApprovalViews } from "./approval-views";
import { DecisionQueue } from "./decision-queue";
import { ApprovalFiltersSheet } from "./sheets/approval-filters-sheet";
import { ImpactResourcesSheet } from "./sheets/impact-resources-sheet";
import type {
  ApprovalSummary,
  ApprovalSignalMetrics,
  ApprovalHorizonMetrics,
  CanonicalApprovalView,
} from "@/lib/supabase/types/approvals";

interface ApprovalsViewProps {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  initialApprovals: ApprovalSummary[];
  initialSignalMetrics: ApprovalSignalMetrics;
  initialHorizonMetrics?: ApprovalHorizonMetrics;
  canManageApprovals?: boolean;
}

export function ApprovalsView({
  organization,
  initialApprovals,
  initialSignalMetrics,
  canManageApprovals = true,
}: ApprovalsViewProps) {
  const router = useRouter();

  // Primary Data State
  const [approvals, setApprovals] = React.useState<ApprovalSummary[]>(initialApprovals);
  const [signalMetrics, setSignalMetrics] = React.useState<ApprovalSignalMetrics>(initialSignalMetrics);

  // View & Filter States
  const [activeView, setActiveView] = React.useState<CanonicalApprovalView>("my_queue");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sort, setSort] = React.useState("newest");
  const [densityMode, setDensityMode] = React.useState<"focused" | "compact">("focused");

  // Sheet States
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);
  const [inspectingImpactApproval, setInspectingImpactApproval] = React.useState<ApprovalSummary | null>(null);

  // Sync state if server revalidates
  React.useEffect(() => {
    setApprovals(initialApprovals);
    setSignalMetrics(initialSignalMetrics);
  }, [initialApprovals, initialSignalMetrics]);

  const orgSlug = organization.slug;

  // Filtered approvals calculation
  const filteredApprovals = React.useMemo(() => {
    let list = [...approvals];

    // 1. View Tab Filter
    if (activeView === "my_queue") {
      list = list.filter((a) => a.isActionableForUser);
    } else if (activeView === "all_requests") {
      list = list.filter(
        (a) => a.status === "PENDING" || a.status === "WAITING" || a.status === "IN_REVIEW"
      );
    } else if (activeView === "requested_by_me") {
      list = list.filter((a) => a.availableActions.isSelfRequester);
    } else if (activeView === "history") {
      list = list.filter(
        (a) => a.status !== "PENDING" && a.status !== "WAITING" && a.status !== "IN_REVIEW"
      );
    }

    // 2. Type Filter
    if (typeFilter !== "all") {
      list = list.filter((a) => a.type === typeFilter);
    }

    // 3. Status Filter
    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }

    // 4. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        a.publicId.toLowerCase().includes(q) ||
        a.requestedBy.name.toLowerCase().includes(q) ||
        a.affectedEntityRef.toLowerCase().includes(q) ||
        `rev ${a.targetRevisionNumber}`.includes(q)
      );
    }

    // 5. Sorting
    if (sort === "oldest_waiting") {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === "recently_decided") {
      list.sort((a, b) => {
        const tA = a.decidedAt ? new Date(a.decidedAt).getTime() : 0;
        const tB = b.decidedAt ? new Date(b.decidedAt).getTime() : 0;
        return tB - tA;
      });
    } else if (sort === "resource_name") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [approvals, activeView, typeFilter, statusFilter, searchQuery, sort]);

  // Counts for tabs
  const tabCounts = React.useMemo(() => {
    return {
      myQueue: approvals.filter((a) => a.isActionableForUser).length,
      allRequests: approvals.filter(
        (a) => a.status === "PENDING" || a.status === "WAITING" || a.status === "IN_REVIEW"
      ).length,
      requestedByMe: approvals.filter((a) => a.availableActions.isSelfRequester).length,
      history: approvals.filter(
        (a) => a.status !== "PENDING" && a.status !== "WAITING" && a.status !== "IN_REVIEW"
      ).length,
    };
  }, [approvals]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-semibold">
            <span>COLLABORATE</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground">APPROVALS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground tracking-tight">
            Approvals
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl font-sans">
            Review governed changes before they become published state.
          </p>
        </div>
      </div>

      {/* 2. SIGNATURE FEATURE — GOVERNANCE SIGNAL RAIL */}
      <ApprovalSignalRail
        metrics={signalMetrics}
        onFilterClick={(view) => setActiveView(view)}
      />

      {/* 3. Primary Canonical Views */}
      <ApprovalViews
        activeView={activeView}
        onViewChange={setActiveView}
        counts={tabCounts}
      />

      {/* 4. Decision Queue (Corridor & Compact Modes) */}
      <DecisionQueue
        approvals={filteredApprovals}
        organizationSlug={orgSlug}
        activeView={activeView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sort={sort}
        onSortChange={setSort}
        densityMode={densityMode}
        onDensityModeChange={setDensityMode}
        onOpenFiltersSheet={() => setIsFilterSheetOpen(true)}
        onViewImpact={(approval) => setInspectingImpactApproval(approval)}
      />

      {/* 5. Advanced Filters Sheet */}
      <ApprovalFiltersSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        sort={sort}
        onSortChange={setSort}
        matchingCount={filteredApprovals.length}
        onClearAll={() => {
          setTypeFilter("all");
          setStatusFilter("all");
          setSearchQuery("");
        }}
      />

      {/* 6. Impact Resources Sheet */}
      <ImpactResourcesSheet
        approval={inspectingImpactApproval}
        isOpen={Boolean(inspectingImpactApproval)}
        onClose={() => setInspectingImpactApproval(null)}
        organizationSlug={orgSlug}
      />
    </div>
  );
}
