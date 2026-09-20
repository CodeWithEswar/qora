"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { FileSummaryV1, AssetPulseMetricsV1 } from "@nxtqr/contracts";
import { FilesHeader } from "./files-header";
import { AssetPulse } from "./asset-pulse";
import { FilesToolbar } from "./files-toolbar";
import { FilesActiveChips } from "./files-active-chips";
import { AssetField } from "./asset-field";
import { FileList } from "./file-list";
import { FileInspector } from "./inspector/file-inspector";
import { UploadDialog } from "./upload/upload-dialog";
import { RenameFileDialog } from "./dialogs/rename-file-dialog";
import { ReplaceFileDialog } from "./dialogs/replace-file-dialog";
import { FileUsageDialog } from "./dialogs/file-usage-dialog";
import { DeleteFileAlert } from "./dialogs/delete-file-alert";
import { FilesEmpty } from "./states/files-empty";
import { FilesFilteredEmpty } from "./states/files-filtered-empty";
import { FilesError } from "./states/files-error";
import { FilesSkeleton } from "./states/files-skeleton";
import { toast } from "sonner";

interface FilesPageClientProps {
  orgSlug: string;
  initialFiles: FileSummaryV1[];
  initialTotal: number;
  initialPulse: AssetPulseMetricsV1;
}

export function FilesPageClient({
  orgSlug,
  initialFiles,
  initialTotal,
  initialPulse,
}: FilesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL State
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "ALL";
  const usage = searchParams.get("usage") || "all";
  const sortBy = searchParams.get("sortBy") || "updatedAt";
  const viewMode = (searchParams.get("view") as "grid" | "list") || "grid";

  // Data State
  const [files, setFiles] = useState<FileSummaryV1[]>(initialFiles);
  const [total, setTotal] = useState(initialTotal);
  const [pulse, setPulse] = useState<AssetPulseMetricsV1>(initialPulse);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Overlay / Dialog States
  const [selectedFile, setSelectedFile] = useState<FileSummaryV1 | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<FileSummaryV1 | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<FileSummaryV1 | null>(null);
  const [usageTarget, setUsageTarget] = useState<FileSummaryV1 | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileSummaryV1 | null>(null);

  // Helper to update URL params cleanly
  const updateQueryParam = useCallback(
    (key: string, value: string | null) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (!value || value === "ALL" || value === "all") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
      current.delete("page"); // reset pagination on filter change
      const search = current.toString();
      const query = search ? `?${search}` : "";
      startTransition(() => {
        router.push(`${pathname}${query}`);
      });
    },
    [pathname, router, searchParams]
  );

  // Fetch files when search params change
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams(Array.from(searchParams.entries())).toString();
      const res = await fetch(`/api/v1/organizations/${orgSlug}/files?${q}`);
      if (!res.ok) {
        throw new Error("Failed to load assets from Supabase");
      }
      const json = await res.json();
      setFiles(json.data || []);
      setTotal(json.meta?.total ?? 0);
      if (json.meta?.pulse) {
        setPulse(json.meta.pulse);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred loading files");
    } finally {
      setIsLoading(false);
    }
  }, [orgSlug, searchParams]);

  // Refetch when searchParams change (skipping first render if matches initial)
  useEffect(() => {
    refreshData();
  }, [searchParams, refreshData]);

  // Handlers for item interactions
  const handleSelect = (file: FileSummaryV1) => {
    setSelectedFile(file);
    setIsInspectorOpen(true);
  };

  const handlePreview = (file: FileSummaryV1) => {
    setSelectedFile(file);
    setIsInspectorOpen(true);
  };

  const handleRename = (file: FileSummaryV1) => {
    setRenameTarget(file);
  };

  const handleReplace = (file: FileSummaryV1) => {
    setReplaceTarget(file);
  };

  const handleViewUsage = (file: FileSummaryV1) => {
    setUsageTarget(file);
  };

  const handleArchive = async (file: FileSummaryV1) => {
    try {
      const isArchived = file.status === "ARCHIVED";
      const action = isArchived ? "restore" : "archive";
      const res = await fetch(`/api/v1/organizations/${orgSlug}/files/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error(`Could not ${action} file`);
      toast.success(isArchived ? "Asset restored" : "Asset archived");
      refreshData();
      if (selectedFile?.id === file.id) {
        setSelectedFile((prev) =>
          prev ? { ...prev, status: isArchived ? "READY" : "ARCHIVED" } : null
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update asset lifecycle");
    }
  };

  const handleDelete = (file: FileSummaryV1) => {
    setDeleteTarget(file);
  };

  const hasActiveFilters = Boolean(
    search || (category && category !== "ALL") || (usage && usage !== "all")
  );

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 select-none max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
      {/* 1. Header */}
      <FilesHeader
        orgSlug={orgSlug}
        onUploadClick={() => setIsUploadOpen(true)}
      />

      {/* 2. Asset Pulse operational metrics */}
      <AssetPulse metrics={pulse} />

      {/* 3. Operational Toolbar & Search */}
      <div className="space-y-3">
        <FilesToolbar
          search={search}
          onSearchChange={(val) => updateQueryParam("search", val || null)}
          category={category}
          onCategoryChange={(val) => updateQueryParam("category", val)}
          usage={usage}
          onUsageChange={(val) => updateQueryParam("usage", val)}
          sortBy={sortBy}
          onSortChange={(val) => updateQueryParam("sortBy", val)}
          viewMode={viewMode}
          onViewModeChange={(val) => updateQueryParam("view", val)}
        />

        {/* Filter Chips */}
        {hasActiveFilters && (
          <FilesActiveChips
            category={category}
            onClearCategory={() => updateQueryParam("category", null)}
            usage={usage}
            onClearUsage={() => updateQueryParam("usage", null)}
            search={search}
            onClearSearch={() => updateQueryParam("search", null)}
            onClearAll={clearAllFilters}
          />
        )}
      </div>

      {/* 4. Asset Field / List / Empty / Error Views */}
      {error ? (
        <FilesError error={error} onRetry={refreshData} />
      ) : isLoading ? (
        <FilesSkeleton viewMode={viewMode} />
      ) : files.length === 0 ? (
        hasActiveFilters ? (
          <FilesFilteredEmpty onClearFilters={clearAllFilters} />
        ) : (
          <FilesEmpty onUploadClick={() => setIsUploadOpen(true)} />
        )
      ) : viewMode === "grid" ? (
        <AssetField
          files={files}
          selectedFileId={selectedFile?.id || null}
          onSelect={handleSelect}
          onPreview={handlePreview}
          onRename={handleRename}
          onViewUsage={handleViewUsage}
          onReplace={handleReplace}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      ) : (
        <FileList
          files={files}
          selectedFileId={selectedFile?.id || null}
          onSelect={handleSelect}
          onPreview={handlePreview}
          onRename={handleRename}
          onViewUsage={handleViewUsage}
          onReplace={handleReplace}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      )}

      {/* 5. File Inspector Sheet (Desktop right drawer / mobile drawer) */}
      <FileInspector
        file={selectedFile}
        open={isInspectorOpen}
        onOpenChange={setIsInspectorOpen}
        orgSlug={orgSlug}
        onRename={handleRename}
        onReplace={handleReplace}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onViewUsage={handleViewUsage}
      />

      {/* 6. Upload Dialog Bay */}
      <UploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        orgSlug={orgSlug}
        onSuccess={refreshData}
      />

      {/* 7. Rename File Dialog */}
      <RenameFileDialog
        file={renameTarget}
        open={Boolean(renameTarget)}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        orgSlug={orgSlug}
        onSuccess={(updated) => {
          setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
          if (selectedFile?.id === updated.id) setSelectedFile(updated);
        }}
      />

      {/* 8. Replace File Dialog */}
      <ReplaceFileDialog
        file={replaceTarget}
        open={Boolean(replaceTarget)}
        onOpenChange={(open) => !open && setReplaceTarget(null)}
        orgSlug={orgSlug}
        onSuccess={(updated) => {
          setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
          if (selectedFile?.id === updated.id) setSelectedFile(updated);
          refreshData();
        }}
      />

      {/* 9. File Usage Dialog */}
      <FileUsageDialog
        file={usageTarget}
        open={Boolean(usageTarget)}
        onOpenChange={(open) => !open && setUsageTarget(null)}
        orgSlug={orgSlug}
      />

      {/* 10. Dependency-Aware Delete File Alert */}
      <DeleteFileAlert
        file={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        orgSlug={orgSlug}
        onSuccess={(deletedId) => {
          setFiles((prev) => prev.filter((f) => f.id !== deletedId));
          if (selectedFile?.id === deletedId) {
            setSelectedFile(null);
            setIsInspectorOpen(false);
          }
          refreshData();
        }}
        onViewUsage={(file) => setUsageTarget(file)}
        onArchive={handleArchive}
      />
    </div>
  );
}
