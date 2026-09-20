"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QrResponseV1 } from "@nxtqr/contracts";

import { QrSignalStrip, QrSummaryData } from "./qr-signal-strip";
import { QrCommandBar, ColumnVisibility } from "./qr-command-bar";
import { QrActiveFilters, ActiveFilters } from "./qr-active-filters";
import { QrSelectionBar } from "./qr-selection-bar";
import { QrFilterSheet, FilterSheetState, CampaignOption, MemberOption } from "./qr-filter-sheet";
import { QrTable } from "./qr-table";
import { QrGrid } from "./qr-grid";
import { QrInspectorSheet } from "./qr-inspector-sheet";
import { QrEmptyState } from "./qr-empty-state";

// Dialogs
import { PauseQrDialog } from "./dialogs/pause-qr-dialog";
import { ArchiveQrDialog } from "./dialogs/archive-qr-dialog";
import { DeleteQrDialog } from "./dialogs/delete-qr-dialog";
import { DuplicateQrDialog } from "./dialogs/duplicate-qr-dialog";
import { MoveQrDialog } from "./dialogs/move-qr-dialog";
import { DownloadQrDialog } from "./dialogs/download-qr-dialog";

export interface QrOperationsCenterProps {
  orgSlug: string;
  initialItems?: QrResponseV1[];
  initialSummary?: QrSummaryData;
}

export function QROperationsCenter({
  orgSlug,
  initialItems = [],
  initialSummary = { total: 0, active: 0, draft: 0, paused: 0, archived: 0 },
}: QrOperationsCenterProps) {
  // Data state
  const [items, setItems] = React.useState<QrResponseV1[]>(initialItems);
  const [summary, setSummary] = React.useState<QrSummaryData>(initialSummary);
  const [isLoading, setIsLoading] = React.useState<boolean>(initialItems.length === 0 && initialSummary.total === 0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = React.useState<string | undefined>(undefined);
  const [campaignFilter, setCampaignFilter] = React.useState<string | undefined>(undefined);
  const [ownerFilter, setOwnerFilter] = React.useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = React.useState<"updatedAt" | "createdAt" | "name" | "totalScans">("updatedAt");
  const [order, setOrder] = React.useState<"asc" | "desc">("desc");

  // View & Columns
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");
  const [columns, setColumns] = React.useState<ColumnVisibility>({
    destination: true,
    campaign: true,
    scans: true,
    status: true,
    owner: true,
    updated: true,
  });

  // Selection state
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Supporting D1 metadata
  const [campaigns, setCampaigns] = React.useState<CampaignOption[]>([]);
  const [members, setMembers] = React.useState<MemberOption[]>([]);

  // Dialog & Inspector states
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);
  const [inspectorQr, setInspectorQr] = React.useState<QrResponseV1 | null>(null);
  const [pauseTarget, setPauseTarget] = React.useState<QrResponseV1 | null>(null);
  const [archiveTarget, setArchiveTarget] = React.useState<QrResponseV1 | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<QrResponseV1 | null>(null);
  const [duplicateTarget, setDuplicateTarget] = React.useState<QrResponseV1 | null>(null);
  const [moveTarget, setMoveTarget] = React.useState<{
    count: number;
    qrIds: string[];
    currentCampaignId?: string;
  } | null>(null);
  const [downloadTarget, setDownloadTarget] = React.useState<QrResponseV1 | null>(null);

  // Debounce search query
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch campaigns and members once
  React.useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cRes, mRes] = await Promise.all([
          fetch("/api/v1/campaigns?limit=50", {
            headers: orgSlug ? { "x-organization-slug": orgSlug } : undefined,
          }),
          fetch(`/api/v1/organizations/${orgSlug}/members`, {
            headers: orgSlug ? { "x-organization-slug": orgSlug } : undefined,
          }),
        ]);

        if (cRes.ok) {
          const cJson = await cRes.json();
          setCampaigns(
            (cJson.data || []).map((c: any) => ({
              id: c.id,
              name: c.name,
            }))
          );
        }

        if (mRes.ok) {
          const mJson = await mRes.json();
          const rawMembers = Array.isArray(mJson.data)
            ? mJson.data
            : Array.isArray(mJson.data?.members)
            ? mJson.data.members
            : [];
          setMembers(
            rawMembers.map((m: any) => ({
              id: m.userId || m.id,
              name: m.name || m.email,
              email: m.email,
            }))
          );
        }
      } catch (e) {
        console.warn("[QROperationsCenter] Unable to load campaigns/members:", e);
      }
    };
    fetchMetadata();
  }, [orgSlug]);

  // Fetch QR list from authoritative Cloudflare D1 endpoint
  const fetchQrs = React.useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setIsRefreshing(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("limit", "100");
        params.set("sortBy", sortBy);
        params.set("order", order);

        if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
        if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
        if (typeFilter && typeFilter !== "ALL") params.set("type", typeFilter);
        if (campaignFilter) params.set("campaignId", campaignFilter);
        if (ownerFilter) params.set("ownerId", ownerFilter);

        const res = await fetch(`/api/v1/qrs?${params.toString()}`, {
          headers: orgSlug ? { "x-organization-slug": orgSlug } : undefined,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `API error (${res.status})`);
        }

        const json = await res.json();
        setItems(json.data || []);

        if (json.meta?.summary) {
          setSummary(json.meta.summary);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load QR codes");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [orgSlug, debouncedSearch, statusFilter, typeFilter, campaignFilter, ownerFilter, sortBy, order]
  );

  // Trigger query on filters change
  React.useEffect(() => {
    fetchQrs();
  }, [fetchQrs]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((q) => q.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleToggleColumn = (key: keyof ColumnVisibility) => {
    setColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Active filter count & helpers
  const isFiltered = Boolean(
    (statusFilter && statusFilter !== "ALL") ||
      (typeFilter && typeFilter !== "ALL") ||
      campaignFilter ||
      ownerFilter ||
      debouncedSearch.trim()
  );

  const activeFilterCount = [
    statusFilter && statusFilter !== "ALL",
    typeFilter && typeFilter !== "ALL",
    Boolean(campaignFilter),
    Boolean(ownerFilter),
    Boolean(debouncedSearch.trim()),
  ].filter(Boolean).length;

  const handleRemoveFilter = (key: keyof ActiveFilters) => {
    if (key === "status") setStatusFilter(undefined);
    if (key === "qrType") setTypeFilter(undefined);
    if (key === "campaignId" || key === "campaignName") setCampaignFilter(undefined);
    if (key === "ownerId" || key === "ownerName") setOwnerFilter(undefined);
    if (key === "search") setSearchQuery("");
  };

  const handleClearAllFilters = () => {
    setStatusFilter(undefined);
    setTypeFilter(undefined);
    setCampaignFilter(undefined);
    setOwnerFilter(undefined);
    setSearchQuery("");
  };

  // Lifecycle Server Mutations
  const handleConfirmPauseResume = async () => {
    if (!pauseTarget) return;
    const isCurrentlyPaused = pauseTarget.status === "PAUSED";
    const nextStatus = isCurrentlyPaused ? "ACTIVE" : "PAUSED";

    try {
      const res = await fetch(`/api/v1/qrs/${pauseTarget.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Could not update QR status");

      toast.success(isCurrentlyPaused ? "QR resumed" : "QR paused", {
        description: `${pauseTarget.name} status updated to ${nextStatus}`,
      });
      fetchQrs();
    } catch (err: any) {
      toast.error("Status update failed", { description: err?.message });
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      const res = await fetch(`/api/v1/qrs/${archiveTarget.id}`, {
        method: "DELETE",
        headers: orgSlug ? { "x-organization-slug": orgSlug } : undefined,
      });

      if (!res.ok) throw new Error("Could not archive QR");

      toast.success("QR archived", {
        description: `${archiveTarget.name} has been moved to archive`,
      });
      fetchQrs();
    } catch (err: any) {
      toast.error("Archive failed", { description: err?.message });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/v1/qrs/${deleteTarget.id}?hard=true`, {
        method: "DELETE",
        headers: orgSlug ? { "x-organization-slug": orgSlug } : undefined,
      });

      if (!res.ok) throw new Error("Could not delete QR");

      toast.success("QR deleted", {
        description: `${deleteTarget.name} was permanently removed`,
      });
      fetchQrs();
    } catch (err: any) {
      toast.error("Delete failed", { description: err?.message });
    }
  };

  const handleConfirmDuplicate = async (newName: string) => {
    if (!duplicateTarget) return;
    try {
      const res = await fetch(`/api/v1/qrs/${duplicateTarget.id}/duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) throw new Error("Could not duplicate QR");

      toast.success("QR duplicated", {
        description: `Created clone: ${newName}`,
      });
      fetchQrs();
    } catch (err: any) {
      toast.error("Duplicate failed", { description: err?.message });
    }
  };

  const handleConfirmMove = async (campaignId: string | null) => {
    if (!moveTarget) return;
    try {
      if (moveTarget.qrIds.length === 1) {
        const res = await fetch(`/api/v1/qrs/${moveTarget.qrIds[0]}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
          },
          body: JSON.stringify({ campaignId }),
        });
        if (!res.ok) throw new Error("Could not move QR");
      } else {
        const res = await fetch("/api/v1/qrs/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
          },
          body: JSON.stringify({
            qrIds: moveTarget.qrIds,
            action: "move_campaign",
            campaignId,
          }),
        });
        if (!res.ok) throw new Error("Could not move QRs");
      }

      toast.success("QR moved", {
        description: `Updated campaign assignment for ${moveTarget.count} QR(s)`,
      });
      handleClearSelection();
      fetchQrs();
    } catch (err: any) {
      toast.error("Move failed", { description: err?.message });
    }
  };

  // Bulk mutations
  const handleBulkAction = async (action: "pause" | "resume" | "archive" | "delete") => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      const res = await fetch("/api/v1/qrs/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
        },
        body: JSON.stringify({ qrIds: ids, action }),
      });

      if (!res.ok) throw new Error(`Bulk ${action} failed`);

      const json = await res.json();
      const count = json.data?.affectedCount || ids.length;

      const actionLabels = {
        pause: "paused",
        resume: "resumed",
        archive: "archived",
        delete: "deleted",
      };

      toast.success(`${count} QR codes ${actionLabels[action]}`);
      handleClearSelection();
      fetchQrs();
    } catch (err: any) {
      toast.error(`Bulk ${action} failed`, { description: err?.message });
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Workspace", href: `/${orgSlug}` },
          { label: "QR Codes" },
        ]}
        title="QR Codes"
        description="Create, organize and monitor every QR identity in this workspace."
        actions={
          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 sm:flex-initial justify-center gap-2 text-xs border-border/80 h-9 sm:h-8"
            >
              <Link href={`/${orgSlug}/qr/bulk`}>Bulk Create</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="flex-1 sm:flex-initial justify-center gap-1.5 text-xs bg-primary hover:bg-[#cc3a05] text-white font-medium shadow-xs h-9 sm:h-8"
            >
              <Link href={`/${orgSlug}/qr/studio?create=true`}>
                <Plus className="h-3.5 w-3.5" />
                <span>Create QR</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* 2. Operational Signal Strip */}
      <QrSignalStrip
        summary={summary}
        activeStatusFilter={statusFilter}
        onSelectStatusFilter={(st) => setStatusFilter(st)}
        filteredCount={items.length}
        isFiltered={isFiltered}
      />

      {/* 3. Bulk Selection Command Bar */}
      <QrSelectionBar
        selectedCount={selectedIds.size}
        onClearSelection={handleClearSelection}
        onBulkMove={() =>
          setMoveTarget({
            count: selectedIds.size,
            qrIds: Array.from(selectedIds),
          })
        }
        onBulkPause={() => handleBulkAction("pause")}
        onBulkResume={() => handleBulkAction("resume")}
        onBulkArchive={() => handleBulkAction("archive")}
        onBulkDelete={() => handleBulkAction("delete")}
        onBulkExport={() => toast.info("Bulk export will download active selections")}
      />

      {/* 4. Unified Command Bar */}
      <QrCommandBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        campaignFilter={campaignFilter}
        onCampaignFilterChange={setCampaignFilter}
        ownerFilter={ownerFilter}
        onOwnerFilterChange={setOwnerFilter}
        onOpenAdvancedFilters={() => setIsFilterSheetOpen(true)}
        activeFilterCount={activeFilterCount}
        sortBy={sortBy}
        order={order}
        onSortChange={(by, ord) => {
          setSortBy(by);
          setOrder(ord);
        }}
        columns={columns}
        onToggleColumn={handleToggleColumn}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchQrs(true)}
        campaigns={campaigns}
        members={members}
      />

      {/* 5. Active Filter Chips */}
      <QrActiveFilters
        filters={{
          status: statusFilter,
          qrType: typeFilter,
          campaignId: campaignFilter,
          campaignName: campaigns.find((c) => c.id === campaignFilter)?.name,
          ownerId: ownerFilter,
          ownerName: members.find((m) => m.id === ownerFilter)?.name,
          search: debouncedSearch,
        }}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* 6. Primary Data Surface */}
      {isLoading ? (
        <div className="rounded-xl border border-border/80 bg-white dark:bg-[#141414] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center gap-4 py-3 border-b border-border/50">
                <Skeleton className="h-4 w-4 rounded-xs" />
                <Skeleton className="h-11 w-11 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <QrEmptyState
          type="error"
          orgSlug={orgSlug}
          errorMessage={error}
          onRetry={() => fetchQrs(true)}
        />
      ) : summary.total === 0 && !isFiltered ? (
        <QrEmptyState type="zero" orgSlug={orgSlug} />
      ) : items.length === 0 && isFiltered ? (
        <QrEmptyState
          type="filtered"
          orgSlug={orgSlug}
          onClearFilters={handleClearAllFilters}
        />
      ) : viewMode === "table" ? (
        <QrTable
          items={items}
          orgSlug={orgSlug}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          columns={columns}
          onInspect={setInspectorQr}
          onDuplicate={setDuplicateTarget}
          onMove={(qr) =>
            setMoveTarget({
              count: 1,
              qrIds: [qr.id],
              currentCampaignId: qr.campaignId,
            })
          }
          onDownload={setDownloadTarget}
          onPauseResume={setPauseTarget}
          onArchive={setArchiveTarget}
          onDelete={setDeleteTarget}
        />
      ) : (
        <QrGrid
          items={items}
          orgSlug={orgSlug}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onInspect={setInspectorQr}
          onDuplicate={setDuplicateTarget}
          onMove={(qr) =>
            setMoveTarget({
              count: 1,
              qrIds: [qr.id],
              currentCampaignId: qr.campaignId,
            })
          }
          onDownload={setDownloadTarget}
          onPauseResume={setPauseTarget}
          onArchive={setArchiveTarget}
          onDelete={setDeleteTarget}
        />
      )}

      {/* 7. Advanced Filter Sheet */}
      <QrFilterSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        filters={{
          status: statusFilter,
          qrType: typeFilter,
          campaignId: campaignFilter,
          ownerId: ownerFilter,
          sortBy,
          order,
        }}
        campaigns={campaigns}
        members={members}
        onApply={(f) => {
          setStatusFilter(f.status);
          setTypeFilter(f.qrType);
          setCampaignFilter(f.campaignId);
          setOwnerFilter(f.ownerId);
          if (f.sortBy) setSortBy(f.sortBy);
          if (f.order) setOrder(f.order);
        }}
        onReset={handleClearAllFilters}
      />

      {/* 8. Quick Inspector Sheet */}
      <QrInspectorSheet
        open={Boolean(inspectorQr)}
        onOpenChange={(open) => !open && setInspectorQr(null)}
        qr={inspectorQr}
        orgSlug={orgSlug}
        onEdit={(qr) => setInspectorQr(null)}
        onDownload={(qr) => {
          setInspectorQr(null);
          setDownloadTarget(qr);
        }}
        onPauseResume={(qr) => {
          setInspectorQr(null);
          setPauseTarget(qr);
        }}
        onArchive={(qr) => {
          setInspectorQr(null);
          setArchiveTarget(qr);
        }}
        onDelete={(qr) => {
          setInspectorQr(null);
          setDeleteTarget(qr);
        }}
      />

      {/* 9. Dialogs */}
      {pauseTarget && (
        <PauseQrDialog
          open={Boolean(pauseTarget)}
          onOpenChange={(open) => !open && setPauseTarget(null)}
          qrName={pauseTarget.name}
          isPaused={pauseTarget.status === "PAUSED"}
          onConfirm={handleConfirmPauseResume}
        />
      )}

      {archiveTarget && (
        <ArchiveQrDialog
          open={Boolean(archiveTarget)}
          onOpenChange={(open) => !open && setArchiveTarget(null)}
          qrName={archiveTarget.name}
          onConfirm={handleConfirmArchive}
        />
      )}

      {deleteTarget && (
        <DeleteQrDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          qrName={deleteTarget.name}
          isActive={deleteTarget.status === "ACTIVE"}
          onConfirm={handleConfirmDelete}
        />
      )}

      {duplicateTarget && (
        <DuplicateQrDialog
          open={Boolean(duplicateTarget)}
          onOpenChange={(open) => !open && setDuplicateTarget(null)}
          originalName={duplicateTarget.name}
          onConfirm={handleConfirmDuplicate}
        />
      )}

      {moveTarget && (
        <MoveQrDialog
          open={Boolean(moveTarget)}
          onOpenChange={(open) => !open && setMoveTarget(null)}
          targetCount={moveTarget.count}
          campaigns={campaigns}
          currentCampaignId={moveTarget.currentCampaignId}
          onConfirm={handleConfirmMove}
        />
      )}

      {downloadTarget && (
        <DownloadQrDialog
          open={Boolean(downloadTarget)}
          onOpenChange={(open) => !open && setDownloadTarget(null)}
          qrName={downloadTarget.name}
          slug={downloadTarget.slug}
          destinationUrl={downloadTarget.destinationUrl}
          design={downloadTarget.design}
        />
      )}
    </div>
  );
}
