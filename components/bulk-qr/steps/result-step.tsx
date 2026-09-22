"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { BulkBatchEntity, BulkBatchRowEntity } from "@/lib/domains/bulk-qr";
import Link from "next/link";
import { toast } from "sonner";

interface ResultStepProps {
  batch: BulkBatchEntity;
  orgSlug: string;
  onRetry: () => void;
  onStartNew: () => void;
}

export function ResultStep({
  batch,
  orgSlug,
  onRetry,
  onStartNew,
}: ResultStepProps) {
  const [rows, setRows] = useState<BulkBatchRowEntity[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(true);
  const [showFailedSheet, setShowFailedSheet] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Fetch full row results for constellation and failed breakdown
  useEffect(() => {
    let isMounted = true;

    async function fetchBatchRows() {
      try {
        const res = await fetch(`/api/v1/bulk/batches/${batch.id}`);
        if (res.ok) {
          const raw = await res.json();
          const data = raw?.data ?? raw;
          if (isMounted && data?.rows) {
            setRows(data.rows);
          }
        }
      } catch (err) {
        console.error("Failed to load batch rows:", err);
      } finally {
        if (isMounted) setIsLoadingRows(false);
      }
    }

    fetchBatchRows();

    return () => {
      isMounted = false;
    };
  }, [batch.id]);

  const failedRows = rows.filter((r) => r.execution_status === "FAILED");

  // Handle retry of failed rows
  const handleRetryFailed = async () => {
    setIsRetrying(true);
    try {
      const res = await fetch(`/api/v1/bulk/batches/${batch.id}/retry`, {
        method: "POST",
      });
      const raw = await res.json();
      const data = raw?.data ?? raw;
      if (res.ok) {
        toast.success(`Enqueued ${data?.retriedCount ?? 0} failed rows for retry.`);
        onRetry();
      } else {
        toast.error(raw?.error?.message || "Failed to retry rows.");
      }
    } catch {
      toast.error("Network error triggering retry.");
    } finally {
      setIsRetrying(false);
    }
  };

  // Trigger CSV export download
  const handleExportCsv = () => {
    window.open(`/api/v1/bulk/batches/${batch.id}/export`, "_blank");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono uppercase tracking-wider">
          <Icon icon="lucide:check-check" className="w-3.5 h-3.5" />
          Batch Complete
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100 font-serif">
          Production Run Outcome
        </h2>
        <p className="text-xs text-neutral-400 max-w-md mx-auto">
          {batch.name || "Bulk QR Asset Batch"} has finished processing.
          All created assets are persistently registered in your organization.
        </p>
      </div>

      {/* Visual Outcome Map */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl relative overflow-hidden space-y-6">
        {/* Subtle top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />

        {/* Branching Result Tree */}
        <div className="flex flex-col items-center">
          <div className="px-4 py-1.5 rounded-lg border border-border/80 bg-muted/60 text-xs font-mono text-foreground">
            {batch.total_rows} Source Records Ingested
          </div>
          <div className="w-px h-6 bg-border/60" />
          <div className="w-1/2 h-px bg-border/60 relative">
            <div className="absolute left-0 top-0 w-px h-4 bg-border/60" />
            <div className="absolute right-0 top-0 w-px h-4 bg-border/60" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Branch: Created */}
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block">
              Successfully Created
            </span>
            <span className="text-3xl font-bold font-mono text-neutral-100">
              {batch.created_rows}
            </span>
            <span className="text-[11px] text-neutral-400 block">
              {batch.creation_mode === "PUBLISH"
                ? "Live & Published on Edge"
                : "Saved as Draft Revisions"}
            </span>
          </div>

          {/* Branch: Failed */}
          <div
            className={`p-5 rounded-xl border text-center space-y-1 ${
              batch.failed_rows > 0
                ? "border-red-500/30 bg-red-950/20"
                : "border-white/10 bg-neutral-900/40"
            }`}
          >
            <span
              className={`text-[10px] font-mono uppercase tracking-widest block ${
                batch.failed_rows > 0 ? "text-red-400 font-semibold" : "text-neutral-500"
              }`}
            >
              Failed / Blocked
            </span>
            <span className="text-3xl font-bold font-mono text-neutral-100">
              {batch.failed_rows}
            </span>
            {batch.failed_rows > 0 ? (
              <button
                type="button"
                onClick={() => setShowFailedSheet(true)}
                className="text-[11px] text-red-400 hover:text-red-300 underline font-mono"
              >
                Review Failed Rows
              </button>
            ) : (
              <span className="text-[11px] text-neutral-500 block">Zero Errors</span>
            )}
          </div>
        </div>

        {/* Signature Visual: Batch Constellation */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:layout-grid" className="w-4 h-4 text-orange-500" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                Batch Constellation Map
              </h4>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Created</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                <span>Failed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-800 border border-white/10" />
                <span>Pending</span>
              </div>
            </div>
          </div>

          {/* Micro-modules matrix */}
          <div className="p-4 rounded-xl border border-white/5 bg-neutral-900/60 max-h-48 overflow-y-auto">
            {isLoadingRows ? (
              <div className="text-center py-6 text-xs font-mono text-neutral-500">
                Rendering constellation map...
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {rows.map((r) => {
                  const isCreated = r.execution_status === "CREATED";
                  const isFailed = r.execution_status === "FAILED";
                  return (
                    <div
                      key={r.id}
                      title={`Row #${r.source_row_number}: ${
                        r.normalized_payload?.name || "Asset"
                      } (${r.execution_status})`}
                      className={`w-3 h-3 rounded-sm transition-transform hover:scale-150 cursor-pointer ${
                        isCreated
                          ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                          : isFailed
                          ? "bg-red-500 shadow-sm shadow-red-500/50"
                          : "bg-neutral-800 border border-white/10"
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="border-white/10 hover:bg-neutral-800 text-neutral-200 text-xs"
            >
              <Icon icon="lucide:download" className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
              Export Results CSV
            </Button>

            {batch.failed_rows > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isRetrying}
                onClick={handleRetryFailed}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
              >
                <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5 mr-1.5" />
                {isRetrying ? "Queuing..." : `Retry Failed (${batch.failed_rows})`}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onStartNew}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Start New Batch
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-orange-600 hover:bg-orange-500 text-white font-medium shadow-lg shadow-orange-600/20"
            >
              <Link href={`/${orgSlug}/qr`}>
                View Created QR Assets
                <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Review Failed Rows Sheet */}
      <Sheet open={showFailedSheet} onOpenChange={setShowFailedSheet}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg bg-surface border-border text-foreground p-0 flex flex-col h-full"
        >
          <div className="p-6 border-b border-border bg-surface-elevated/40">
            <SheetHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-red-500/30 text-red-400 font-mono text-xs">
                  {failedRows.length} Failed Rows
                </Badge>
              </div>
              <SheetTitle className="text-lg font-serif">Failed Row Diagnostics</SheetTitle>
              <SheetDescription className="text-xs text-neutral-400">
                Detailed error codes and execution trace for uncreated records.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {failedRows.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl border border-red-500/20 bg-red-950/10 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-300 font-semibold">
                    Row #{r.source_row_number}: {r.normalized_payload?.name || "Asset"}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono border-red-500/40 text-red-400">
                    {r.error_code || "EXECUTION_ERROR"}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-neutral-400 truncate">
                  {r.normalized_payload?.destination_url || "—"}
                </p>
                {r.validation_errors && r.validation_errors.length > 0 && (
                  <p className="text-[11px] text-red-300 pt-1">
                    {r.validation_errors[0].message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
