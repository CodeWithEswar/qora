"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";

interface FilesFilteredEmptyProps {
  onClearFilters: () => void;
}

export function FilesFilteredEmpty({ onClearFilters }: FilesFilteredEmptyProps) {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center select-none">
      <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground mb-3 shadow-xs">
        <NxtqrIcon icon="solar:minimalistic-magnifer-linear" size={24} />
      </div>

      <h4 className="text-base font-semibold text-foreground">No files match this view</h4>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
        Try adjusting your search query, clearing your file type filter, or switching between In Use and Unused assets.
      </p>

      <Button
        variant="outline"
        size="sm"
        onClick={onClearFilters}
        className="gap-1.5 text-xs font-medium"
      >
        <NxtqrIcon icon="solar:refresh-linear" size={14} />
        <span>Clear Filters</span>
      </Button>
    </div>
  );
}
