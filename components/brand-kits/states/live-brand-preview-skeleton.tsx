import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function LiveBrandPreviewSkeleton() {
  return (
    <div className="h-full rounded-2xl border border-border/80 bg-surface/40 backdrop-blur-sm p-5 flex flex-col justify-between overflow-hidden animate-pulse">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-2.5 w-32 max-w-full" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>

        {/* View Mode Switcher Pills */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-surface border border-border/60">
          <Skeleton className="h-6 rounded" />
          <Skeleton className="h-6 rounded" />
          <Skeleton className="h-6 rounded" />
        </div>

        {/* QR Code Canvas Preview Box */}
        <div className="aspect-square w-full rounded-xl border border-border/60 bg-surface/70 p-6 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
          <div className="w-48 h-48 max-w-full rounded-xl border border-border/40 bg-surface-elevated/40 p-4 flex flex-col justify-between">
            <div className="flex justify-between">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
            </div>
            <div className="flex justify-center">
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </div>
        </div>

        {/* Diagnostic Score Strip */}
        <div className="p-3 rounded-lg border border-border/60 bg-surface space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </div>

      {/* Export / Quick Actions */}
      <div className="pt-4 border-t border-border/70 space-y-2">
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}
