"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface FilesSkeletonProps {
  viewMode?: "grid" | "list";
}

export function FilesSkeleton({ viewMode = "grid" }: FilesSkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="w-full rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3.5 gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-48 max-w-full" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-16 hidden md:block" />
            <Skeleton className="h-4 w-24 hidden lg:block" />
            <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col p-2 space-y-2 shadow-xs"
        >
          {/* 60% Preview Skeleton */}
          <Skeleton className="w-full aspect-[4/3] rounded-xl" />

          {/* 40% Metadata Skeleton */}
          <div className="p-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
