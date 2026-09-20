"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, SlidersHorizontal, AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QrEmptyMonogram } from "@/components/empty-state/qr-empty-monogram";

export interface QrEmptyStateProps {
  type: "zero" | "filtered" | "error";
  orgSlug: string;
  errorMessage?: string;
  onClearFilters?: () => void;
  onRetry?: () => void;
}

export function QrEmptyState({
  type,
  orgSlug,
  errorMessage,
  onClearFilters,
  onRetry,
}: QrEmptyStateProps) {
  if (type === "zero") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border/80 bg-white/50 dark:bg-[#141414]/50 my-6 space-y-6">
        {/* Established NXTQR animated Q monogram letter */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-border/60 shadow-xs">
          <QrEmptyMonogram letter="Q" size="lg" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground">
            Your QR space is ready.
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Create your first QR identity to start publishing, routing, and measuring scans across your workspace campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="sm"
            asChild
            className="bg-primary hover:bg-[#cc3a05] text-white text-xs h-9 px-4 gap-2 font-medium"
          >
            <Link href={`/${orgSlug}/qr/studio?create=true`}>
              <Plus className="h-3.5 w-3.5" />
              <span>Create QR</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs h-9 px-4 border-border/80"
          >
            <Link href={`/${orgSlug}/qr/bulk`}>Bulk Create</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (type === "filtered") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-border/80 bg-white dark:bg-[#141414] my-6 space-y-4">
        <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground">
          <SlidersHorizontal className="h-5 w-5" />
        </div>

        <div className="space-y-1.5 max-w-sm">
          <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-foreground">
            No Matching QR Codes
          </h3>
          <p className="text-xs text-muted-foreground">
            No QR identities in this workspace match your current search query or filter criteria.
          </p>
        </div>

        {onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs h-8 text-primary border-primary/30 hover:bg-primary/5"
          >
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  // Error state
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10 my-6 space-y-4">
      <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
        <AlertCircle className="h-5 w-5" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="font-semibold text-sm text-foreground">
          Couldn't load QR codes
        </h3>
        <p className="text-xs text-muted-foreground">
          {errorMessage || "We couldn't retrieve authoritative QR data."}
        </p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="text-xs h-8 gap-1.5"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Try again</span>
        </Button>
      )}
    </div>
  );
}
