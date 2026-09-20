"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

interface DomainsHeaderProps {
  orgSlug: string;
  onConnectDomain: () => void;
  onToggleFilters?: () => void;
  isFiltersOpen?: boolean;
}

export function DomainsHeader({
  orgSlug,
  onConnectDomain,
  onToggleFilters,
  isFiltersOpen = false,
}: DomainsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-4 border-b border-border/70">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          href={`/${orgSlug}`}
          className="hover:text-foreground transition-colors"
        >
          {orgSlug}
        </Link>
        <span>/</span>
        <span className="text-muted-foreground/80">Brand</span>
        <span>/</span>
        <span className="text-foreground font-medium">Domains</span>
      </div>

      {/* Main Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
            Domains
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Connect trusted domains to NXTQR and control how branded QR traffic reaches the edge.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleFilters && (
            <Button
              variant={isFiltersOpen ? "secondary" : "outline"}
              size="sm"
              onClick={onToggleFilters}
              className="h-9 gap-1.5 text-xs cursor-pointer border-border"
            >
              <Icon icon="solar:filter-linear" className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          )}

          <Button
            onClick={onConnectDomain}
            size="sm"
            className="h-9 gap-1.5 text-xs bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium shadow-sm shadow-[#FA520F]/20 cursor-pointer"
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
            <span>+ Connect Domain</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
