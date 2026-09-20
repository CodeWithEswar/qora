"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { CampaignResponseV1, CampaignStatus } from "@nxtqr/contracts";
import { CampaignSummaryData, CampaignSignalRail } from "./campaign-signal-rail";
import { CampaignCommandBar } from "./campaign-command-bar";
import { CampaignFilterSheet, CampaignFilterState } from "./campaign-filter-sheet";
import { CampaignFilterChips } from "./campaign-filter-chips";
import { CampaignGrid } from "./campaign-grid";
import { CampaignList } from "./campaign-list";
import { CampaignsTrueEmptyState, CampaignsFilteredEmptyState } from "./campaigns-empty-state";
import { CampaignsSkeleton } from "./campaigns-skeleton";
import { CampaignsErrorState } from "./campaigns-error-state";
import { CreateCampaignDialog } from "./create-campaign-dialog";
import { EditCampaignDialog } from "./edit-campaign-dialog";
import { ArchiveCampaignAlert } from "./dialogs/archive-campaign-alert";
import { DeleteCampaignAlert } from "./dialogs/delete-campaign-alert";
import { AddQrSheet } from "./add-qr-sheet";

export interface CampaignsOperationsCenterProps {
  orgSlug: string;
  initialCampaigns: CampaignResponseV1[];
  initialSummary: CampaignSummaryData;
}

export function CampaignsOperationsCenter({
  orgSlug,
  initialCampaigns,
  initialSummary,
}: CampaignsOperationsCenterProps) {
  const searchParams = useSearchParams();

  // State initialized from URL searchParams or props
  const [campaigns, setCampaigns] = React.useState<CampaignResponseV1[]>(initialCampaigns);
  const [summary, setSummary] = React.useState<CampaignSummaryData>(initialSummary);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  // Search & Filter state
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = React.useState<CampaignStatus | "all">(
    (searchParams.get("status") as CampaignStatus) || "all"
  );
  const [sortBy, setSortBy] = React.useState<"updatedAt" | "createdAt" | "name" | "totalScans">(
    (searchParams.get("sortBy") as "updatedAt" | "createdAt" | "name" | "totalScans") || "updatedAt"
  );
  const [order, setOrder] = React.useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") || "desc"
  );
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<CampaignFilterState>({
    status: (searchParams.get("status") as CampaignStatus) || "all",
    hasQrs: (searchParams.get("hasQrs") as "true" | "false" | "all") || "all",
    hasScans: (searchParams.get("hasScans") as "true" | "false" | "all") || "all",
    dateRange: (searchParams.get("dateRange") as "today" | "7d" | "30d" | "all") || "all",
  });

  // View mode
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Dialog & Sheet States
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editingCampaign, setEditingCampaign] = React.useState<CampaignResponseV1 | null>(null);
  const [archivingCampaign, setArchivingCampaign] = React.useState<CampaignResponseV1 | null>(null);
  const [deletingCampaign, setDeletingCampaign] = React.useState<CampaignResponseV1 | null>(null);
  const [addQrsCampaign, setAddQrsCampaign] = React.useState<CampaignResponseV1 | null>(null);

  // Active filter count
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.status && filters.status !== "all") count++;
    if (filters.hasQrs && filters.hasQrs !== "all") count++;
    if (filters.hasScans && filters.hasScans !== "all") count++;
    if (filters.dateRange && filters.dateRange !== "all") count++;
    return count;
  }, [filters]);

  // Fetch campaigns from server
  const fetchCampaigns = React.useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filters.status && filters.status !== "all") params.set("status", filters.status);
      if (filters.hasQrs && filters.hasQrs !== "all") params.set("hasQrs", filters.hasQrs);
      if (filters.hasScans && filters.hasScans !== "all") params.set("hasScans", filters.hasScans);
      if (filters.dateRange && filters.dateRange !== "all") params.set("dateRange", filters.dateRange);
      params.set("sortBy", sortBy);
      params.set("order", order);

      const res = await fetch(`/api/v1/campaigns?${params.toString()}`, {
        headers: { "x-organization-slug": orgSlug },
      });

      if (!res.ok) throw new Error("Failed to load campaigns");

      const data = await res.json();
      setCampaigns(data.data || []);
      if (data.meta?.signal) {
        setSummary(data.meta.signal);
      }
    } catch (err) {
      console.error("Campaigns load error:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [search, filters, sortBy, order, orgSlug]);

  // Debounced search / filter trigger
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchCampaigns();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, filters, sortBy, order, fetchCampaigns]);

  // Filter handlers
  const handleStatusFilterChange = (status: CampaignStatus | "all") => {
    setStatusFilter(status);
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleApplyFilters = (newFilters: CampaignFilterState) => {
    setFilters(newFilters);
    if (newFilters.status) {
      setStatusFilter(newFilters.status);
    }
  };

  const handleResetFilters = () => {
    const defaultFilters: CampaignFilterState = {
      status: "all",
      hasQrs: "all",
      hasScans: "all",
      dateRange: "all",
    };
    setFilters(defaultFilters);
    setStatusFilter("all");
  };

  const handleRemoveSingleFilter = (key: keyof CampaignFilterState) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: "all" };
      if (key === "status") setStatusFilter("all");
      return updated;
    });
  };

  const handleSortChange = (
    newSortBy: "updatedAt" | "createdAt" | "name" | "totalScans",
    newOrder: "asc" | "desc"
  ) => {
    setSortBy(newSortBy);
    setOrder(newOrder);
  };

  // Mutation callbacks
  const handleCampaignCreated = () => {
    fetchCampaigns();
  };

  const handleCampaignUpdated = (updated: CampaignResponseV1) => {
    setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleCampaignArchived = (archived: CampaignResponseV1) => {
    setCampaigns((prev) => prev.map((c) => (c.id === archived.id ? archived : c)));
  };

  const handleCampaignDeleted = (campaignId: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    setSummary((prev) => ({
      ...prev,
      activeCampaigns: Math.max(0, prev.activeCampaigns - 1),
    }));
  };

  const handleQrsAdded = () => {
    fetchCampaigns();
  };

  // Determine empty states
  const isZeroOrgCampaigns = summary.activeCampaigns === 0 && initialCampaigns.length === 0 && !search && activeFilterCount === 0;
  const isFilteredEmpty = campaigns.length === 0 && !isZeroOrgCampaigns && !isLoading && !hasError;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
            <Link href={`/${orgSlug}`} className="hover:text-foreground transition-colors">
              Workspace
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Campaigns</span>
          </nav>

          <div className="text-[11px] font-bold tracking-wider text-primary uppercase mb-0.5">
            CAMPAIGNS
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Campaigns
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            Organize QR assets into measurable initiatives. Orchestrate destinations, routing, and scan performance across your marketing ecosystem.
          </p>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-[#CC3A05] text-white gap-2 shadow-xs transition-colors shrink-0"
        >
          <Icon icon="hugeicons:plus-sign" className="w-4 h-4" />
          <span>Create Campaign</span>
        </Button>
      </div>

      {/* 2. Campaign Signal Rail */}
      <CampaignSignalRail data={summary} isLoading={isLoading} />

      {/* 3. Operational Command Bar */}
      <CampaignCommandBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        sortBy={sortBy}
        order={order}
        onSortChange={handleSortChange}
        activeFilterCount={activeFilterCount}
        onOpenFilterSheet={() => setFilterSheetOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 4. Active Filter Chips */}
      {activeFilterCount > 0 && (
        <CampaignFilterChips
          filters={filters}
          onRemoveFilter={handleRemoveSingleFilter}
          onClearAll={handleResetFilters}
        />
      )}

      {/* 5. Campaign Content State */}
      {isLoading && campaigns.length === 0 ? (
        <CampaignsSkeleton />
      ) : hasError ? (
        <CampaignsErrorState onRetry={fetchCampaigns} />
      ) : isZeroOrgCampaigns ? (
        <CampaignsTrueEmptyState
          onCreateCampaign={() => setCreateDialogOpen(true)}
          orgSlug={orgSlug}
        />
      ) : isFilteredEmpty ? (
        <CampaignsFilteredEmptyState onClearFilters={handleResetFilters} />
      ) : viewMode === "grid" ? (
        <CampaignGrid
          campaigns={campaigns}
          orgSlug={orgSlug}
          onEdit={(c) => setEditingCampaign(c)}
          onArchive={(c) => setArchivingCampaign(c)}
          onDelete={(c) => setDeletingCampaign(c)}
          onAddQrs={(c) => setAddQrsCampaign(c)}
        />
      ) : (
        <CampaignList
          campaigns={campaigns}
          orgSlug={orgSlug}
          onEdit={(c) => setEditingCampaign(c)}
          onArchive={(c) => setArchivingCampaign(c)}
          onDelete={(c) => setDeletingCampaign(c)}
          onAddQrs={(c) => setAddQrsCampaign(c)}
        />
      )}

      {/* 6. Filter Sheet */}
      <CampaignFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* 7. Create Campaign Dialog */}
      <CreateCampaignDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        orgSlug={orgSlug}
        onCreated={handleCampaignCreated}
      />

      {/* 8. Edit Campaign Dialog */}
      <EditCampaignDialog
        open={!!editingCampaign}
        onOpenChange={(open) => !open && setEditingCampaign(null)}
        campaign={editingCampaign}
        orgSlug={orgSlug}
        onUpdated={handleCampaignUpdated}
      />

      {/* 9. Archive Campaign AlertDialog */}
      <ArchiveCampaignAlert
        open={!!archivingCampaign}
        onOpenChange={(open) => !open && setArchivingCampaign(null)}
        campaign={archivingCampaign}
        orgSlug={orgSlug}
        onArchived={handleCampaignArchived}
      />

      {/* 10. Delete Campaign AlertDialog */}
      <DeleteCampaignAlert
        open={!!deletingCampaign}
        onOpenChange={(open) => !open && setDeletingCampaign(null)}
        campaign={deletingCampaign}
        orgSlug={orgSlug}
        onDeleted={handleCampaignDeleted}
      />

      {/* 11. Add QR Codes Sheet */}
      {addQrsCampaign && (
        <AddQrSheet
          open={!!addQrsCampaign}
          onOpenChange={(open) => !open && setAddQrsCampaign(null)}
          campaignId={addQrsCampaign.id}
          campaignName={addQrsCampaign.name}
          orgSlug={orgSlug}
          onAdded={handleQrsAdded}
        />
      )}
    </div>
  );
}
