"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FolderResponseV1,
  FolderPulseMetrics,
  FolderQrAssetV1,
} from "@nxtqr/contracts";
import { FolderDetailHeader } from "./folder-detail-header";
import { FolderPulse } from "./folder-pulse";
import { AssetField } from "./asset-field";
import { FolderAssetsTable } from "./folder-assets-table";
import { FolderAssetsMobileCards } from "./folder-assets-mobile-cards";
import { BulkActionBar } from "./bulk-action-bar";
import { AddQrDialog } from "./dialogs/add-qr-dialog";
import { MoveToFolderSheet } from "./sheets/move-to-folder-sheet";
import { EditFolderSheet } from "../sheets/edit-folder-sheet";
import { DeleteFolderAlert } from "../alerts/delete-folder-alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";

export interface FolderDetailWorkspaceProps {
  orgSlug: string;
  folderId: string;
}

export function FolderDetailWorkspace({
  orgSlug,
  folderId,
}: FolderDetailWorkspaceProps) {
  const router = useRouter();
  const isUnfiled = folderId === "unfiled";

  // Data states
  const [folder, setFolder] = React.useState<FolderResponseV1 | null>(null);
  const [pulse, setPulse] = React.useState<FolderPulseMetrics>({
    qrCount: 0,
    dynamicCount: 0,
    staticCount: 0,
    destinationCount: 0,
    scanCount: 0,
  });
  const [assets, setAssets] = React.useState<FolderQrAssetV1[]>([]);
  const [totalAssetCount, setTotalAssetCount] = React.useState(0);
  const [loadingFolder, setLoadingFolder] = React.useState(true);
  const [loadingAssets, setLoadingAssets] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<string>("assets");

  // Filter & Search states
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Dialog & Sheet states
  const [addQrOpen, setAddQrOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [moveSheetOpen, setMoveSheetOpen] = React.useState(false);
  const [movingQrIds, setMovingQrIds] = React.useState<string[]>([]);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // 1. Fetch Folder Metadata & Pulse
  const fetchFolderDetail = React.useCallback(async () => {
    setLoadingFolder(true);
    try {
      const res = await fetch(`/api/v1/folders/${folderId}?orgSlug=${orgSlug}`, {
        headers: { "x-organization-slug": orgSlug },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to load folder.");

      setFolder(data.data.folder);
      setPulse(data.data.pulse);
    } catch (err: any) {
      toast.error(err.message || "Failed to load folder details.");
    } finally {
      setLoadingFolder(false);
    }
  }, [folderId, orgSlug]);

  // 2. Fetch QR Assets inside this folder
  const fetchFolderAssets = React.useCallback(async () => {
    setLoadingAssets(true);
    try {
      const params = new URLSearchParams({ limit: "100", orgSlug });
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

      const res = await fetch(`/api/v1/folders/${folderId}/assets?${params.toString()}`, {
        headers: { "x-organization-slug": orgSlug },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to load assets.");

      const items: FolderQrAssetV1[] = Array.isArray(data.data)
        ? data.data
        : (data.data?.items || []);
      setAssets(items);
      setTotalAssetCount(data.page?.totalCount || data.meta?.pagination?.totalCount || items.length);
    } catch (err: any) {
      console.error("Failed to fetch folder assets:", err);
    } finally {
      setLoadingAssets(false);
    }
  }, [folderId, orgSlug, debouncedSearch]);

  React.useEffect(() => {
    fetchFolderDetail();
  }, [fetchFolderDetail]);

  React.useEffect(() => {
    fetchFolderAssets();
  }, [fetchFolderAssets]);

  const refreshAll = () => {
    fetchFolderDetail();
    fetchFolderAssets();
    setSelectedIds([]);
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? assets.map((a) => a.id) : []);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Individual Actions
  const handleSingleMove = (qr: FolderQrAssetV1) => {
    setMovingQrIds([qr.id]);
    setMoveSheetOpen(true);
  };

  const handleSingleRemove = async (qr: FolderQrAssetV1) => {
    try {
      const res = await fetch(`/api/v1/folders/${folderId}/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
        },
        body: JSON.stringify({ qrIds: [qr.id] }),
      });
      if (!res.ok) throw new Error("Failed to remove QR code.");

      toast.success(`"${qr.name}" moved to Unfiled.`);
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove QR code.");
    }
  };

  // Bulk Actions
  const handleBulkMove = () => {
    if (selectedIds.length === 0) return;
    setMovingQrIds(selectedIds);
    setMoveSheetOpen(true);
  };

  const handleBulkRemove = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch(`/api/v1/folders/${folderId}/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
        },
        body: JSON.stringify({ qrIds: selectedIds }),
      });
      if (!res.ok) throw new Error("Failed to remove QR codes.");

      toast.success(`${selectedIds.length} QR assets moved to Unfiled.`);
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to move QR codes.");
    }
  };

  const handleArchiveToggle = async () => {
    if (!folder) return;
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
      if (!res.ok) throw new Error("Failed to update status.");

      toast.success(
        newStatus === "archived" ? `Folder "${folder.name}" archived.` : `Folder "${folder.name}" unarchived.`
      );
      fetchFolderDetail();
    } catch (err: any) {
      toast.error(err.message || "Failed to update folder status.");
    }
  };

  if (loadingFolder && !folder) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
        <div className="h-10 w-48 bg-muted/60 rounded-md" />
        <div className="h-20 w-full bg-muted/40 rounded-xl" />
        <div className="h-64 w-full bg-muted/20 rounded-xl" />
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold font-serif">Folder Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested folder space does not exist or has been deleted.
        </p>
        <Button onClick={() => router.push(`/${orgSlug}/folders`)} size="sm">
          Return to Folders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* 1. Header */}
      <FolderDetailHeader
        folder={folder}
        orgSlug={orgSlug}
        isUnfiled={isUnfiled}
        onAddQr={() => setAddQrOpen(true)}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
        onArchiveToggle={handleArchiveToggle}
      />

      {/* 2. Operational Pulse Strip */}
      <FolderPulse pulse={pulse} />

      {/* 3. Tabbed Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pb-1 border-b border-border/60">
          <TabsList className="bg-muted/40 dark:bg-white/[0.04] p-0.5 w-full sm:w-auto flex overflow-x-auto no-scrollbar">
            <TabsTrigger value="assets" className="flex-1 sm:flex-initial text-xs gap-1.5 font-medium whitespace-nowrap px-2.5 sm:px-3">
              <NxtqrIcon icon="solar:list-linear" size={14} />
              <span>QR Assets ({pulse.qrCount})</span>
            </TabsTrigger>
            <TabsTrigger value="topology" className="flex-1 sm:flex-initial text-xs gap-1.5 font-medium whitespace-nowrap px-2.5 sm:px-3">
              <NxtqrIcon icon="solar:widget-linear" size={14} />
              <span>Asset Field</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 sm:flex-initial text-xs gap-1.5 font-medium whitespace-nowrap px-2.5 sm:px-3">
              <NxtqrIcon icon="solar:history-linear" size={14} />
              <span>Activity</span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Search within folder */}
          {activeTab === "assets" && (
            <div className="relative w-full sm:w-64">
              <NxtqrIcon
                icon="solar:magnifer-linear"
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets in space..."
                className="h-8.5 sm:h-8 pl-8 pr-7 text-xs bg-white dark:bg-[#18181B] border-border/80 w-full"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <NxtqrIcon icon="solar:close-circle-bold" size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab 1: QR Assets (Table + Mobile Cards) */}
        <TabsContent value="assets" className="space-y-4 outline-hidden mt-0">
          {loadingAssets ? (
            <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
              <NxtqrIcon icon="solar:restart-linear" size={18} className="animate-spin mx-auto text-primary" />
              <p>Loading folder assets...</p>
            </div>
          ) : assets.length === 0 && !search ? (
            <div className="rounded-xl border border-dashed border-border/80 dark:border-white/[0.08] p-6 sm:p-10 text-center bg-white/40 dark:bg-white/[0.01]">
              <span className="text-3xl mb-2 block">
                {folder.emoji || (isUnfiled ? "📂" : "📁")}
              </span>
              <h3 className="text-sm font-semibold text-foreground">
                {isUnfiled
                  ? "All QR assets are currently organized"
                  : `${folder.name} has no QR assets yet`}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {isUnfiled
                  ? "Every QR code in this organization is assigned to a workspace folder."
                  : "Add existing QR codes from Unfiled or move them from other spaces to organize them here."}
              </p>
              {!isUnfiled && (
                <Button
                  onClick={() => setAddQrOpen(true)}
                  size="sm"
                  className="mt-4 text-xs gap-1.5 cursor-pointer w-full sm:w-auto h-9"
                >
                  <NxtqrIcon icon="solar:add-circle-bold" size={14} />
                  <span>Add QR Codes</span>
                </Button>
              )}
            </div>
          ) : assets.length === 0 && search ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No QR assets match &quot;{search}&quot; in this folder.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <FolderAssetsTable
                  assets={assets}
                  selectedIds={selectedIds}
                  onSelectAll={handleSelectAll}
                  onToggleSelect={handleToggleSelect}
                  onMoveQr={handleSingleMove}
                  onRemoveQr={handleSingleRemove}
                  orgSlug={orgSlug}
                  isUnfiled={isUnfiled}
                />
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                <FolderAssetsMobileCards
                  assets={assets}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onMoveQr={handleSingleMove}
                  onRemoveQr={handleSingleRemove}
                  orgSlug={orgSlug}
                  isUnfiled={isUnfiled}
                />
              </div>
            </>
          )}
        </TabsContent>

        {/* Tab 2: Signature Asset Field (Topology Constellation) */}
        <TabsContent value="topology" className="outline-hidden mt-0">
          <AssetField
            assets={assets}
            orgSlug={orgSlug}
            folderName={folder.name}
            onAddQr={() => setAddQrOpen(true)}
          />
        </TabsContent>

        {/* Tab 3: Activity Feed */}
        <TabsContent value="activity" className="outline-hidden mt-0">
          <div className="rounded-xl border border-border/80 dark:border-white/[0.08] p-6 bg-white dark:bg-[#18181B] space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Space Audit & Event Log
            </h4>
            <div className="space-y-3 font-mono text-xs text-muted-foreground">
              <div className="flex items-start gap-3 pb-3 border-b border-border/40">
                <span className="text-primary font-bold">●</span>
                <div>
                  <div className="text-foreground font-medium">Folder workspace active</div>
                  <div className="text-[11px] text-muted-foreground">
                    Origin ID: {folder.id} • Tracked under tenant organization
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold">●</span>
                <div>
                  <div className="text-foreground font-medium">
                    {folder.qrCount} QR assets currently filed
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Containment status: Synchronized across PostgreSQL & Edge
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sticky Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onMove={handleBulkMove}
        onRemove={handleBulkRemove}
        onClear={() => setSelectedIds([])}
        isUnfiled={isUnfiled}
      />

      {/* Add QR Dialog */}
      <AddQrDialog
        folderId={folder.id}
        folderName={folder.name}
        open={addQrOpen}
        onOpenChange={setAddQrOpen}
        orgSlug={orgSlug}
        onAdded={refreshAll}
      />

      {/* Move To Folder Sheet */}
      <MoveToFolderSheet
        open={moveSheetOpen}
        onOpenChange={setMoveSheetOpen}
        qrIds={movingQrIds}
        currentFolderId={isUnfiled ? null : folder.id}
        orgSlug={orgSlug}
        onMoved={() => {
          refreshAll();
          setMovingQrIds([]);
        }}
      />

      {/* Edit Folder Sheet */}
      {!isUnfiled && (
        <EditFolderSheet
          folder={folder}
          open={editOpen}
          onOpenChange={setEditOpen}
          orgSlug={orgSlug}
          onUpdated={refreshAll}
        />
      )}

      {/* Delete Folder Alert */}
      {!isUnfiled && (
        <DeleteFolderAlert
          folder={folder}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          orgSlug={orgSlug}
          onDeleted={() => router.push(`/${orgSlug}/folders`)}
        />
      )}
    </div>
  );
}
