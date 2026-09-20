"use client";

import * as React from "react";
import Link from "next/link";
import { FolderSummarySignal } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface FoldersSummaryRibbonProps {
  summary: FolderSummarySignal;
  orgSlug: string;
  className?: string;
}

export function FoldersSummaryRibbon({
  summary,
  orgSlug,
  className,
}: FoldersSummaryRibbonProps) {
  const totalQrs = summary.totalFiledQrs + summary.totalUnfiledQrs;

  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4 gap-3",
        className
      )}
    >
      {/* 1. Total Folders */}
      <div className="rounded-lg p-3 border border-border/60 dark:border-white/[0.06] bg-white dark:bg-[#18181B] shadow-2xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-mono uppercase tracking-wider">Active Spaces</span>
          <NxtqrIcon icon="solar:folder-with-files-linear" size={15} />
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-foreground">
            {summary.activeFolders}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            / {summary.totalFolders} total
          </span>
        </div>
      </div>

      {/* 2. Filed QR Assets */}
      <div className="rounded-lg p-3 border border-border/60 dark:border-white/[0.06] bg-white dark:bg-[#18181B] shadow-2xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-mono uppercase tracking-wider">Organized QRs</span>
          <NxtqrIcon icon="solar:check-circle-linear" size={15} className="text-emerald-500" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-foreground">
            {summary.totalFiledQrs}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            in folders
          </span>
        </div>
      </div>

      {/* 3. Unfiled Assets */}
      <Link
        href={`/${orgSlug}/folders/unfiled`}
        className="group rounded-lg p-3 border border-border/60 dark:border-white/[0.06] bg-white dark:bg-[#18181B] shadow-2xs hover:border-amber-500/40 transition-colors"
      >
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-mono uppercase tracking-wider group-hover:text-foreground transition-colors">
            Unfiled QRs
          </span>
          <NxtqrIcon icon="solar:folder-error-linear" size={15} className="text-amber-500" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {summary.totalUnfiledQrs}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono group-hover:underline">
            view unfiled →
          </span>
        </div>
      </Link>

      {/* 4. Total QR Infrastructure */}
      <div className="rounded-lg p-3 border border-border/60 dark:border-white/[0.06] bg-white dark:bg-[#18181B] shadow-2xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-mono uppercase tracking-wider">Total Assets</span>
          <NxtqrIcon icon="solar:qr-code-linear" size={15} className="text-primary" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-foreground">
            {totalQrs}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            tracked in org
          </span>
        </div>
      </div>
    </div>
  );
}
