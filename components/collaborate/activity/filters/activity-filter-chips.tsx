"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityFilterChipsProps {
  category?: string;
  onClearCategory: () => void;
  resourceType?: string;
  onClearResourceType: () => void;
  actorId?: string;
  onClearActor: () => void;
  search?: string;
  onClearSearch: () => void;
  onClearAll: () => void;
  className?: string;
}

export function ActivityFilterChips({
  category,
  onClearCategory,
  resourceType,
  onClearResourceType,
  actorId,
  onClearActor,
  search,
  onClearSearch,
  onClearAll,
  className,
}: ActivityFilterChipsProps) {
  const hasActiveFilters =
    (category && category !== "all") ||
    (resourceType && resourceType !== "all") ||
    Boolean(actorId) ||
    Boolean(search);

  if (!hasActiveFilters) return null;

  return (
    <div className={`flex items-center gap-1.5 flex-wrap text-xs font-mono select-none ${className || ""}`}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        Active Filters:
      </span>

      {category && category !== "all" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FA520F]/10 border border-[#FA520F]/30 text-foreground text-[11px]">
          <span>Category: <strong className="text-[#FA520F] uppercase">{category}</strong></span>
          <button type="button" onClick={onClearCategory} className="hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {resourceType && resourceType !== "all" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border/80 text-foreground text-[11px]">
          <span>Resource: <strong className="uppercase">{resourceType}</strong></span>
          <button type="button" onClick={onClearResourceType} className="hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {actorId && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border/80 text-foreground text-[11px]">
          <span>Actor: <strong className="uppercase">{actorId === "system" ? "System" : "Member"}</strong></span>
          <button type="button" onClick={onClearActor} className="hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {search && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border/80 text-foreground text-[11px]">
          <span>Search: &ldquo;{search}&rdquo;</span>
          <button type="button" onClick={onClearSearch} className="hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground font-mono"
      >
        Clear all
      </Button>
    </div>
  );
}
