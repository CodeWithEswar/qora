import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DynamicQrSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in-50 duration-300", className)}>
      {/* Header Skeleton */}
      <div className="space-y-3 pb-2">
        <Skeleton className="h-4 w-48" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-3 w-72" />
      </div>

      {/* Tabs Skeleton */}
      <Skeleton className="h-9 w-80 rounded-lg" />

      {/* Hero 3-Column Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: QR Identity */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-border bg-surface space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-52 w-52 mx-auto rounded-xl" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>

        {/* Center: Resolution Pipeline */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-border bg-surface space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-4 py-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Right: Destination Panel */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-border bg-surface space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>

      {/* Secondary Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl border border-border bg-surface space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-border bg-surface space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
          <div className="p-5 rounded-2xl border border-border bg-surface space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
