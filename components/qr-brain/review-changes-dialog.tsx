"use client";

import * as React from "react";
import { RoutingRule } from "@nxtqr/contracts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface ReviewChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftRules: RoutingRule[];
  publishedRules: RoutingRule[];
  currentRevision: number;
  isPublishing: boolean;
  blockers?: string[];
  onConfirmPublish: () => Promise<void>;
  onFixBlocker?: () => void;
}

export function ReviewChangesDialog({
  open,
  onOpenChange,
  draftRules,
  publishedRules,
  currentRevision,
  isPublishing,
  blockers = [],
  onConfirmPublish,
  onFixBlocker,
}: ReviewChangesDialogProps) {
  // Compute diff breakdown
  const diffSummary = React.useMemo(() => {
    const pubMap = new Map(publishedRules.map((r) => [r.id, r]));
    const draftMap = new Map(draftRules.map((r) => [r.id, r]));

    const added: RoutingRule[] = [];
    const modified: { rule: RoutingRule; changes: string[] }[] = [];
    const removed: RoutingRule[] = [];

    for (const d of draftRules) {
      const pub = pubMap.get(d.id);
      if (!pub) {
        added.push(d);
      } else {
        const changes: string[] = [];
        if (pub.name !== d.name) changes.push(`Name changed: "${pub.name}" → "${d.name}"`);
        if (pub.priority !== d.priority) changes.push(`Priority changed: #${pub.priority} → #${d.priority}`);
        if (pub.isActive !== d.isActive) changes.push(`Status changed: ${d.isActive ? "Active" : "Disabled"}`);
        if (pub.action?.destinationUrl !== d.action?.destinationUrl) {
          changes.push(`Destination: ${d.action?.destinationUrl}`);
        }
        if (JSON.stringify(pub.conditions) !== JSON.stringify(d.conditions)) {
          changes.push(`Conditions updated (${d.conditions?.length || 0} conditions)`);
        }
        if (changes.length > 0) {
          modified.push({ rule: d, changes });
        }
      }
    }

    for (const p of publishedRules) {
      if (!draftMap.has(p.id)) {
        removed.push(p);
      }
    }

    return { added, modified, removed };
  }, [draftRules, publishedRules]);

  // Estimated compiled snapshot size
  const estimatedSize = React.useMemo(() => {
    const json = JSON.stringify(draftRules);
    return new Blob([json]).size;
  }, [draftRules]);

  const totalChanges =
    diffSummary.added.length + diffSummary.modified.length + diffSummary.removed.length;

  const hasBlockers = blockers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-xl p-0 flex flex-col max-h-[90vh] sm:max-h-[85vh] bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 text-xs font-mono select-none overflow-hidden shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-[#191919] text-left">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="p-2 sm:p-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-500/20 shrink-0">
              <NxtqrIcon icon="solar:cloud-upload-bold" size={20} />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-serif tracking-tight truncate">
                Review &amp; Publish Routing Policy
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Atomic compilation of working draft rules into an immutable production snapshot.
              </DialogDescription>
            </div>
          </div>

          {/* Revisions & Snapshot Meta */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-3 sm:pt-4 flex-wrap text-xs">
            <Badge
              variant="outline"
              className="text-[10px] sm:text-[11px] font-mono gap-1 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
            >
              <span>Published:</span>
              <span className="text-zinc-900 dark:text-zinc-100 font-semibold">v{currentRevision}</span>
            </Badge>

            <NxtqrIcon icon="solar:arrow-right-linear" size={12} className="text-zinc-400 dark:text-zinc-600" />

            <Badge
              variant="outline"
              className="text-[10px] sm:text-[11px] font-mono gap-1 border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-500 font-bold"
            >
              <span>Next:</span>
              <span>v{currentRevision + 1}</span>
            </Badge>

            <Badge
              variant="outline"
              className="text-[10px] font-mono ml-auto text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            >
              Snapshot: ~{(estimatedSize / 1024).toFixed(1)} KB
            </Badge>
          </div>
        </DialogHeader>

        {/* COMPILER STAGES PIPELINE */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-black/40 flex items-center justify-between text-[10px] sm:text-[11px] font-mono overflow-x-auto no-scrollbar gap-2 shrink-0">
          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold shrink-0">
            <NxtqrIcon icon="solar:check-circle-bold" size={12} />
            <span>1. Draft Model</span>
          </div>
          <NxtqrIcon icon="solar:arrow-right-linear" size={10} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
          <div
            className={cn(
              "flex items-center gap-1 font-semibold shrink-0",
              hasBlockers ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
            )}
          >
            <NxtqrIcon icon={hasBlockers ? "solar:close-circle-bold" : "solar:check-circle-bold"} size={12} />
            <span>2. Validation</span>
          </div>
          <NxtqrIcon icon="solar:arrow-right-linear" size={10} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold shrink-0">
            <NxtqrIcon icon="solar:check-circle-bold" size={12} />
            <span>3. Compiled</span>
          </div>
          <NxtqrIcon icon="solar:arrow-right-linear" size={10} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
          <div
            className={cn(
              "flex items-center gap-1 font-semibold shrink-0",
              hasBlockers ? "text-zinc-500 dark:text-zinc-400" : "text-orange-600 dark:text-orange-500"
            )}
          >
            <NxtqrIcon icon={hasBlockers ? "solar:pause-circle-bold" : "solar:bolt-bold"} size={12} />
            <span>4. Edge Ready</span>
          </div>
        </div>

        {/* Changes Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 bg-white dark:bg-[#141414]">
          {/* BLOCKERS ALERT IF ANY */}
          {hasBlockers && (
            <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/20 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                <NxtqrIcon icon="solar:danger-circle-bold" size={15} />
                <span>Publication Blocked</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800 dark:text-rose-200/90 pl-1">
                {blockers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              {onFixBlocker && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    onFixBlocker();
                  }}
                  className="h-7 text-[10px] font-mono border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                >
                  Inspect Conflicts
                </Button>
              )}
            </div>
          )}

          {/* CHANGE SUMMARY BREAKDOWN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-600 dark:text-zinc-400">
                Changes in Draft ({totalChanges} detected)
              </span>
            </div>

            {totalChanges === 0 ? (
              <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/30 text-center space-y-1 text-zinc-600 dark:text-zinc-400">
                <NxtqrIcon icon="solar:check-circle-bold" size={20} className="mx-auto text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Draft is identical to Published Revision</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">No changes detected between working memory and production.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Added Rules */}
                {diffSummary.added.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 uppercase">
                      <NxtqrIcon icon="solar:add-circle-bold" size={13} />
                      <span>Added Rules ({diffSummary.added.length})</span>
                    </div>
                    {diffSummary.added.map((r) => (
                      <div
                        key={r.id}
                        className="p-2.5 sm:p-3 rounded-lg border border-emerald-300 dark:border-emerald-800/50 bg-emerald-50/70 dark:bg-emerald-950/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 shadow-2xs"
                      >
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 truncate">
                          #{r.priority} {r.name}
                        </span>
                        <span className="text-[11px] text-emerald-700/90 dark:text-emerald-400 font-mono truncate">
                          {r.conditions?.length || 0} conditions → {r.action?.destinationUrl}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Modified Rules */}
                {diffSummary.modified.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 uppercase">
                      <NxtqrIcon icon="solar:pen-2-bold" size={13} />
                      <span>Modified Rules ({diffSummary.modified.length})</span>
                    </div>
                    {diffSummary.modified.map(({ rule, changes }) => (
                      <div
                        key={rule.id}
                        className="p-2.5 sm:p-3 rounded-lg border border-amber-300 dark:border-amber-800/50 bg-amber-50/70 dark:bg-amber-950/20 text-xs space-y-1.5 shadow-2xs"
                      >
                        <div className="font-bold text-amber-950 dark:text-amber-200 truncate">
                          #{rule.priority} {rule.name}
                        </div>
                        <ul className="text-[11px] text-amber-800/90 dark:text-amber-400 space-y-0.5 pl-2 border-l-2 border-amber-400 dark:border-amber-600">
                          {changes.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Removed Rules */}
                {diffSummary.removed.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1 uppercase">
                      <NxtqrIcon icon="solar:trash-bin-trash-bold" size={13} />
                      <span>Removed Rules ({diffSummary.removed.length})</span>
                    </div>
                    {diffSummary.removed.map((r) => (
                      <div
                        key={r.id}
                        className="p-2.5 sm:p-3 rounded-lg border border-rose-300 dark:border-rose-800/50 bg-rose-50/70 dark:bg-rose-950/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 shadow-2xs"
                      >
                        <span className="line-through text-rose-800/70 dark:text-rose-400/70 truncate">
                          #{r.priority} {r.name}
                        </span>
                        <span className="text-[11px] text-rose-700 dark:text-rose-300 font-mono font-bold shrink-0">
                          Will be deleted
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-[#191919] flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
            className="w-full sm:w-auto h-8 sm:h-9 text-xs font-mono bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={onConfirmPublish}
            disabled={isPublishing || hasBlockers || totalChanges === 0}
            className="w-full sm:w-auto h-8 sm:h-9 text-xs font-mono gap-1.5 bg-[#FA520F] hover:bg-[#CC3A05] text-white shadow-xs font-semibold cursor-pointer"
          >
            {isPublishing ? (
              <>
                <NxtqrIcon icon="solar:restart-linear" size={14} className="animate-spin" />
                <span>Publishing Revision...</span>
              </>
            ) : (
              <>
                <NxtqrIcon icon="solar:cloud-upload-bold" size={14} />
                <span>Publish Revision v{currentRevision + 1}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
