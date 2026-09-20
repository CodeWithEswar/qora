"use client";

import React from "react";
import type { AssetPulseMetricsV1 } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { Progress } from "@/components/ui/progress";

interface AssetPulseProps {
  metrics: AssetPulseMetricsV1;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

export function AssetPulse({ metrics }: AssetPulseProps) {
  const {
    totalFiles = 0,
    totalImages = 0,
    totalDocuments = 0,
    inUseCount = 0,
    usedStorageBytes = 0,
    storageLimitBytes = 2 * 1024 * 1024 * 1024,
  } = metrics;

  const storagePercentage = Math.min(
    100,
    Math.round((usedStorageBytes / storageLimitBytes) * 100)
  );

  return (
    <div className="w-full rounded-2xl border border-border/60 bg-card p-3 sm:p-4 shadow-xs select-none">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* 1. Total Assets */}
        <div className="flex flex-col justify-center p-2.5 sm:p-0 rounded-xl bg-muted/20 sm:bg-transparent sm:border-r sm:border-border/40 sm:pr-4">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            <NxtqrIcon icon="solar:folder-with-files-linear" size={13} className="text-[#FA520F]" />
            <span>Total Assets</span>
          </div>
          <span className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-foreground mt-0.5 sm:mt-1">
            {totalFiles.toLocaleString()}
          </span>
        </div>

        {/* 2. Images */}
        <div className="flex flex-col justify-center p-2.5 sm:p-0 rounded-xl bg-muted/20 sm:bg-transparent sm:border-r sm:border-border/40 sm:px-4">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            <NxtqrIcon icon="solar:gallery-linear" size={13} className="text-blue-500" />
            <span>Images</span>
          </div>
          <span className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-foreground mt-0.5 sm:mt-1">
            {totalImages.toLocaleString()}
          </span>
        </div>

        {/* 3. Documents */}
        <div className="flex flex-col justify-center p-2.5 sm:p-0 rounded-xl bg-muted/20 sm:bg-transparent sm:border-r sm:border-border/40 sm:px-4">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            <NxtqrIcon icon="solar:document-text-linear" size={13} className="text-amber-500" />
            <span>Documents</span>
          </div>
          <span className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-foreground mt-0.5 sm:mt-1">
            {totalDocuments.toLocaleString()}
          </span>
        </div>

        {/* 4. In Use / Connected */}
        <div className="flex flex-col justify-center p-2.5 sm:p-0 rounded-xl bg-muted/20 sm:bg-transparent sm:border-r sm:border-border/40 sm:px-4">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            <NxtqrIcon icon="solar:link-circle-linear" size={13} className="text-emerald-500" />
            <span>In Use</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5 sm:mt-1">
            <span className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-foreground">
              {inUseCount.toLocaleString()}
            </span>
            {totalFiles > 0 && (
              <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground">
                ({Math.round((inUseCount / totalFiles) * 100)}%)
              </span>
            )}
          </div>
        </div>

        {/* 5. Storage Meter */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col justify-center p-2.5 sm:p-0 rounded-xl bg-muted/20 sm:bg-transparent sm:pl-4">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
            <div className="flex items-center gap-1.5">
              <NxtqrIcon icon="solar:database-linear" size={13} className="text-[#FA520F]" />
              <span>Storage</span>
            </div>
            <span className="text-foreground font-semibold">
              {storagePercentage}%
            </span>
          </div>

          <Progress value={storagePercentage} className="h-1.5 bg-muted" />

          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-muted-foreground mt-1.5">
            <span>{formatBytes(usedStorageBytes)}</span>
            <span>{formatBytes(storageLimitBytes)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
