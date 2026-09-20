"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderResponseV1 } from "@nxtqr/contracts";
import { getFolderAccent } from "../../folder-accents";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface MoveToFolderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrIds: string[];
  currentFolderId?: string | null;
  orgSlug?: string;
  onMoved?: () => void;
}

export function MoveToFolderSheet({
  open,
  onOpenChange,
  qrIds,
  currentFolderId,
  orgSlug,
  onMoved,
}: MoveToFolderSheetProps) {
  const [folders, setFolders] = React.useState<FolderResponseV1[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedTargetId, setSelectedTargetId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    setSelectedTargetId(null);
    setSearch("");
    setLoading(true);

    const url = `/api/v1/folders?status=active&limit=100${orgSlug ? `&orgSlug=${orgSlug}` : ""}`;
    fetch(url, {
      headers: {
        ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data.data) ? data.data : (data.data?.items || []);
        setFolders(items);
      })
      .catch((err) => console.error("Failed to load folders for move:", err))
      .finally(() => setLoading(false));
  }, [open, orgSlug]);

  const filteredFolders = React.useMemo(() => {
    if (!search.trim()) return folders;
    const q = search.toLowerCase().trim();
    return folders.filter((f) => f.name.toLowerCase().includes(q));
  }, [folders, search]);

  const handleMove = async () => {
    if (qrIds.length === 0) return;
    setIsSubmitting(true);

    try {
      const targetEndpoint = selectedTargetId
        ? `/api/v1/folders/${selectedTargetId}/move`
        : `/api/v1/folders/unfiled/move`;

      const res = await fetch(targetEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
        },
        body: JSON.stringify({ qrIds, targetFolderId: selectedTargetId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to move QR codes.");
      }

      toast.success(
        selectedTargetId
          ? `${qrIds.length} QR assets moved to folder.`
          : `${qrIds.length} QR assets moved to Unfiled.`
      );
      onOpenChange(false);
      onMoved?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to move QR codes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <SheetHeader className="text-left space-y-1 pb-3 border-b border-border/60">
            <SheetTitle className="text-lg font-bold font-serif text-foreground">
              Move to Folder
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Assign {qrIds.length === 1 ? "this QR asset" : `${qrIds.length} QR assets`} to a focused workspace.
            </SheetDescription>
          </SheetHeader>

          {/* Search Input */}
          <div className="relative">
            <NxtqrIcon
              icon="solar:magnifer-linear"
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search folders..."
              className="h-8 pl-8 text-xs bg-muted/30 dark:bg-muted/10"
            />
          </div>

          <ScrollArea className="h-[360px] pr-2">
            <div className="space-y-1.5">
              {/* Option 1: Unfiled (Default / Remove from folder) */}
              <button
                type="button"
                onClick={() => setSelectedTargetId(null)}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors cursor-pointer",
                  selectedTargetId === null
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border/60 hover:bg-neutral-50 dark:hover:bg-white/[0.02] text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📂</span>
                  <div>
                    <div className="text-xs font-semibold">Unfiled Space</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Remove from current folder
                    </div>
                  </div>
                </div>
                {selectedTargetId === null && (
                  <NxtqrIcon icon="solar:check-circle-bold" size={16} className="text-primary" />
                )}
              </button>

              {/* Folder list */}
              {loading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Loading folder spaces...
                </div>
              ) : filteredFolders.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No matching folders found.
                </div>
              ) : (
                filteredFolders.map((f) => {
                  const accent = getFolderAccent(f.accentKey);
                  const isCurrent = currentFolderId === f.id;
                  const isSelected = selectedTargetId === f.id;

                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedTargetId(f.id)}
                      disabled={isCurrent}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : isCurrent
                          ? "border-border/40 opacity-50 cursor-not-allowed bg-muted/20"
                          : "border-border/60 hover:bg-neutral-50 dark:hover:bg-white/[0.02] text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg">{f.emoji || "📁"}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                            <span className="truncate">{f.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono uppercase bg-muted/80 px-1 rounded-xs">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: accent.dotColor }}
                            />
                            <span>{f.qrCount} assets</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <NxtqrIcon
                          icon="solar:check-circle-bold"
                          size={16}
                          className="text-primary shrink-0"
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <SheetFooter className="pt-4 border-t border-border/60 flex flex-row items-center justify-end gap-2">
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
            onClick={handleMove}
            size="sm"
            disabled={isSubmitting || (selectedTargetId === null && currentFolderId === null)}
            className="text-xs h-8 font-medium cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <NxtqrIcon icon="solar:restart-linear" size={13} className="animate-spin" />
                <span>Moving...</span>
              </>
            ) : (
              <span>Confirm Move</span>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
