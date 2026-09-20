"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FolderResponseV1, FolderSummarySignal } from "@nxtqr/contracts";
import { FoldersHeader } from "./folders-header";
import { FoldersSummaryRibbon } from "./folders-summary-ribbon";
import { FoldersToolbar } from "./folders-toolbar";
import { FolderField } from "./folder-field";
import { FolderListView } from "./folder-list-view";
import { FoldersEmptyState } from "./states/folders-empty-state";
import { FoldersFilteredEmpty } from "./states/folders-filtered-empty";
import { FoldersSkeleton } from "./states/folders-skeleton";
import { CreateFolderDialog } from "./dialogs/create-folder-dialog";
import { EditFolderSheet } from "./sheets/edit-folder-sheet";
import { DeleteFolderAlert } from "./alerts/delete-folder-alert";
import { toast } from "sonner";

export interface FoldersWorkspaceProps {
  orgSlug: string;
}

export function FoldersWorkspace({ orgSlug }: FoldersWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state
  const urlSearch = searchParams.get("q") || "";
  const urlStatus = (searchParams.get("status") || "active") as "active" | "archived" | "all";
  const urlSort = (searchParams.get("sort") || "updatedAt") as "updatedAt" | "createdAt" | "name" | "qrCount";
  const urlOrder = (searchParams.get("order") || "desc") as "asc" | "desc";
  const urlView = (searchParams.get("view") || "field") as "field" | "list";

  // Data states
  const [folders, setFolders] = React.useState<FolderResponseV1[]>([]);
  const [summary, setSummary] = React.useState<FolderSummarySignal>({
    totalFolders: 0,
    totalFiledQrs: 0,
    totalUnfiledQrs: 0,
    activeFolders: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Local filter states
  const [search, setSearch] = React.useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = React.useState(urlSearch);
  const [statusFilter, setStatusFilter] = React.useState<"active" | "archived" | "all">(urlStatus);
  const [sortBy, setSortBy] = React.useState(urlSort);
  const [order, setOrder] = React.useState(urlOrder);
  const [viewMode, setViewMode] = React.useState<"field" | "list">(urlView);

  // Dialog & Sheet states
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editFolder, setEditFolder] = React.useState<FolderResponseV1 | null>(null);
  const [deleteFolder, setDeleteFolder] = React.useState<FolderResponseV1 | null>(null);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync to URL
  const updateUrlParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      for (const [key, val] of Object.entries(updates)) {
        if (val === null || val === "" || (key === "status" && val === "active") || (key === "view" && val === "field")) {
          current.delete(key);
        } else {
          current.set(key, val);
        }
      }
      const qs = current.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Fetch real folders from authoritative Supabase API
  const fetchFolders = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        sortBy,
        order,
      });
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      params.set("orgSlug", orgSlug);
      const res = await fetch(`/api/v1/folders?${params.toString()}`, {
        headers: {
          "x-organization-slug": orgSlug,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to load folders.");
      }

      const items: FolderResponseV1[] = Array.isArray(data.data)
        ? data.data
        : (data.data?.items || []);
      setFolders(items);
      if (data.meta?.signal) {
        setSummary(data.meta.signal);
      }
    } catch (err: any) {
      setError(err.message || "Could not load folder collection.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortBy, order, debouncedSearch]);

  React.useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrlParams({ q: val ? val : null });
  };

  const handleStatusChange = (status: "active" | "archived" | "all") => {
    setStatusFilter(status);
    updateUrlParams({ status });
  };

  const handleSortChange = (
    newSort: "updatedAt" | "createdAt" | "name" | "qrCount",
    newOrder: "asc" | "desc"
  ) => {
    setSortBy(newSort);
    setOrder(newOrder);
    updateUrlParams({ sort: newSort, order: newOrder });
  };

  const handleViewChange = (mode: "field" | "list") => {
    setViewMode(mode);
    updateUrlParams({ view: mode });
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("active");
    setSortBy("updatedAt");
    setOrder("desc");
    updateUrlParams({ q: null, status: null, sort: null, order: null });
  };

  const handleArchiveToggle = async (folder: FolderResponseV1) => {
    const newStatus = folder.status === "archived" ? "active" : "archived";
    try {
      const res = await fetch(`/api/v1/folders/${folder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to change folder status.");
      toast.success(
        newStatus === "archived" ? `Folder "${folder.name}" archived.` : `Folder "${folder.name}" unarchived.`
      );
      fetchFolders();
    } catch (err: any) {
      toast.error(err.message || "Failed to update folder status.");
    }
  };

  const hasActiveFilters = Boolean(search.trim()) || statusFilter !== "active";

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header */}
      <FoldersHeader
        orgSlug={orgSlug}
        onNewFolder={() => setCreateOpen(true)}
      />

      {/* 2. Real Relational Summary Ribbon */}
      <FoldersSummaryRibbon
        summary={summary}
        orgSlug={orgSlug}
      />

      {/* 3. Toolbar */}
      <FoldersToolbar
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusChange}
        sortBy={sortBy}
        order={order}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={handleViewChange}
        onResetFilters={handleResetFilters}
        activeFilterCount={hasActiveFilters ? 1 : 0}
      />

      {/* 4. Content Area */}
      {loading ? (
        <FoldersSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <button
            onClick={fetchFolders}
            className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
          >
            Try reloading spaces
          </button>
        </div>
      ) : folders.length === 0 && !hasActiveFilters ? (
        /* Zero Folders Empty State: custom QrEmptyMonogram 'F' */
        <FoldersEmptyState
          unfiledQrsCount={summary.totalUnfiledQrs}
          orgSlug={orgSlug}
          onCreateFolder={() => setCreateOpen(true)}
        />
      ) : folders.length === 0 && hasActiveFilters ? (
        /* Filtered Empty State */
        <FoldersFilteredEmpty
          search={search}
          onClearFilters={handleResetFilters}
        />
      ) : viewMode === "field" ? (
        /* Signature Folder Field (Containment Grid) */
        <FolderField
          folders={folders}
          unfiledQrsCount={summary.totalUnfiledQrs}
          orgSlug={orgSlug}
          onEdit={(f) => setEditFolder(f)}
          onDelete={(f) => setDeleteFolder(f)}
          onArchiveToggle={handleArchiveToggle}
        />
      ) : (
        /* Dense Table List View */
        <FolderListView
          folders={folders}
          orgSlug={orgSlug}
          onEdit={(f) => setEditFolder(f)}
          onDelete={(f) => setDeleteFolder(f)}
          onArchiveToggle={handleArchiveToggle}
        />
      )}

      {/* Create Dialog */}
      <CreateFolderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        orgSlug={orgSlug}
        onCreated={() => {
          fetchFolders();
        }}
      />

      {/* Edit Sheet */}
      <EditFolderSheet
        folder={editFolder}
        open={Boolean(editFolder)}
        onOpenChange={(open) => !open && setEditFolder(null)}
        orgSlug={orgSlug}
        onUpdated={fetchFolders}
      />

      {/* Delete Alert */}
      <DeleteFolderAlert
        folder={deleteFolder}
        open={Boolean(deleteFolder)}
        onOpenChange={(open) => !open && setDeleteFolder(null)}
        orgSlug={orgSlug}
        onDeleted={fetchFolders}
      />
    </div>
  );
}
