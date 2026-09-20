import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function StudioLoadingSkeleton() {
  return (
    <div className="w-full pb-12 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-border bg-surface px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      {/* 3-Column Studio Grid Skeleton */}
      <div className="w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-[520px] w-full rounded-xl border border-border" />
        </div>
        <div className="lg:col-span-5 space-y-4">
          <Skeleton className="h-[520px] w-full rounded-xl border border-border" />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-[520px] w-full rounded-xl border border-border" />
        </div>
      </div>
    </div>
  );
}
