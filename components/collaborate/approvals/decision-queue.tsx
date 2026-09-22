"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DecisionCorridorCard } from "./decision-corridor";
import { ApprovalCompactRow } from "./approval-compact-row";
import {
  ApprovalSummary,
  CANONICAL_APPROVAL_TYPES,
  type CanonicalApprovalView,
} from "@/lib/supabase/types/approvals";
import { Search, X, CheckCircle2, ShieldCheck, Filter, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface DecisionQueueProps {
  approvals: ApprovalSummary[];
  organizationSlug: string;
  selectedApprovalId?: string | null;
  onSelectApproval?: (approval: ApprovalSummary) => void;
  onViewImpact?: (approval: ApprovalSummary) => void;
  onOpenFiltersSheet?: () => void;
  activeView: CanonicalApprovalView;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  densityMode: "focused" | "compact";
  onDensityModeChange: (mode: "focused" | "compact") => void;
}

export function DecisionQueue({
  approvals,
  organizationSlug,
  selectedApprovalId,
  onSelectApproval,
  onViewImpact,
  onOpenFiltersSheet,
  activeView,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  sort,
  onSortChange,
  densityMode,
  onDensityModeChange,
}: DecisionQueueProps) {
  const hasActiveFilters = searchQuery.trim() !== "" || typeFilter !== "all" || statusFilter !== "all";
  const activeFilterCount = (typeFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  const handleClearFilters = () => {
    onSearchChange("");
    onTypeFilterChange("all");
    onStatusFilterChange("all");
  };

  return (
    <div className="space-y-4">
      {/* 1. Command Bar: Search, Advanced Filter Sheet Trigger, Sort, Density Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search approvals by resource, public ID, requester, revision..."
            className="pl-9 pr-8 text-xs font-mono h-9 bg-background/50 border-border/70"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          {/* Filters Trigger Button */}
          {onOpenFiltersSheet && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenFiltersSheet}
              className={cn(
                "h-9 px-3 text-xs font-mono border-border/70 bg-background/50 flex items-center gap-1.5",
                activeFilterCount > 0 && "border-primary text-primary font-semibold"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          )}

          {/* Sort Select */}
          <Select value={sort} onValueChange={onSortChange}>
            <SelectTrigger className="w-[145px] h-9 text-xs font-mono bg-background/50 border-border/70">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="font-mono text-xs">
              <SelectItem value="newest">Newest Requested</SelectItem>
              <SelectItem value="oldest_waiting">Oldest Waiting</SelectItem>
              <SelectItem value="recently_decided">Recently Decided</SelectItem>
              <SelectItem value="resource_name">Resource Name</SelectItem>
            </SelectContent>
          </Select>

          {/* Density Switcher: [Focused] vs [Compact] */}
          <div className="flex items-center p-0.5 rounded-lg border border-border/70 bg-muted/30">
            <button
              type="button"
              onClick={() => onDensityModeChange("focused")}
              className={cn(
                "px-2.5 py-1 text-xs font-mono rounded-md flex items-center gap-1 transition-colors cursor-pointer",
                densityMode === "focused"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Decision Corridor (Focused Mode)"
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden sm:inline">Focused</span>
            </button>
            <button
              type="button"
              onClick={() => onDensityModeChange("compact")}
              className={cn(
                "px-2.5 py-1 text-xs font-mono rounded-md flex items-center gap-1 transition-colors cursor-pointer",
                densityMode === "compact"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Governance Ledger (Compact Mode)"
            >
              <List className="w-3 h-3" />
              <span className="hidden sm:inline">Compact</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-muted-foreground">
          <span className="text-[10px] uppercase font-semibold">Active Filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-foreground text-[11px] border border-border/50">
              Query: &quot;{searchQuery}&quot;
              <button onClick={() => onSearchChange("")} className="hover:text-primary">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {typeFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-foreground text-[11px] border border-border/50">
              Domain: {typeFilter}
              <button onClick={() => onTypeFilterChange("all")} className="hover:text-primary">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-foreground text-[11px] border border-border/50">
              Status: {statusFilter}
              <button onClick={() => onStatusFilterChange("all")} className="hover:text-primary">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-[11px] font-mono text-primary hover:underline h-6 px-1.5"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* 3. Decision Queue Entries */}
      {approvals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 p-8 sm:p-12 text-center space-y-3 font-mono">
          {searchQuery ? (
            <>
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">
                APPROVALS / NO MATCH
              </div>
              <h3 className="text-sm font-sans font-semibold text-foreground">
                No approval found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto font-sans">
                Try searching for another resource name, requester, or revision number.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSearchChange("")}
                className="text-xs font-mono mt-2"
              >
                Clear search
              </Button>
            </>
          ) : hasActiveFilters ? (
            <>
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">
                APPROVALS / FILTERED
              </div>
              <h3 className="text-sm font-sans font-semibold text-foreground">
                No approvals match these filters
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto font-sans">
                Try resetting status or resource domain filters to display available decision requests.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs font-mono mt-2"
              >
                Clear filters
              </Button>
            </>
          ) : activeView === "my_queue" ? (
            <>
              {/* NXTQR Monogram Empty State */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-2 text-base font-bold font-mono">
                A
              </div>
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">
                QUEUE / CLEAR
              </div>
              <h3 className="text-sm font-sans font-semibold text-foreground">
                Nothing waiting for you
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto font-sans">
                Approval requests requiring your decision will appear here when submitted.
              </p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">
                APPROVALS / CLEAR
              </div>
              <h3 className="text-sm font-sans font-semibold text-foreground">
                No approval requests yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto font-sans">
                Governed revisions submitted for review will appear here.
              </p>
            </>
          )}
        </div>
      ) : densityMode === "focused" ? (
        /* Focused Mode: Decision Corridor Cards */
        <div className="space-y-4">
          {approvals.map((approval) => (
            <DecisionCorridorCard
              key={approval.id}
              approval={approval}
              organizationSlug={organizationSlug}
              onViewImpact={onViewImpact}
              isSelected={selectedApprovalId === approval.id}
            />
          ))}
        </div>
      ) : (
        /* Compact Mode: Governance Rows */
        <div className="space-y-2">
          {approvals.map((approval) => (
            <ApprovalCompactRow
              key={approval.id}
              approval={approval}
              organizationSlug={organizationSlug}
              onViewImpact={onViewImpact}
              isSelected={selectedApprovalId === approval.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
