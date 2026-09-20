"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignStatus } from "@nxtqr/contracts";
import { cn } from "@/lib/utils";

export interface CampaignCommandBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter?: CampaignStatus | "all";
  onStatusFilterChange: (status: CampaignStatus | "all") => void;
  sortBy: "updatedAt" | "createdAt" | "name" | "totalScans";
  order: "asc" | "desc";
  onSortChange: (sortBy: "updatedAt" | "createdAt" | "name" | "totalScans", order: "asc" | "desc") => void;
  activeFilterCount: number;
  onOpenFilterSheet: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  className?: string;
}

const SORT_OPTIONS: Array<{
  label: string;
  sortBy: "updatedAt" | "createdAt" | "name" | "totalScans";
  order: "asc" | "desc";
}> = [
  { label: "Recently updated", sortBy: "updatedAt", order: "desc" },
  { label: "Newest first", sortBy: "createdAt", order: "desc" },
  { label: "Oldest first", sortBy: "createdAt", order: "asc" },
  { label: "Name A–Z", sortBy: "name", order: "asc" },
  { label: "Name Z–A", sortBy: "name", order: "desc" },
  { label: "Most scans", sortBy: "totalScans", order: "desc" },
];

export function CampaignCommandBar({
  search,
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  sortBy,
  order,
  onSortChange,
  activeFilterCount,
  onOpenFilterSheet,
  viewMode,
  onViewModeChange,
  className,
}: CampaignCommandBarProps) {
  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.sortBy === sortBy && s.order === order)?.label || "Sort";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5",
        className
      )}
    >
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Icon
          icon="hugeicons:search-01"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search campaigns by name or description..."
          className="pl-9 pr-8 h-9 text-xs bg-surface border-border shadow-2xs"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <Icon icon="hugeicons:cancel-01" className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Control Bar Actions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {/* Status Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 bg-surface border-border shrink-0"
            >
              <Icon icon="hugeicons:filter-horizontal" className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="capitalize">{statusFilter === "all" ? "All Statuses" : statusFilter}</span>
              <Icon icon="hugeicons:arrow-down-01" className="w-3 h-3 text-muted-foreground opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            <DropdownMenuItem onClick={() => onStatusFilterChange("all")}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange("active")}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange("draft")}>
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange("paused")}>
              Paused
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange("completed")}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange("archived")}>
              Archived
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 bg-surface border-border shrink-0"
            >
              <Icon icon="hugeicons:sorting-01" className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{currentSortLabel}</span>
              <Icon icon="hugeicons:arrow-down-01" className="w-3 h-3 text-muted-foreground opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={`${opt.sortBy}-${opt.order}`}
                onClick={() => onSortChange(opt.sortBy, opt.order)}
                className={cn(
                  sortBy === opt.sortBy && order === opt.order && "font-semibold text-primary"
                )}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Advanced Filters Sheet Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenFilterSheet}
          className={cn(
            "h-9 text-xs gap-1.5 bg-surface border-border shrink-0",
            activeFilterCount > 0 && "border-primary/50 text-primary bg-primary/5"
          )}
        >
          <Icon icon="hugeicons:filter" className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-primary text-white text-[10px] font-mono font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* View Toggle (Grid / List) */}
        <div className="flex items-center border border-border rounded-lg p-0.5 bg-surface shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            aria-label="Grid view"
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-muted text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon icon="hugeicons:grid-view" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            aria-label="List view"
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
              viewMode === "list"
                ? "bg-muted text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon icon="hugeicons:menu-02" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
