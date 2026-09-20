"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

interface DomainsFilteredEmptyStateProps {
  onClearFilters: () => void;
  searchQuery?: string;
}

export function DomainsFilteredEmptyState({
  onClearFilters,
  searchQuery,
}: DomainsFilteredEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/70 rounded-xl bg-surface/30 my-6">
      <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center border border-border text-muted-foreground mb-4">
        <Icon icon="solar:magnifer-broken" className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        No domains match these filters
      </h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        {searchQuery ? (
          <>
            No custom domains matched &ldquo;<span className="text-foreground font-mono">{searchQuery}</span>&rdquo;. Try clearing filters or refining your query.
          </>
        ) : (
          "No custom domains match the selected lifecycle, DNS, or routing filters."
        )}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onClearFilters}
        className="mt-5 border-border hover:bg-surface text-xs h-8 gap-1.5"
      >
        <Icon icon="solar:restart-square-linear" className="w-3.5 h-3.5" />
        Reset Filter Criteria
      </Button>
    </div>
  );
}
