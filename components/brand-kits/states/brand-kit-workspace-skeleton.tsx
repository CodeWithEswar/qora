import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function BrandKitWorkspaceSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      {/* Navigation Tab Bar Skeleton */}
      <div className="overflow-x-auto pb-1">
        <div className="h-10 bg-surface/80 border border-border/80 p-1 rounded-xl flex items-center gap-1.5 w-max">
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>

      {/* Hero Identity Canvas Banner Skeleton */}
      <div className="relative rounded-2xl border border-border/80 bg-surface/60 backdrop-blur-sm p-6 overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* Logo mark placeholder */}
            <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-40 max-w-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64 max-w-full" />
              <Skeleton className="h-3 w-32 max-w-full" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* Color Palette Chips Preview Skeleton */}
        <div className="pt-4 border-t border-border/60">
          <Skeleton className="h-3 w-28 mb-3" />
          <div className="flex items-center gap-2.5 flex-wrap">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg border border-border/60 bg-surface">
                <Skeleton className="w-6 h-6 rounded-md shrink-0" />
                <Skeleton className="w-14 h-3 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Panels Skeleton: Brand DNA & Real Impact Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DNA Flowchart Card */}
        <div className="rounded-xl border border-border/80 bg-surface/50 p-5 space-y-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-3 w-48 max-w-full" />
          <Skeleton className="h-32 w-full rounded-lg mt-2" />
        </div>

        {/* Impact Map Card */}
        <div className="rounded-xl border border-border/80 bg-surface/50 p-5 space-y-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-40 max-w-full" />
          <div className="grid grid-cols-3 gap-2 pt-3">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
