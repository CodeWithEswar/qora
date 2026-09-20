"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderQrAssetV1 } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface AddQrDialogProps {
  folderId: string;
  folderName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug?: string;
  onAdded?: () => void;
}

export function AddQrDialog({
  folderId,
  folderName,
  open,
  onOpenChange,
  orgSlug,
  onAdded,
}: AddQrDialogProps) {
  const [candidates, setCandidates] = React.useState<FolderQrAssetV1[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sourceFilter, setSourceFilter] = React.useState<"all" | "unfiled" | "other">("all");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    setSelectedIds([]);
    setSearch("");
    setLoading(true);

    // Fetch candidate QR codes from API
    const qrsUrl = `/api/v1/qrs?limit=100${orgSlug ? `&orgSlug=${orgSlug}` : ""}`;
    fetch(qrsUrl, {
      headers: {
        ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const rawList = Array.isArray(data.data) ? data.data : (data.data?.items || []);
        const items = rawList.map((q: any) => ({
          id: q.id,
          slug: q.slug,
          name: q.name,
          qrType: q.qrType || "url",
          isDynamic: q.isDynamic ?? true,
          status: q.status,
          destinationUrl: q.destinationUrl || "",
          totalScans: q.totalScans || 0,
          uniqueScans: q.uniqueScans || 0,
          currentFolderId: q.folderId || null,
          currentFolderName: q.folderName || null,
          updatedAt: q.updatedAt,
        }));
        // Filter out QRs already in this folder
        setCandidates(items.filter((q: FolderQrAssetV1) => q.currentFolderId !== folderId));
      })
      .catch((err) => {
        console.error("Failed to load QR candidates:", err);
      })
      .finally(() => setLoading(false));
  }, [open, folderId, orgSlug]);

  const filteredCandidates = React.useMemo(() => {
    return candidates.filter((qr) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches = qr.name.toLowerCase().includes(q) || qr.slug.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (sourceFilter === "unfiled") {
        return !qr.currentFolderId;
      }
      if (sourceFilter === "other") {
        return Boolean(qr.currentFolderId);
      }
      return true;
    });
  }, [candidates, search, sourceFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Re-assignment warning detection
  const movingFromOtherCount = selectedIds.filter((id) => {
    const item = candidates.find((c) => c.id === id);
    return Boolean(item?.currentFolderId);
  }).length;

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/folders/${folderId}/move`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
        },
        body: JSON.stringify({
          qrIds: selectedIds,
          targetFolderId: folderId === "unfiled" ? null : folderId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to add QR codes to folder.");
      }

      toast.success(
        `${selectedIds.length} QR ${selectedIds.length === 1 ? "code" : "codes"} added to ${folderName}.`
      );
      onOpenChange(false);
      onAdded?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to move QR codes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-[#18181B] border-border/80 p-0 overflow-hidden shadow-xl">
        <DialogHeader className="p-5 pb-3 border-b border-border/60">
          <DialogTitle className="text-lg font-bold font-serif text-foreground">
            Add QR Codes to {folderName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select existing workspace QR codes to organize into this folder space.
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar: Search + Source Filters */}
        <div className="p-4 pb-2 border-b border-border/60 flex items-center gap-2">
          <div className="relative flex-1">
            <NxtqrIcon
              icon="solar:magnifer-linear"
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search QR codes..."
              className="h-8 pl-8 text-xs bg-muted/30 dark:bg-muted/10"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setSourceFilter("all")}
              className={cn(
                "px-2 py-1 rounded-md font-mono text-[11px] transition-colors cursor-pointer",
                sourceFilter === "all"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("unfiled")}
              className={cn(
                "px-2 py-1 rounded-md font-mono text-[11px] transition-colors cursor-pointer",
                sourceFilter === "unfiled"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Unfiled
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("other")}
              className={cn(
                "px-2 py-1 rounded-md font-mono text-[11px] transition-colors cursor-pointer",
                sourceFilter === "other"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Other Folders
            </button>
          </div>
        </div>

        {/* Reassignment Warning Banner */}
        {movingFromOtherCount > 0 && (
          <div className="mx-4 mt-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-2">
            <NxtqrIcon icon="solar:info-circle-bold" size={14} className="shrink-0" />
            <span>
              {movingFromOtherCount === 1
                ? "1 selected QR code is currently in another folder and will be moved here."
                : `${movingFromOtherCount} selected QR codes are currently in other folders and will be moved here.`}
            </span>
          </div>
        )}

        {/* QR List */}
        <ScrollArea className="h-[280px] p-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
              <NxtqrIcon icon="solar:restart-linear" size={16} className="animate-spin mx-auto" />
              <p>Scanning QR assets...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No matching QR codes found.
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredCandidates.map((qr) => {
                const isSelected = selectedIds.includes(qr.id);

                return (
                  <div
                    key={qr.id}
                    onClick={() => toggleSelect(qr.id)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg border transition-colors cursor-pointer",
                      isSelected
                        ? "border-primary/50 bg-primary/[0.04] dark:bg-primary/[0.08]"
                        : "border-border/60 hover:bg-neutral-50 dark:hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(qr.id)}
                        aria-label={`Select ${qr.name}`}
                      />
                      <span className="text-sm font-mono text-primary">▦</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-foreground truncate">
                          {qr.name}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground truncate">
                          /{qr.slug}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                      {qr.currentFolderName ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-muted/60 text-muted-foreground"
                        >
                          In: {qr.currentFolderName}
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60">Unfiled</span>
                      )}
                      <Badge variant="outline" className="text-[9px] uppercase">
                        {qr.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-4 border-t border-border/60 flex items-center justify-between gap-2">
          <div className="text-xs font-mono text-muted-foreground">
            {selectedIds.length} {selectedIds.length === 1 ? "code" : "codes"} selected
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs h-8 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedIds.length === 0}
              className="text-xs h-8 font-medium cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <NxtqrIcon icon="solar:restart-linear" size={13} className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add {selectedIds.length} QR Codes</span>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
