"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { DomainStatus, DomainVerificationStatus, DomainRoutingStatus } from "@nxtqr/contracts";

export interface DomainFilterCriteria {
  status: DomainStatus | "all" | "issues";
  dnsStatus: DomainVerificationStatus | "all";
  routingStatus: DomainRoutingStatus | "all";
  hasUsage: "all" | "assigned" | "unassigned";
}

export type DomainSortOption =
  | "newest"
  | "oldest"
  | "hostname-asc"
  | "hostname-desc";

interface DomainFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: DomainFilterCriteria;
  onFilterChange: (filters: DomainFilterCriteria) => void;
  sortOption: DomainSortOption;
  onSortChange: (sort: DomainSortOption) => void;
  isFilterSheetOpen: boolean;
  onFilterSheetOpenChange: (open: boolean) => void;
  onResetFilters: () => void;
}

export function DomainFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  sortOption,
  onSortChange,
  isFilterSheetOpen,
  onFilterSheetOpenChange,
  onResetFilters,
}: DomainFiltersProps) {
  // Compute active filters
  const activeChips = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (filters.status !== "all") {
      chips.push({
        key: "status",
        label: `Status: ${filters.status}`,
        onRemove: () => onFilterChange({ ...filters, status: "all" }),
      });
    }
    if (filters.dnsStatus !== "all") {
      chips.push({
        key: "dnsStatus",
        label: `DNS: ${filters.dnsStatus}`,
        onRemove: () => onFilterChange({ ...filters, dnsStatus: "all" }),
      });
    }
    if (filters.routingStatus !== "all") {
      chips.push({
        key: "routingStatus",
        label: `Routing: ${filters.routingStatus}`,
        onRemove: () => onFilterChange({ ...filters, routingStatus: "all" }),
      });
    }
    if (filters.hasUsage !== "all") {
      chips.push({
        key: "hasUsage",
        label: `Usage: ${filters.hasUsage === "assigned" ? "Assigned" : "Unassigned"}`,
        onRemove: () => onFilterChange({ ...filters, hasUsage: "all" }),
      });
    }

    return chips;
  }, [filters, onFilterChange]);

  return (
    <div className="space-y-3">
      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Icon
            icon="solar:magnifer-linear"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search domains by hostname or label..."
            className="pl-9 h-9 text-xs bg-background text-foreground border-border focus-visible:ring-[#FA520F]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              <Icon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
          {/* Quick Sort Select */}
          <Select
            value={sortOption}
            onValueChange={(val) => onSortChange(val as DomainSortOption)}
          >
            <SelectTrigger className="h-9 text-xs w-[140px] sm:w-[150px] bg-surface border-border">
              <SelectValue placeholder="Sort domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="hostname-asc">Domain (A → Z)</SelectItem>
              <SelectItem value="hostname-desc">Domain (Z → A)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterSheetOpenChange(true)}
            className="h-9 text-xs gap-1.5 border-border bg-surface hover:bg-surface/80 text-foreground"
          >
            <Icon icon="solar:filter-linear" className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeChips.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 px-1.5 py-0 text-[10px] bg-[#FA520F]/15 text-[#FA520F] font-mono"
              >
                {activeChips.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-muted-foreground">Active filters:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] bg-surface border border-border text-foreground"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="hover:text-destructive text-muted-foreground transition-colors"
                title="Remove filter"
              >
                <Icon icon="solar:close-circle-bold" className="w-3 h-3" />
              </button>
            </span>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Drawer / Sheet */}
      <Sheet open={isFilterSheetOpen} onOpenChange={onFilterSheetOpenChange}>
        <SheetContent side="right" className="w-full sm:w-[420px] p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <SheetHeader className="text-left">
              <SheetTitle className="text-lg font-bold text-foreground">
                Domain Filters
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Filter your domain registry by lifecycle status, DNS verification, and edge routing.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 pt-2">
              {/* Lifecycle Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Lifecycle Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(val) =>
                    onFilterChange({ ...filters, status: val as DomainStatus | "all" | "issues" })
                  }
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending Verification</SelectItem>
                    <SelectItem value="FAILED">Failed / Issues</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* DNS Verification */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">DNS Verification</label>
                <Select
                  value={filters.dnsStatus}
                  onValueChange={(val) =>
                    onFilterChange({ ...filters, dnsStatus: val as DomainVerificationStatus | "all" })
                  }
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="All DNS states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All DNS states</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Routing Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Edge Routing</label>
                <Select
                  value={filters.routingStatus}
                  onValueChange={(val) =>
                    onFilterChange({ ...filters, routingStatus: val as DomainRoutingStatus | "all" })
                  }
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="All Routing states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Routing states</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="NOT_CONFIGURED">Not Configured</SelectItem>
                    <SelectItem value="DISABLED">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resource Usage */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Resource Assignment</label>
                <Select
                  value={filters.hasUsage}
                  onValueChange={(val) =>
                    onFilterChange({ ...filters, hasUsage: val as "all" | "assigned" | "unassigned" })
                  }
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="All Domains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    <SelectItem value="assigned">Assigned to QR / Campaigns</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row items-center justify-between pt-6 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="text-xs h-9"
            >
              Reset All
            </Button>
            <Button
              size="sm"
              onClick={() => onFilterSheetOpenChange(false)}
              className="bg-[#FA520F] hover:bg-[#E0480C] text-white text-xs h-9 cursor-pointer"
            >
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
