import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function FoldersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3 pb-4 border-b border-border/60">
        <Skeleton className="h-4 w-32 rounded-sm" />
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-4 w-96 rounded-sm" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      {/* Summary Ribbon Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg p-3 border border-border/60 bg-white dark:bg-[#18181B] space-y-2"
          >
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20 rounded-xs" />
              <Skeleton className="h-3.5 w-3.5 rounded-xs" />
            </div>
            <Skeleton className="h-6 w-16 rounded-sm" />
          </div>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-64 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-18 rounded-md" />
        </div>
      </div>

      {/* Field Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 border border-border/60 bg-white dark:bg-[#18181B] space-y-3 h-[160px] flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28 rounded-sm" />
                  <Skeleton className="h-3 w-16 rounded-xs" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
            <Skeleton className="h-3 w-full rounded-xs" />
            <div className="flex justify-between pt-2 border-t border-border/40">
              <Skeleton className="h-4 w-20 rounded-xs" />
              <Skeleton className="h-3 w-16 rounded-xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
