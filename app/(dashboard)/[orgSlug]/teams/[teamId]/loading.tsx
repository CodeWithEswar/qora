import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamDetailLoading() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Identity Bar Skeleton */}
      <div className="w-full border-b border-border/80 bg-surface/40 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-4 w-28" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-6 pt-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* Navigation Command Bar Skeleton */}
      <div className="w-full border-b border-border/60 bg-surface/20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4 h-11">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Team Circuit Hero Skeleton */}
        <Skeleton className="h-44 w-full rounded-xl" />

        {/* Pulse Strip Skeleton */}
        <Skeleton className="h-10 w-full rounded-lg" />

        {/* 2x2 Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
