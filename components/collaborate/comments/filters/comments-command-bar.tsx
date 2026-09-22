"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { CANONICAL_COMMENT_CONTEXTS } from "@/lib/supabase/types/comments";

interface CommentsCommandBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  domainFilter: string;
  onDomainFilterChange: (domain: string) => void;
  stateFilter: string;
  onStateFilterChange: (state: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  onOpenAdvancedFilters?: () => void;
  activeFilterCount?: number;
}

export function CommentsCommandBar({
  searchQuery,
  onSearchChange,
  domainFilter,
  onDomainFilterChange,
  stateFilter,
  onStateFilterChange,
  sort,
  onSortChange,
  onOpenAdvancedFilters,
  activeFilterCount = 0,
}: CommentsCommandBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search discussions, participants, references..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-8 text-xs bg-background"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Context Domain */}
        <Select value={domainFilter} onValueChange={onDomainFilterChange}>
          <SelectTrigger className="h-9 w-[130px] text-xs">
            <SelectValue placeholder="Context" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Contexts</SelectItem>
            {CANONICAL_COMMENT_CONTEXTS.map((c) => (
              <SelectItem key={c.type} value={c.type}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* State */}
        <Select value={stateFilter} onValueChange={onStateFilterChange}>
          <SelectTrigger className="h-9 w-[110px] text-xs">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-[135px] text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest_activity">Latest Activity</SelectItem>
            <SelectItem value="oldest">Oldest Waiting</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Trigger */}
        {onOpenAdvancedFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAdvancedFilters}
            className="h-9 text-xs gap-1.5 px-3"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">More</span>
            {activeFilterCount > 0 && (
              <span className="h-4 w-4 rounded-full bg-[#CC785C] text-white text-[10px] flex items-center justify-center font-mono">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
