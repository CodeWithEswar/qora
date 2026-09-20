"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { QrEmptyMonogram } from "@/components/empty-state/qr-empty-monogram";
import { cn } from "@/lib/utils";

export interface CampaignsTrueEmptyStateProps {
  onCreateCampaign: () => void;
  orgSlug: string;
  className?: string;
}

export function CampaignsTrueEmptyState({
  onCreateCampaign,
  orgSlug,
  className,
}: CampaignsTrueEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/80 bg-surface/40",
        className
      )}
    >
      {/* Signature QR Monogram "C" */}
      <div className="mb-6">
        <QrEmptyMonogram letter="C" size="lg" />
      </div>

      <div className="max-w-md space-y-2">
        <h3 className="text-base font-semibold text-foreground tracking-tight">
          No campaigns yet
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Group related QR codes into one measurable initiative. Monitor destination routing, track cross-asset scan activity, and orchestrate campaign performance in real time.
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        <Button
          onClick={onCreateCampaign}
          size="sm"
          className="bg-primary hover:bg-[#CC3A05] text-white text-xs h-9 px-5 gap-2 shadow-xs font-semibold"
        >
          <Icon icon="hugeicons:plus-sign" className="w-4 h-4" />
          <span>Create Campaign</span>
        </Button>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-xs h-9 px-4 gap-1.5 bg-surface border-border text-foreground hover:bg-muted"
        >
          <Link href={`/${orgSlug}/qr`}>
            <Icon icon="hugeicons:qr-code" className="w-4 h-4 text-muted-foreground" />
            <span>Explore QR Codes</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

export interface CampaignsFilteredEmptyStateProps {
  onClearFilters: () => void;
  className?: string;
}

export function CampaignsFilteredEmptyState({
  onClearFilters,
  className,
}: CampaignsFilteredEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center rounded-xl border border-border/60 bg-surface/30",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
        <Icon icon="hugeicons:search-01" className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">
        No campaigns match these filters
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-4">
        Try adjusting your search terms or clearing your status, date, and asset filters.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onClearFilters}
        className="text-xs h-8 px-4 bg-surface border-border gap-1.5"
      >
        <Icon icon="hugeicons:reload" className="w-3.5 h-3.5 text-muted-foreground" />
        <span>Clear filters</span>
      </Button>
    </div>
  );
}
