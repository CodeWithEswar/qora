"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-300">
      {/* 4 Signal Instruments Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 bg-muted" />
              <Skeleton className="h-7 w-7 rounded-lg bg-muted" />
            </div>
            <div className="flex items-baseline justify-between">
              <Skeleton className="h-8 w-20 bg-muted" />
              <div className="w-20 h-6 flex items-end gap-1">
                {[4, 8, 12, 6, 14, 10].map((h, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${h}px` }}
                    className="w-2 rounded-t-[1px] bg-muted"
                  />
                ))}
              </div>
            </div>
            <Skeleton className="h-3 w-32 bg-muted/60" />
          </div>
        ))}
      </div>

      {/* Main Grid: Scan Atlas (8 cols) + Geographic Signal (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40 bg-muted" />
            <Skeleton className="h-7 w-24 rounded-lg bg-muted" />
          </div>
          <div className="h-[380px] rounded-xl border border-border bg-muted/20 flex items-center justify-center relative overflow-hidden">
            <div className="w-full h-full flex items-center justify-center opacity-30">
              <div className="w-3/4 h-2/3 border border-dashed border-border rounded-full flex items-center justify-center">
                <div className="w-1/2 h-1/2 border border-dashed border-border rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
          <Skeleton className="h-5 w-36 bg-muted" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-border">
                <Skeleton className="h-4 w-28 bg-muted" />
                <Skeleton className="h-4 w-14 bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signal River & Device Orbit Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
          <Skeleton className="h-5 w-32 bg-muted" />
          <div className="h-[280px] rounded-xl bg-muted/20 flex items-end p-4 gap-2">
            {[10, 15, 25, 40, 60, 50, 70, 85, 65, 45, 30, 20].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className="flex-1 rounded-t-sm bg-muted"
              />
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 rounded-2xl border border-border bg-card p-6 space-y-4 flex flex-col items-center justify-center shadow-xs">
          <Skeleton className="h-5 w-28 self-start bg-muted" />
          <div className="w-48 h-48 rounded-full border-4 border-muted border-t-primary/30 animate-spin flex items-center justify-center my-4" />
          <Skeleton className="h-4 w-32 bg-muted" />
        </div>
      </div>
    </div>
  );
}
