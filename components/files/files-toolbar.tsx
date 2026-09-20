"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface FilesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  usage: string;
  onUsageChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function FilesToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  usage,
  onUsageChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: FilesToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 select-none">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-0">
        <NxtqrIcon
          icon="solar:magnifer-linear"
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search files by name..."
          className="pl-9 pr-8 text-xs h-9 bg-card border-border/60 rounded-xl w-full"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            title="Clear search"
          >
            <NxtqrIcon icon="solar:close-circle-bold" size={14} />
          </button>
        )}
      </div>

      {/* Filter and View Controls Row */}
      <div className="flex items-center gap-1.5 sm:gap-2 justify-between shrink-0">
        {/* Type / Category Filter */}
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-9 text-xs bg-card border-border/60 rounded-xl flex-1 sm:flex-initial sm:w-[125px] min-w-[90px] px-2 sm:px-3">
            <div className="flex items-center gap-1 sm:gap-1.5 truncate">
              <NxtqrIcon icon="solar:filter-linear" size={13} className="text-muted-foreground shrink-0" />
              <SelectValue placeholder="Type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="IMAGE">Images</SelectItem>
            <SelectItem value="DOCUMENT">Documents</SelectItem>
            <SelectItem value="VIDEO">Videos</SelectItem>
            <SelectItem value="AUDIO">Audio</SelectItem>
            <SelectItem value="ARCHIVE">Archives</SelectItem>
            <SelectItem value="BRAND">Brand</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Usage Filter */}
        <Select value={usage} onValueChange={onUsageChange}>
          <SelectTrigger className="h-9 text-xs bg-card border-border/60 rounded-xl flex-1 sm:flex-initial sm:w-[115px] min-w-[85px] px-2 sm:px-3">
            <div className="flex items-center gap-1 sm:gap-1.5 truncate">
              <NxtqrIcon icon="solar:link-circle-linear" size={13} className="text-muted-foreground shrink-0" />
              <SelectValue placeholder="Usage" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Usage</SelectItem>
            <SelectItem value="in_use">In Use</SelectItem>
            <SelectItem value="unused">Unused</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 text-xs bg-card border-border/60 rounded-xl flex-1 sm:flex-initial sm:w-[135px] min-w-[85px] px-2 sm:px-3">
            <div className="flex items-center gap-1 sm:gap-1.5 truncate">
              <NxtqrIcon icon="solar:sort-vertical-linear" size={13} className="text-muted-foreground shrink-0" />
              <SelectValue placeholder="Sort" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">Updated</SelectItem>
            <SelectItem value="createdAt">Newest</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
            <SelectItem value="sizeBytes">Largest</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Switcher (Grid | List) */}
        <div className="flex items-center rounded-xl border border-border/60 bg-muted/30 p-0.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "h-8 w-8 rounded-lg transition-colors cursor-pointer",
              viewMode === "grid"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Grid View"
          >
            <NxtqrIcon icon="solar:widget-2-linear" size={15} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "h-8 w-8 rounded-lg transition-colors cursor-pointer",
              viewMode === "list"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="List View"
          >
            <NxtqrIcon icon="solar:list-linear" size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}
