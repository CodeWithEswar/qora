"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface FoldersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: "active" | "archived" | "all";
  onStatusFilterChange: (status: "active" | "archived" | "all") => void;
  sortBy: "updatedAt" | "createdAt" | "name" | "qrCount";
  order: "asc" | "desc";
  onSortChange: (sortBy: "updatedAt" | "createdAt" | "name" | "qrCount", order: "asc" | "desc") => void;
  viewMode: "field" | "list";
  onViewModeChange: (mode: "field" | "list") => void;
  onResetFilters?: () => void;
  activeFilterCount?: number;
}

export function FoldersToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  order,
  onSortChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  activeFilterCount = 0,
}: FoldersToolbarProps) {
  const sortLabels: Record<string, string> = {
    "updatedAt-desc": "Recently Updated",
    "createdAt-desc": "Newest Created",
    "createdAt-asc": "Oldest Created",
    "name-asc": "Name (A–Z)",
    "name-desc": "Name (Z–A)",
    "qrCount-desc": "Most QR Assets",
    "qrCount-asc": "Fewest QR Assets",
  };

  const currentSortKey = `${sortBy}-${order}`;
  const currentSortLabel = sortLabels[currentSortKey] || "Recently Updated";

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:max-w-sm">
        <NxtqrIcon
          icon="solar:magnifer-linear"
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search folder spaces..."
          className="h-9 pl-8.5 pr-8 text-xs bg-white dark:bg-[#18181B] border-border/80 dark:border-white/[0.08] w-full"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          >
            <NxtqrIcon icon="solar:close-circle-bold" size={13} />
          </button>
        )}
      </div>

      {/* Controls: Filter, Sort, View Toggle */}
      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
        {/* Status Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 text-xs gap-1.5 font-medium border-border/80 dark:border-white/[0.08] bg-white dark:bg-[#18181B] flex-1 sm:flex-initial",
                statusFilter !== "active" && "border-primary text-primary"
              )}
            >
              <NxtqrIcon icon="solar:filter-linear" size={14} />
              <span>
                {statusFilter === "all"
                  ? "All Statuses"
                  : statusFilter === "archived"
                  ? "Archived"
                  : "Active"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 text-xs">
            <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Filter by Status
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onStatusFilterChange("active")}
              className={cn(statusFilter === "active" && "font-semibold text-primary")}
            >
              Active Spaces
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusFilterChange("archived")}
              className={cn(statusFilter === "archived" && "font-semibold text-primary")}
            >
              Archived Spaces
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusFilterChange("all")}
              className={cn(statusFilter === "all" && "font-semibold text-primary")}
            >
              All Spaces
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 font-medium border-border/80 dark:border-white/[0.08] bg-white dark:bg-[#18181B] flex-1 sm:flex-initial truncate"
            >
              <NxtqrIcon icon="solar:sort-vertical-linear" size={14} className="shrink-0" />
              <span className="truncate">{currentSortLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-xs">
            <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Sort Spaces By
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onSortChange("updatedAt", "desc")}
              className={cn(currentSortKey === "updatedAt-desc" && "font-semibold text-primary")}
            >
              Recently Updated
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("createdAt", "desc")}
              className={cn(currentSortKey === "createdAt-desc" && "font-semibold text-primary")}
            >
              Newest Created
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("createdAt", "asc")}
              className={cn(currentSortKey === "createdAt-asc" && "font-semibold text-primary")}
            >
              Oldest Created
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onSortChange("name", "asc")}
              className={cn(currentSortKey === "name-asc" && "font-semibold text-primary")}
            >
              Name (A–Z)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("name", "desc")}
              className={cn(currentSortKey === "name-desc" && "font-semibold text-primary")}
            >
              Name (Z–A)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onSortChange("qrCount", "desc")}
              className={cn(currentSortKey === "qrCount-desc" && "font-semibold text-primary")}
            >
              Most QR Assets
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("qrCount", "asc")}
              className={cn(currentSortKey === "qrCount-asc" && "font-semibold text-primary")}
            >
              Fewest QR Assets
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle: Field Grid vs List Table */}
        <div
          role="group"
          aria-label="View Mode"
          className="inline-flex items-center bg-muted/40 dark:bg-white/[0.04] p-0.5 rounded-lg border border-border/60"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Field view"
            onClick={() => onViewModeChange("field")}
            className={cn(
              "h-8 w-8 p-0 rounded-md transition-all",
              viewMode === "field"
                ? "bg-white dark:bg-[#27272A] text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <NxtqrIcon icon="solar:widget-linear" size={15} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="List view"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "h-8 w-8 p-0 rounded-md transition-all",
              viewMode === "list"
                ? "bg-white dark:bg-[#27272A] text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <NxtqrIcon icon="solar:list-linear" size={15} />
          </Button>
        </div>

        {/* Reset filter chip if active */}
        {activeFilterCount > 0 && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-xs text-muted-foreground hover:text-foreground px-2"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
