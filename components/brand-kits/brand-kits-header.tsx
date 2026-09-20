"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrandKitsHeaderProps {
  orgSlug: string;
  onCreateNew: () => void;
  onToggleFilters?: () => void;
  isFiltersOpen?: boolean;
}

export function BrandKitsHeader({
  orgSlug,
  onCreateNew,
  onToggleFilters,
  isFiltersOpen = false,
}: BrandKitsHeaderProps) {
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
        <span className="text-foreground font-medium">Brand Kits</span>
      </div>

      {/* Main Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
            Brand Kits
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Create, govern, and apply consistent visual identities across QR codes, destination landing pages, and physical print assets.
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
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          )}

          <Button
            onClick={onCreateNew}
            size="sm"
            className="h-9 gap-1.5 text-xs bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium shadow-sm shadow-[#FA520F]/20 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ New Brand Kit</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
