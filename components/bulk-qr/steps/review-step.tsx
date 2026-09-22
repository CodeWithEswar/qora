"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
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
import { BulkManifestSummary, BulkCreationMode } from "@/lib/domains/bulk-qr";

interface ReviewStepProps {
  manifest: BulkManifestSummary;
  sourceName: string;
  sourceType: "CSV" | "MANUAL";
  campaignName?: string;
  folderName?: string;
  designName?: string;
  canPublish?: boolean;
  onBack: () => void;
  onStartBatch: (mode: BulkCreationMode) => void;
}

export function ReviewStep({
  manifest,
  sourceName,
  sourceType,
  campaignName,
  folderName,
  designName = "Canonical Default",
  canPublish = true,
  onBack,
  onStartBatch,
}: ReviewStepProps) {
  const [creationMode, setCreationMode] = useState<BulkCreationMode>("DRAFT");
  const [showConfirmBlockedDialog, setShowConfirmBlockedDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLaunchClick = () => {
    if (isSubmitting) return;
    if (manifest.blockedRows > 0) {
      setShowConfirmBlockedDialog(true);
    } else {
      setIsSubmitting(true);
      onStartBatch(creationMode);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 text-xs font-mono uppercase tracking-wider">
          <Icon icon="lucide:file-check-2" className="w-3.5 h-3.5" />
          Preflight Manifest
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-100 font-serif">
          Batch Execution Preflight
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Review the authoritative creation manifest before queuing the batch job into the worker runway.
        </p>
      </div>

      {/* Signature Technical Batch Manifest Card */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6 relative overflow-hidden">
        {/* Subtle top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />

        {/* Top summary row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
              Source Identity
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <Icon
                icon={sourceType === "CSV" ? "lucide:file-spreadsheet" : "lucide:grid"}
                className="w-4 h-4 text-primary"
              />
              <span className="text-base font-semibold text-foreground font-mono">
                {sourceName}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-border">
                {sourceType}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
                Total Rows
              </span>
              <span className="text-2xl font-bold font-mono text-foreground">
                {manifest.totalRows}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 block">
                Eligible
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-500">
                {manifest.readyRows + manifest.warningRows}
              </span>
            </div>
            {manifest.blockedRows > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 block">
                  Blocked
                </span>
                <span className="text-2xl font-bold font-mono text-red-400">
                  {manifest.blockedRows}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Column 1: QR Type Distribution */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Icon icon="lucide:pie-chart" className="w-4 h-4 text-orange-500" />
              QR Types Breakdown
            </h4>
            <div className="space-y-2 rounded-xl bg-neutral-900/60 p-3.5 border border-white/5 font-mono text-xs">
              {Object.entries(manifest.qrTypesBreakdown).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-neutral-400 uppercase tracking-wide">
                    {type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-100 font-bold">{count}</span>
                    <span className="text-[10px] text-neutral-500">
                      ({Math.round((count / manifest.totalRows) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Scope & Design Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Icon icon="lucide:settings-2" className="w-4 h-4 text-orange-500" />
              Operational Scopes
            </h4>
            <div className="space-y-2.5 rounded-xl bg-neutral-900/60 p-3.5 border border-white/5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Target Campaign</span>
                <span className="font-medium text-neutral-200">
                  {campaignName || <span className="text-neutral-500 italic">None / Individual</span>}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Target Folder</span>
                <span className="font-medium text-neutral-200">
                  {folderName || <span className="text-neutral-500 italic">Root / Individual</span>}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Design Preset</span>
                <span className="font-medium text-neutral-200">{designName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Scanability Safety</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {manifest.warningRows === 0 ? "100% Pass" : `${manifest.warningRows} Warnings`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Creation Mode Selection */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Icon icon="lucide:rocket" className="w-4 h-4 text-orange-500" />
            Execution Intent
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mode 1: DRAFT */}
            <button
              type="button"
              onClick={() => setCreationMode("DRAFT")}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left cursor-pointer transition-all ${
                creationMode === "DRAFT"
                  ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
                  : "border-white/10 bg-neutral-900/40 hover:border-white/20"
              }`}
            >
              <div className="w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center border-neutral-400">
                {creationMode === "DRAFT" && (
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                )}
              </div>
              <div>
                <span className="text-xs font-semibold text-neutral-100 block">
                  Create as Drafts (Recommended)
                </span>
                <span className="text-[11px] text-neutral-400 mt-0.5 block">
                  Creates immutable assets and initial versions in workspace. Assets remain in draft until published individually or via batch review.
                </span>
              </div>
            </button>

            {/* Mode 2: PUBLISH */}
            <button
              type="button"
              disabled={!canPublish}
              onClick={() => canPublish && setCreationMode("PUBLISH")}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                !canPublish
                  ? "opacity-50 cursor-not-allowed border-white/5 bg-neutral-950"
                  : creationMode === "PUBLISH"
                  ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30 cursor-pointer"
                  : "border-white/10 bg-neutral-900/40 hover:border-white/20 cursor-pointer"
              }`}
            >
              <div className="w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center border-neutral-400">
                {creationMode === "PUBLISH" && (
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-100 block">
                    Create & Publish Live
                  </span>
                  {!canPublish && (
                    <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-400">
                      Permission Required
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-neutral-400 mt-0.5 block">
                  Directly activates dynamic redirect endpoints on Cloudflare edge KV and publishes resolver snapshots immediately.
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Blocked rows warning alert dialog */}
      <AlertDialog
        open={showConfirmBlockedDialog}
        onOpenChange={setShowConfirmBlockedDialog}
      >
        <AlertDialogContent className="bg-neutral-950 border-white/10 text-neutral-100 max-w-md">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
              <Icon icon="lucide:alert-triangle" className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-neutral-100 font-serif">
              Proceed with Partial Creation?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-neutral-400 space-y-2">
              <p>
                Your batch contains{" "}
                <strong className="text-red-400">{manifest.blockedRows} blocked rows</strong>.
              </p>
              <p>
                Launching will create the{" "}
                <strong className="text-emerald-400">
                  {manifest.readyRows + manifest.warningRows} eligible assets
                </strong>
                . Blocked rows will be logged in the batch report for subsequent correction.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              onClick={() => setShowConfirmBlockedDialog(false)}
              className="border-white/10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={() => {
                setShowConfirmBlockedDialog(false);
                setIsSubmitting(true);
                onStartBatch(creationMode);
              }}
              className="bg-orange-600 hover:bg-orange-500 text-white font-medium"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="lucide:loader-2" className="w-4 h-4 mr-2 animate-spin" />
                  Launching Batch...
                </>
              ) : (
                `Launch Eligible (${manifest.readyRows + manifest.warningRows} Rows)`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="border-white/10 hover:bg-neutral-800 text-neutral-300"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
          Back to Organize
        </Button>
        <Button
          type="button"
          onClick={handleLaunchClick}
          disabled={isSubmitting}
          className="bg-orange-600 hover:bg-orange-500 text-white shadow-xl shadow-orange-600/30 px-6 font-semibold"
        >
          {isSubmitting ? (
            <>
              <Icon icon="lucide:loader-2" className="w-4 h-4 mr-2 animate-spin" />
              Initializing Batch...
            </>
          ) : (
            <>
              <Icon icon="lucide:play" className="w-4 h-4 mr-2" />
              Queue & Launch Batch ({manifest.readyRows + manifest.warningRows} QRs)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
