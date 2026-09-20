"use client";

import * as React from "react";
import { AlertCircle, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnpublishedDiffBannerProps {
  publishedDestination: string;
  draftDestination: string;
  onReviewChanges: () => void;
  onPublishDirect: () => void;
  isPublishing?: boolean;
}

export function UnpublishedDiffBanner({
  publishedDestination,
  draftDestination,
  onReviewChanges,
  onPublishDirect,
  isPublishing = false,
}: UnpublishedDiffBannerProps) {
  const cleanPub = publishedDestination.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const cleanDraft = draftDestination.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="w-full rounded-2xl p-4 bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start md:items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <span>Unpublished Changes Pending</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-muted-foreground line-through decoration-amber-500/60 truncate max-w-[200px]" title={publishedDestination}>
              {cleanPub}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-semibold text-foreground truncate max-w-[240px]" title={draftDestination}>
              {cleanDraft}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onReviewChanges}
          className="border-amber-500/30 text-xs font-medium hover:bg-amber-500/10"
        >
          Review Diff
        </Button>
        <Button
          size="sm"
          onClick={onPublishDirect}
          disabled={isPublishing}
          className="bg-[#FA520F] text-white hover:bg-[#FA520F]/90 text-xs font-medium gap-1.5 shadow-xs"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isPublishing ? "Publishing..." : "Publish Revision"}</span>
        </Button>
      </div>
    </div>
  );
}
