"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANONICAL_APPROVAL_TYPES, type ApprovalType } from "@/lib/supabase/types/approvals";
import { Filter, X } from "lucide-react";

interface ApprovalFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  matchingCount: number;
  onClearAll: () => void;
}

export function ApprovalFiltersSheet({
  isOpen,
  onClose,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  sort,
  onSortChange,
  matchingCount,
  onClearAll,
}: ApprovalFiltersSheetProps) {
  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "PENDING", label: "Waiting Review" },
    { value: "IN_REVIEW", label: "In Review" },
    { value: "APPROVED", label: "Approved" },
    { value: "CHANGES_REQUESTED", label: "Changes Requested" },
    { value: "REJECTED", label: "Rejected" },
    { value: "WITHDRAWN", label: "Withdrawn / Cancelled" },
  ];

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md font-mono text-xs flex flex-col justify-between bg-card/95 backdrop-blur-md border-l border-border p-6"
      >
        <div className="space-y-6">
          <SheetHeader className="text-left space-y-1">
            <div className="text-[10px] text-primary uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <Filter className="w-3 h-3" />
              GOVERNANCE / FILTERS
            </div>
            <SheetTitle className="text-base font-sans font-semibold text-foreground">
              Filter Approvals
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Filter queue by governance gate status, resource category, or sort sequence.
            </SheetDescription>
          </SheetHeader>

          {/* 1. Status Filter */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
              Status Gate
            </label>
            <div className="space-y-1.5">
              {statuses.map((s) => (
                <div
                  key={s.value}
                  onClick={() => onStatusFilterChange(s.value)}
                  className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/60 cursor-pointer transition-colors"
                >
                  <Checkbox
                    id={`status-${s.value}`}
                    checked={statusFilter === s.value}
                    onCheckedChange={() => onStatusFilterChange(s.value)}
                  />
                  <Label
                    htmlFor={`status-${s.value}`}
                    className="text-xs font-mono cursor-pointer flex-1"
                  >
                    {s.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Resource Type */}
          <div className="space-y-2.5 pt-2 border-t border-border/50">
            <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
              Resource Domain
            </label>
            <Select value={typeFilter} onValueChange={onTypeFilterChange}>
              <SelectTrigger className="w-full h-9 text-xs font-mono bg-background/60">
                <SelectValue placeholder="All Resource Types" />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs max-h-56">
                <SelectItem value="all">All Resource Types</SelectItem>
                {CANONICAL_APPROVAL_TYPES.map((t) => (
                  <SelectItem key={t.type} value={t.type}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Sorting */}
          <div className="space-y-2.5 pt-2 border-t border-border/50">
            <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
              Sort Sequence
            </label>
            <Select value={sort} onValueChange={onSortChange}>
              <SelectTrigger className="w-full h-9 text-xs font-mono bg-background/60">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                <SelectItem value="newest">Newest Requested</SelectItem>
                <SelectItem value="oldest_waiting">Oldest Waiting</SelectItem>
                <SelectItem value="recently_decided">Recently Decided</SelectItem>
                <SelectItem value="resource_name">Resource Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            disabled={!hasActiveFilters}
            className="text-xs font-mono text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="text-xs font-mono bg-primary hover:bg-primary/90 text-white"
          >
            Show {matchingCount} {matchingCount === 1 ? "request" : "requests"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
