"use client";

import * as React from "react";
import Link from "next/link";
import { QrCode, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsDormantStateProps {
  orgSlug: string;
  onResetFilters?: () => void;
  hasFilters?: boolean;
}

export function AnalyticsDormantState({
  orgSlug,
  onResetFilters,
  hasFilters = false,
}: AnalyticsDormantStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-xs relative overflow-hidden text-card-foreground">
      {/* Subtle radial background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,82,15,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Signature NXTQR Dormant Pixel Monogram 'A' */}
      <div className="relative mb-6">
        <div className="grid grid-cols-5 gap-1.5 p-3 rounded-xl bg-muted border border-border shadow-inner">
          {/* Row 1 */}
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/80 shadow-[0_0_8px_rgba(250,82,15,0.6)]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />

          {/* Row 2 */}
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/70" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/70" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />

          {/* Row 3 */}
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/80" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/80" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/90" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/80" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/80" />

          {/* Row 4 */}
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/60" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/60" />

          {/* Row 5 */}
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/40" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-muted-foreground/20" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/40" />
        </div>

        {/* Small signal beacon indicator */}
        <div className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-full bg-card border border-border text-[9px] font-mono text-muted-foreground flex items-center gap-1 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 animate-pulse" />
          DORMANT
        </div>
      </div>

      <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground tracking-tight">
        {hasFilters ? "No scan signals match this filter" : "No scan signals yet"}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-2 mb-6 leading-relaxed">
        {hasFilters
          ? "Try loosening the selected date range, country, or device filters to reveal broader workspace telemetry."
          : "Analytics and routing intelligence will begin forming automatically once your published QR assets record scans."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {hasFilters && onResetFilters ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="text-xs border-border bg-card hover:bg-muted text-foreground shadow-xs"
          >
            Clear Active Filters
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs border-border bg-card hover:bg-muted text-foreground gap-1.5 shadow-xs"
            >
              <Link href={`/${orgSlug}/qr`}>
                <QrCode className="h-3.5 w-3.5 text-muted-foreground" />
                <span>View QR Codes</span>
                <ArrowUpRight className="h-3 w-3 opacity-60" />
              </Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="text-xs bg-primary hover:bg-[#cc3a05] text-white shadow-xs gap-1.5"
            >
              <Link href={`/${orgSlug}/qr/studio`}>
                <Plus className="h-3.5 w-3.5" />
                <span>Create QR</span>
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
