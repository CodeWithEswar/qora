"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";

interface FilesActiveChipsProps {
  search: string;
  onClearSearch: () => void;
  category: string;
  onClearCategory: () => void;
  usage: string;
  onClearUsage: () => void;
  onClearAll: () => void;
}

export function FilesActiveChips({
  search,
  onClearSearch,
  category,
  onClearCategory,
  usage,
  onClearUsage,
  onClearAll,
}: FilesActiveChipsProps) {
  const hasFilters = Boolean(
    search || (category && category !== "ALL") || (usage && usage !== "all")
  );

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs select-none">
      <span className="text-[11px] font-mono text-muted-foreground mr-1">Active:</span>

      {search && (
        <Badge
          variant="secondary"
          className="h-6 gap-1 pl-2 pr-1 font-mono text-[11px] bg-muted/60 hover:bg-muted"
        >
          <span>&ldquo;{search}&rdquo;</span>
          <button
            onClick={onClearSearch}
            className="hover:text-foreground p-0.5 rounded-full"
            title="Remove search"
          >
            <NxtqrIcon icon="solar:close-circle-bold" size={12} />
          </button>
        </Badge>
      )}

      {category && category !== "ALL" && (
        <Badge
          variant="secondary"
          className="h-6 gap-1 pl-2 pr-1 font-mono text-[11px] bg-muted/60 hover:bg-muted"
        >
          <span>Type: {category}</span>
          <button
            onClick={onClearCategory}
            className="hover:text-foreground p-0.5 rounded-full"
            title="Remove type filter"
          >
            <NxtqrIcon icon="solar:close-circle-bold" size={12} />
          </button>
        </Badge>
      )}

      {usage && usage !== "all" && (
        <Badge
          variant="secondary"
          className="h-6 gap-1 pl-2 pr-1 font-mono text-[11px] bg-muted/60 hover:bg-muted"
        >
          <span>Usage: {usage === "in_use" ? "In Use" : "Unused"}</span>
          <button
            onClick={onClearUsage}
            className="hover:text-foreground p-0.5 rounded-full"
            title="Remove usage filter"
          >
            <NxtqrIcon icon="solar:close-circle-bold" size={12} />
          </button>
        </Badge>
      )}

      <button
        onClick={onClearAll}
        className="text-[11px] font-mono text-muted-foreground hover:text-foreground ml-1 underline decoration-border"
      >
        Clear all
      </button>
    </div>
  );
}
