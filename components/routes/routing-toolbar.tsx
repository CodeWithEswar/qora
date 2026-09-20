"use client";

import * as React from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  RoutingFilterState,
  RoutingFilterStatus,
  RoutingFilterMode,
  RoutingSortOption,
  RoutingLayoutMode,
} from "./types";

interface RoutingToolbarProps {
  filters: RoutingFilterState;
  onFilterChange: (newFilters: Partial<RoutingFilterState>) => void;
  onResetFilters: () => void;
  layoutMode: RoutingLayoutMode;
  onLayoutModeChange: (mode: RoutingLayoutMode) => void;
  totalAssetsCount: number;
  filteredAssetsCount: number;
}

export function RoutingToolbar({
  filters,
  onFilterChange,
  onResetFilters,
  layoutMode,
  onLayoutModeChange,
  totalAssetsCount,
  filteredAssetsCount,
}: RoutingToolbarProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.status !== "all" ||
    filters.mode !== "all";

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#85827B]" />
          <Input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search routes, QR assets, destinations..."
            className="pl-9 pr-8 h-9 text-xs bg-[#161619] border-white/10 text-[#F7F4EC] placeholder:text-[#85827B] focus-visible:ring-[#FA520F]/50 focus-visible:border-[#FA520F]/50"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: "" })}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#85827B] hover:text-[#F7F4EC] p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Controls: Filter popover (desktop), Filter sheet (mobile), Sort, Layout toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Desktop Filter Popover */}
          <div className="hidden sm:block">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-9 gap-1.5 text-xs font-medium border-white/10 bg-[#161619] hover:bg-[#202024] text-[#F7F4EC] ${
                    filters.status !== "all" || filters.mode !== "all"
                      ? "border-[#FA520F]/40 text-[#FA520F] bg-[#FA520F]/5"
                      : ""
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filters</span>
                  {(filters.status !== "all" || filters.mode !== "all") && (
                    <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#FA520F]" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-72 p-4 bg-[#18181b] border-white/10 text-[#F7F4EC] space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#B8B5AD]">
                    Filter Routes
                  </span>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="text-[11px] text-[#FA520F] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[#85827B]">
                    Status
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["all", "active", "paused"] as RoutingFilterStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => onFilterChange({ status: st })}
                          className={`px-2 py-1 text-xs rounded border text-center capitalize transition-colors ${
                            filters.status === st
                              ? "bg-[#FA520F]/15 border-[#FA520F]/50 text-[#FA520F] font-medium"
                              : "bg-[#111111] border-white/10 text-[#B8B5AD] hover:bg-white/5"
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Routing Mode Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[#85827B]">
                    Routing Architecture
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: "all", label: "All" },
                        { id: "conditional", label: "Rules" },
                        { id: "default", label: "Default" },
                      ] as { id: RoutingFilterMode; label: string }[]
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onFilterChange({ mode: m.id })}
                        className={`px-2 py-1 text-xs rounded border text-center transition-colors ${
                          filters.mode === m.id
                            ? "bg-[#FA520F]/15 border-[#FA520F]/50 text-[#FA520F] font-medium"
                            : "bg-[#111111] border-white/10 text-[#B8B5AD] hover:bg-white/5"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile Filter Sheet */}
          <div className="sm:hidden">
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs font-medium border-white/10 bg-[#161619] text-[#F7F4EC]"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="bg-[#18181b] border-white/10 text-[#F7F4EC] rounded-t-2xl p-6 space-y-5"
              >
                <SheetHeader>
                  <SheetTitle className="text-sm font-semibold uppercase tracking-wider text-[#F7F4EC]">
                    Filter Routing Assets
                  </SheetTitle>
                </SheetHeader>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#85827B]">Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["all", "active", "paused"] as RoutingFilterStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => onFilterChange({ status: st })}
                        className={`px-3 py-2 text-xs rounded-md border capitalize font-medium ${
                          filters.status === st
                            ? "bg-[#FA520F]/20 border-[#FA520F] text-[#FA520F]"
                            : "bg-[#141414] border-white/10 text-[#B8B5AD]"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Routing Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#85827B]">Routing Configuration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "all", label: "All" },
                        { id: "conditional", label: "Conditional" },
                        { id: "default", label: "Default only" },
                      ] as { id: RoutingFilterMode; label: string }[]
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onFilterChange({ mode: m.id })}
                        className={`px-3 py-2 text-xs rounded-md border font-medium ${
                          filters.mode === m.id
                            ? "bg-[#FA520F]/20 border-[#FA520F] text-[#FA520F]"
                            : "bg-[#141414] border-white/10 text-[#B8B5AD]"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <SheetFooter className="pt-2 flex flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onResetFilters}
                    className="flex-1 text-xs border-white/10 text-[#B8B5AD]"
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="flex-1 text-xs bg-[#FA520F] hover:bg-[#d9440a] text-white"
                  >
                    Apply Filters
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {/* Sort Select */}
          <Select
            value={filters.sort}
            onValueChange={(val) =>
              onFilterChange({ sort: val as RoutingSortOption })
            }
          >
            <SelectTrigger className="h-9 w-[140px] text-xs bg-[#161619] border-white/10 text-[#F7F4EC] focus:ring-[#FA520F]/50">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-[#18181b] border-white/10 text-[#F7F4EC]">
              <SelectItem value="updated" className="text-xs focus:bg-white/5">
                Recently Updated
              </SelectItem>
              <SelectItem value="name" className="text-xs focus:bg-white/5">
                Asset Name
              </SelectItem>
              <SelectItem value="rules" className="text-xs focus:bg-white/5">
                Most Rules
              </SelectItem>
              <SelectItem value="slug" className="text-xs focus:bg-white/5">
                Slug Path
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Grid / List Layout Toggle */}
          <div className="flex items-center rounded-md border border-white/10 bg-[#161619] p-0.5">
            <button
              type="button"
              onClick={() => onLayoutModeChange("grid")}
              aria-label="Grid layout"
              className={`p-1.5 rounded text-xs transition-colors ${
                layoutMode === "grid"
                  ? "bg-[#FA520F]/15 text-[#FA520F]"
                  : "text-[#85827B] hover:text-[#F7F4EC]"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onLayoutModeChange("list")}
              aria-label="List layout"
              className={`p-1.5 rounded text-xs transition-colors ${
                layoutMode === "list"
                  ? "bg-[#FA520F]/15 text-[#FA520F]"
                  : "text-[#85827B] hover:text-[#F7F4EC]"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] text-[#85827B]">Active filters:</span>

          {filters.searchQuery && (
            <Badge
              variant="outline"
              className="gap-1 border-white/10 bg-[#1a1a1d] text-[#F7F4EC] font-normal text-[11px] py-0.5 px-2"
            >
              Query: &quot;{filters.searchQuery}&quot;
              <button
                type="button"
                onClick={() => onFilterChange({ searchQuery: "" })}
                className="hover:text-[#FA520F] ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.status !== "all" && (
            <Badge
              variant="outline"
              className="gap-1 border-white/10 bg-[#1a1a1d] text-[#F7F4EC] font-normal text-[11px] py-0.5 px-2 capitalize"
            >
              Status: {filters.status}
              <button
                type="button"
                onClick={() => onFilterChange({ status: "all" })}
                className="hover:text-[#FA520F] ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.mode !== "all" && (
            <Badge
              variant="outline"
              className="gap-1 border-white/10 bg-[#1a1a1d] text-[#F7F4EC] font-normal text-[11px] py-0.5 px-2"
            >
              Mode: {filters.mode === "conditional" ? "Conditional" : "Default Only"}
              <button
                type="button"
                onClick={() => onFilterChange({ mode: "all" })}
                className="hover:text-[#FA520F] ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] text-[#FA520F] hover:underline ml-1"
          >
            Clear all
          </button>

          <span className="text-[11px] font-mono text-[#85827B] ml-auto">
            Showing {filteredAssetsCount} of {totalAssetsCount} assets
          </span>
        </div>
      )}
    </div>
  );
}
