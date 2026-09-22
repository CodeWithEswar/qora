"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BulkBatchEntity } from "@/lib/domains/bulk-qr";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";

interface BatchHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBatch?: (batch: BulkBatchEntity) => void;
}

export function BatchHistorySheet({
  isOpen,
  onClose,
  onSelectBatch,
}: BatchHistorySheetProps) {
  const [batches, setBatches] = useState<BulkBatchEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetBatch, setDeleteTargetBatch] = useState<BulkBatchEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    async function loadBatches() {
      try {
        const res = await fetch("/api/v1/bulk/batches");
        if (res.ok) {
          const raw = await res.json();
          const data = raw?.data ?? raw;
          if (isMounted && data?.batches) {
            setBatches(data.batches);
          }
        }
      } catch (err) {
        console.error("Failed to load batches:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBatches();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleDeleteBatchHistory = async () => {
    if (!deleteTargetBatch) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/bulk/batches/${deleteTargetBatch.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBatches((prev) => prev.filter((b) => b.id !== deleteTargetBatch.id));
        toast.success("Batch history record removed. All created QR assets remain preserved.");
      } else {
        toast.error("Failed to delete batch history.");
      }
    } catch {
      toast.error("Network error deleting batch history.");
    } finally {
      setIsDeleting(false);
      setDeleteTargetBatch(null);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl bg-surface border-border text-foreground p-0 flex flex-col h-full"
        >
          {/* Header */}
          <div className="p-6 border-b border-border bg-surface-elevated/40">
            <SheetHeader>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:history" className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Audit Trail
                </span>
              </div>
              <SheetTitle className="text-lg font-serif">Batch Operations History</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Log of all previous bulk QR creation jobs in your organization.
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading ? (
              <div className="py-16 text-center text-xs font-mono text-muted-foreground">
                Loading operation history...
              </div>
            ) : batches.length === 0 ? (
              /* Signature built-in empty state with animated QR monogram */
              <div className="py-12">
                <EmptyState
                  preset="batchHistory"
                  variant="card"
                  className="w-full"
                />
              </div>
            ) : (
              batches.map((b) => {
                const isCompleted = b.status === "COMPLETED";
                const isProcessing = b.status === "PROCESSING";
                const isFailed = b.status === "FAILED";
                const isCancelled = b.status === "CANCELLED";

                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-border/80 bg-surface/60 hover:border-primary/40 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {b.name || "Bulk QR Asset Job"}
                        </h4>
                        <span className="text-[11px] font-mono text-muted-foreground block">
                          ID: {b.id.slice(0, 8)} •{" "}
                          {new Date(b.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-2 py-0.5 ${
                          isCompleted
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : isProcessing
                            ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                            : isFailed
                            ? "border-red-500/30 bg-red-500/10 text-red-400"
                            : "border-white/10 text-neutral-400"
                        }`}
                      >
                        {b.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-muted/40 p-2.5 rounded-lg border border-border/60">
                      <div>
                        <span className="text-muted-foreground text-[10px] block">Total</span>
                        <span className="text-foreground font-bold">{b.total_rows}</span>
                      </div>
                      <div>
                        <span className="text-emerald-500 text-[10px] block">Created</span>
                        <span className="text-emerald-500 font-bold">{b.created_rows}</span>
                      </div>
                      <div>
                        <span className="text-red-400 text-[10px] block">Failed</span>
                        <span className="text-red-400 font-bold">{b.failed_rows}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/api/v1/bulk/batches/${b.id}/export`, "_blank")}
                          className="h-7 text-xs text-foreground/80 hover:text-foreground hover:bg-muted"
                        >
                          <Icon icon="lucide:download" className="w-3.5 h-3.5 mr-1 text-primary" />
                          CSV
                        </Button>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTargetBatch(b)}
                          className="h-7 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete batch alert dialog */}
      <AlertDialog
        open={!!deleteTargetBatch}
        onOpenChange={(open) => !open && setDeleteTargetBatch(null)}
      >
        <AlertDialogContent className="bg-surface border-border text-foreground max-w-md">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-2">
              <Icon icon="lucide:trash-2" className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-neutral-100 font-serif">
              Delete Batch Operation Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-neutral-400 space-y-2">
              <p>
                This action only deletes the operational audit log and temporary import row records.
              </p>
              <p>
                <strong>STRICT CASCADE SAFETY:</strong> Successfully created QR assets
                and published redirect routes are <strong>never</strong> deleted.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="border-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDeleteBatchHistory}
              className="bg-red-600 hover:bg-red-500 text-white font-medium"
            >
              {isDeleting ? "Deleting..." : "Delete Log"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
