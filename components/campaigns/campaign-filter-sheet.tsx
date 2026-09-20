"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CampaignStatus } from "@nxtqr/contracts";
import { cn } from "@/lib/utils";

export interface CampaignFilterState {
  status?: CampaignStatus | "all";
  hasQrs?: "true" | "false" | "all";
  hasScans?: "true" | "false" | "all";
  dateRange?: "today" | "7d" | "30d" | "all";
}

export interface CampaignFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CampaignFilterState;
  onApplyFilters: (filters: CampaignFilterState) => void;
  onResetFilters: () => void;
}

interface CampaignFilterSheetContentProps {
  filters: CampaignFilterState;
  onApplyFilters: (filters: CampaignFilterState) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

function CampaignFilterSheetContent({
  filters,
  onApplyFilters,
  onResetFilters,
  onClose,
}: CampaignFilterSheetContentProps) {
  const [draftFilters, setDraftFilters] = React.useState<CampaignFilterState>(filters);

  const handleApply = () => {
    onApplyFilters(draftFilters);
    onClose();
  };

  const handleReset = () => {
    const empty: CampaignFilterState = {
      status: "all",
      hasQrs: "all",
      hasScans: "all",
      dateRange: "all",
    };
    setDraftFilters(empty);
    onResetFilters();
    onClose();
  };

  const statusOptions: Array<{ value: CampaignStatus | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
  ];

  const qrOptions: Array<{ value: "true" | "false" | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "true", label: "Has QR codes" },
    { value: "false", label: "No QR codes" },
  ];

  const scanOptions: Array<{ value: "true" | "false" | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "true", label: "Has scans" },
    { value: "false", label: "No scans" },
  ];

  const dateOptions: Array<{ value: "today" | "7d" | "30d" | "all"; label: string }> = [
    { value: "all", label: "Anytime" },
    { value: "today", label: "Today" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
  ];

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <SheetHeader className="p-5 border-b border-border/60 text-left">
          <SheetTitle className="text-sm font-semibold tracking-tight uppercase text-muted-foreground flex items-center gap-2">
            <Icon icon="hugeicons:filter" className="w-4 h-4 text-primary" />
            <span>Filter Campaigns</span>
          </SheetTitle>
        </SheetHeader>

        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Status Section */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Lifecycle Status
            </label>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      status: s.value,
                    }))
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    draftFilters.status === s.value || (!draftFilters.status && s.value === "all")
                      ? "bg-primary text-white border-primary shadow-2xs"
                      : "bg-surface border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* QR Assets Presence */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              QR Assets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {qrOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setDraftFilters((prev) => ({ ...prev, hasQrs: opt.value }))
                  }
                  className={cn(
                    "px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-colors",
                    draftFilters.hasQrs === opt.value || (!draftFilters.hasQrs && opt.value === "all")
                      ? "bg-primary/10 border-primary text-primary font-semibold"
                      : "bg-surface border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Scan Activity */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Scan Activity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {scanOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setDraftFilters((prev) => ({ ...prev, hasScans: opt.value }))
                  }
                  className={cn(
                    "px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-colors",
                    draftFilters.hasScans === opt.value || (!draftFilters.hasScans && opt.value === "all")
                      ? "bg-primary/10 border-primary text-primary font-semibold"
                      : "bg-surface border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Creation Date Range */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Created Period
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {dateOptions.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() =>
                    setDraftFilters((prev) => ({ ...prev, dateRange: d.value }))
                  }
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors",
                    draftFilters.dateRange === d.value || (!draftFilters.dateRange && d.value === "all")
                      ? "bg-primary/10 border-primary text-primary font-semibold"
                      : "bg-surface border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <SheetFooter className="p-4 border-t border-border/60 bg-surface-elevated/40 flex flex-row items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="text-xs h-9 px-4 border-border bg-surface"
        >
          Reset
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={handleApply}
          className="text-xs h-9 px-5 bg-primary hover:bg-[#CC3A05] text-white font-semibold shadow-xs"
        >
          Apply Filters
        </Button>
      </SheetFooter>
    </div>
  );
}

export function CampaignFilterSheet({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
  onResetFilters,
}: CampaignFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col justify-between"
      >
        {open && (
          <CampaignFilterSheetContent
            filters={filters}
            onApplyFilters={onApplyFilters}
            onResetFilters={onResetFilters}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
