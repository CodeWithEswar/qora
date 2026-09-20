"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

interface GuardianFilteredEmptyProps {
  onClearFilters: () => void;
}

export function GuardianFilteredEmpty({ onClearFilters }: GuardianFilteredEmptyProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-surface/80 text-foreground p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
      <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
        <Icon icon="solar:filter-linear" className="w-5 h-5" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-semibold text-foreground font-mono">
          NO MONITORS MATCH THESE FILTERS
        </h4>
        <p className="text-xs text-muted-foreground">
          No destination monitors correspond to the current search query or health state filter.
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onClearFilters}
        className="text-xs h-9 px-4 border-border cursor-pointer"
      >
        Clear Filters
      </Button>
    </div>
  );
}
