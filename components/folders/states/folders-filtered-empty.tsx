"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface FoldersFilteredEmptyProps {
  search?: string;
  onClearFilters: () => void;
  className?: string;
}

export function FoldersFilteredEmpty({
  search,
  onClearFilters,
  className,
}: FoldersFilteredEmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl border border-dashed border-border/80 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.01]",
        className
      )}
    >
      <div className="h-10 w-10 rounded-full bg-muted/60 dark:bg-white/[0.04] flex items-center justify-center text-muted-foreground mb-3">
        <NxtqrIcon icon="solar:filter-linear" size={18} />
      </div>

      <h3 className="text-sm font-semibold text-foreground">
        {search ? `No folders match "${search}"` : "No folders match current filters"}
      </h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        Try adjusting your search terms or clearing status filters to view all workspace spaces.
      </p>

      <Button
        variant="outline"
        size="sm"
        onClick={onClearFilters}
        className="mt-4 h-8 text-xs gap-1.5"
      >
        <NxtqrIcon icon="solar:restart-linear" size={13} />
        <span>Clear filters</span>
      </Button>
    </div>
  );
}
