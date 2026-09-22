"use client";

import * as React from "react";
import { X } from "lucide-react";
import { CANONICAL_COMMENT_CONTEXTS } from "@/lib/supabase/types/comments";

interface ActiveCommentFiltersProps {
  domainFilter: string;
  onClearDomain: () => void;
  stateFilter: string;
  onClearState: () => void;
  searchQuery: string;
  onClearSearch: () => void;
  onClearAll: () => void;
  className?: string;
}

export function ActiveCommentFilters({
  domainFilter,
  onClearDomain,
  stateFilter,
  onClearState,
  searchQuery,
  onClearSearch,
  onClearAll,
  className,
}: ActiveCommentFiltersProps) {
  const hasDomain = domainFilter !== "all";
  const hasState = stateFilter !== "all";
  const hasSearch = Boolean(searchQuery.trim());

  if (!hasDomain && !hasState && !hasSearch) {
    return null;
  }

  const domainLabel =
    CANONICAL_COMMENT_CONTEXTS.find((c) => c.type === domainFilter)?.label ||
    domainFilter.toUpperCase();

  return (
    <div className="flex flex-wrap items-center gap-2 py-1 text-xs font-mono">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
        FILTERS:
      </span>

      {hasDomain && (
        <button
          onClick={onClearDomain}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground border border-border/80 transition-colors"
        >
          <span className="text-[10px] text-muted-foreground">CONTEXT /</span>
          <span>{domainLabel}</span>
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </button>
      )}

      {hasState && (
        <button
          onClick={onClearState}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground border border-border/80 transition-colors"
        >
          <span className="text-[10px] text-muted-foreground">STATE /</span>
          <span className="uppercase">{stateFilter}</span>
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </button>
      )}

      {hasSearch && (
        <button
          onClick={onClearSearch}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground border border-border/80 transition-colors"
        >
          <span className="text-[10px] text-muted-foreground">SEARCH /</span>
          <span className="truncate max-w-[120px]">&quot;{searchQuery}&quot;</span>
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </button>
      )}

      <button
        onClick={onClearAll}
        className="text-[10px] tracking-wider text-[#CC785C] hover:underline underline-offset-4 ml-1"
      >
        Clear all
      </button>
    </div>
  );
}
