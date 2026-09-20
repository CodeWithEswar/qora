import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandKitWorkspaceSkeleton } from "./brand-kit-workspace-skeleton";
import { LiveBrandPreviewSkeleton } from "./live-brand-preview-skeleton";

export function BrandKitsLoading() {
  return (
    <div className="space-y-6 pb-16 w-full animate-pulse">
      {/* 1. Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28" />
            <span className="text-muted-foreground/40 text-xs">/</span>
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* 2. Real Database Pulse Strip Skeleton (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-surface/60 backdrop-blur-sm flex flex-col justify-between overflow-hidden space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="w-6 h-6 rounded-md shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-7 w-12 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Signature 3-Zone Identity Operating System Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ZONE 1: Brand Kit Library Skeleton (Left Rail: 4 cols on lg, 3 cols on xl) */}
        <div className="lg:col-span-4 xl:col-span-3 h-[750px] rounded-xl border border-border/80 bg-surface/40 backdrop-blur-sm flex flex-col overflow-hidden">
          {/* Header & Search */}
          <div className="p-3.5 space-y-2.5 border-b border-border/70 bg-surface-elevated/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded-sm shrink-0" />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <Skeleton className="h-4 w-12 rounded" />
            </div>

            {/* Search Input */}
            <Skeleton className="h-8 w-full rounded-lg" />

            {/* Status Filter Buttons */}
            <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-surface border border-border/60">
              <Skeleton className="h-6 rounded-md" />
              <Skeleton className="h-6 rounded-md" />
              <Skeleton className="h-6 rounded-md" />
            </div>
          </div>

          {/* Kit Item Cards List */}
          <div className="flex-1 p-2 space-y-2 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-border/60 bg-surface-elevated/30 flex items-start gap-2.5 overflow-hidden"
              >
                {/* Brand Logo / Color swatch */}
                <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3.5 w-24 max-w-full" />
                    {i === 1 && <Skeleton className="h-3.5 w-12 rounded-full" />}
                  </div>
                  <Skeleton className="h-2.5 w-16 max-w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ZONE 2: Selected Brand Kit Workspace (Center Rail: 8 cols on lg, 6 cols on xl) */}
        <div className="lg:col-span-8 xl:col-span-6 min-w-0">
          <BrandKitWorkspaceSkeleton />
        </div>

        {/* ZONE 3: Live Brand Preview (Right Rail: hidden on <xl, 3 cols on xl+) */}
        <div className="hidden xl:block xl:col-span-3 h-[750px]">
          <LiveBrandPreviewSkeleton />
        </div>
      </div>
    </div>
  );
}
