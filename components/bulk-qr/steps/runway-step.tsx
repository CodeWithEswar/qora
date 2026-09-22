"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

interface RunwayStepProps {
  batch: BulkBatchEntity;
  onComplete: (updatedBatch: BulkBatchEntity) => void;
  onCancel: () => void;
}

export function RunwayStep({ batch: initialBatch, onComplete, onCancel }: RunwayStepProps) {
  const [batch, setBatch] = useState<BulkBatchEntity>(initialBatch);
  const [isProcessing, setIsProcessing] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const cancelRequestedRef = useRef(false);
  const isRunningRef = useRef(false);

  // Execute processing loop in chunks of 25 rows
  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (isRunningRef.current) {
      return;
    }
    isRunningRef.current = true;
    cancelRequestedRef.current = false;

    const controller = new AbortController();

    async function runProcessingLoop() {
      try {
        let currentBatch = initialBatch;

        while (
          !controller.signal.aborted &&
          !cancelRequestedRef.current &&
          currentBatch.processed_rows < currentBatch.total_rows &&
          currentBatch.status !== "CANCELLED" &&
          currentBatch.status !== "COMPLETED" &&
          currentBatch.status !== "PARTIALLY_COMPLETED"
        ) {
          const res = await fetch(
            `/api/v1/bulk/batches/${currentBatch.id}/process?chunkSize=25`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
            }
          );

          if (controller.signal.aborted) break;

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            toast.error(errData?.error?.message || "Chunk processing encountered an error.");
            break;
          }

          const raw = await res.json();
          const data = raw?.data ?? raw;
          if (data?.batch) {
            currentBatch = data.batch;
          } else if (data) {
            currentBatch = {
              ...currentBatch,
              status: data.batchStatus || currentBatch.status,
              processed_rows: data.processedCount ?? currentBatch.processed_rows,
              created_rows: data.createdCount ?? currentBatch.created_rows,
              failed_rows: data.failedCount ?? currentBatch.failed_rows,
            };
          }

          if (!controller.signal.aborted) {
            setBatch(currentBatch);
          }

          if (data?.isComplete) {
            break;
          }

          // Small 250ms yield between chunks to keep browser UI reactive
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

        if (!controller.signal.aborted) {
          setIsProcessing(false);
          onComplete(currentBatch);
        }
      } catch (err: any) {
        if (err?.name === "AbortError" || controller.signal.aborted) {
          return;
        }
        console.error("Batch processing error:", err);
        setIsProcessing(false);
        toast.error("Batch execution halted due to connection disruption.");
      } finally {
        isRunningRef.current = false;
      }
    }

    runProcessingLoop();

    return () => {
      controller.abort();
      cancelRequestedRef.current = true;
      isRunningRef.current = false;
    };
  }, [initialBatch.id]);

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    cancelRequestedRef.current = true;
    try {
      const res = await fetch(`/api/v1/bulk/batches/${batch.id}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        toast.info("Batch cancelled. Created assets have been preserved.");
        onCancel();
      } else {
        toast.error("Failed to cancel batch.");
      }
    } catch {
      toast.error("Network error cancelling batch.");
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const progressPercent =
    batch.total_rows > 0
      ? Math.round((batch.processed_rows / batch.total_rows) * 100)
      : 0;

  const remaining = Math.max(0, batch.total_rows - batch.processed_rows);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Signature Batch Runway Visualization */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 sm:p-10 backdrop-blur-xl shadow-xl relative overflow-hidden">
        {/* Subtle top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />

        {/* Animated ambient pulse if processing */}
        {isProcessing && (
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        )}

        {/* Pipeline Rail Header */}
        <div className="flex items-center justify-between text-xs font-mono tracking-wider uppercase text-muted-foreground border-b border-border/80 pb-6 mb-8">
          <div className="flex items-center gap-2 text-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>SOURCE READY</span>
          </div>
          <Icon icon="lucide:arrow-right" className="w-4 h-4 text-neutral-600" />
          <div className="flex items-center gap-2 text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>VALIDATED</span>
          </div>
          <Icon icon="lucide:arrow-right" className="w-4 h-4 text-neutral-600" />
          <div className="flex items-center gap-2 text-orange-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span>RUNWAY PROCESSING</span>
          </div>
          <Icon icon="lucide:arrow-right" className="w-4 h-4 text-neutral-600" />
          <div className="flex items-center gap-2 text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-neutral-700" />
            <span>FINAL OUTCOME</span>
          </div>
        </div>

        {/* Central Progress Runway */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold block">
                Batch Asset Ingestion Runway
              </span>
              <h3 className="text-2xl font-bold text-neutral-100 font-serif mt-1">
                {batch.name || "Bulk QR Ingestion"}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold font-mono text-neutral-100">
                {progressPercent}%
              </span>
              <span className="text-xs font-mono text-neutral-500 block">
                {batch.processed_rows} of {batch.total_rows} rows
              </span>
            </div>
          </div>

          {/* Real progress bar */}
          <div className="h-4 bg-neutral-900 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-300 relative overflow-hidden"
              style={{ width: `${Math.min(100, Math.max(2, progressPercent))}%` }}
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px] animate-[move-stripe_1s_linear_infinite]" />
              )}
            </div>
          </div>

          {/* Real Metrics Ticker */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 text-center">
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                Created Assets
              </span>
              <span className="text-2xl font-bold font-mono text-neutral-100">
                {batch.created_rows}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 block mb-1">
                Row Failures
              </span>
              <span className="text-2xl font-bold font-mono text-neutral-100">
                {batch.failed_rows}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                Remaining
              </span>
              <span className="text-2xl font-bold font-mono text-neutral-100">
                {remaining}
              </span>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <Icon icon="lucide:server" className="w-3.5 h-3.5 text-orange-400" />
            <span>Authoritative Supabase & Cloudflare Edge Sync Active</span>
          </div>

          {isProcessing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-mono"
            >
              <Icon icon="lucide:x-circle" className="w-3.5 h-3.5 mr-1.5" />
              Cancel Batch
            </Button>
          )}
        </div>
      </div>

      {/* Cancel batch alert dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-surface border-border text-foreground max-w-md">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-2">
              <Icon icon="lucide:alert-octagon" className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-neutral-100 font-serif">
              Stop this batch job?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-neutral-400 space-y-2">
              <p>
                Rows already created (<strong>{batch.created_rows}</strong> QR assets)
                will remain permanently saved in your organization.
              </p>
              <p>
                Rows that have not yet started will be cancelled. This does not
                delete successfully created assets.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="border-white/10">
              Continue Processing
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelling}
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-500 text-white font-medium"
            >
              {isCancelling ? "Cancelling..." : "Stop Batch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
