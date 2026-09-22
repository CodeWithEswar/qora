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
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface ActivityFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryFilter?: string;
  onCategoryFilterChange: (cat: string) => void;
  resourceFilter?: string;
  onResourceFilterChange: (res: string) => void;
  dateRange: string;
  onDateRangeChange: (range: "24h" | "7d" | "30d" | "90d") => void;
  onClearAll: () => void;
  matchingCount: number;
}

export function ActivityFilterSheet({
  open,
  onOpenChange,
  categoryFilter = "all",
  onCategoryFilterChange,
  resourceFilter = "all",
  onResourceFilterChange,
  dateRange,
  onDateRangeChange,
  onClearAll,
  matchingCount,
}: ActivityFilterSheetProps) {
  const categories = [
    { id: "all", label: "All Categories" },
    { id: "publish", label: "Publishes" },
    { id: "approval", label: "Approvals" },
    { id: "create", label: "Creations" },
    { id: "update", label: "Updates" },
    { id: "comment", label: "Discussions" },
    { id: "routing", label: "Routing" },
    { id: "team", label: "Teams" },
    { id: "membership", label: "Access & Roles" },
    { id: "archive", label: "Archival" },
  ];

  const resourceTypes = [
    { id: "all", label: "All Resources" },
    { id: "qr", label: "QR Codes" },
    { id: "campaign", label: "Campaigns" },
    { id: "brand_kit", label: "Brand Kits" },
    { id: "route", label: "Smart Routes" },
    { id: "template", label: "Templates" },
    { id: "team", label: "Teams" },
    { id: "domain", label: "Domains" },
    { id: "guardian", label: "Guardian Probes" },
  ];

  const dateRanges = [
    { id: "24h", label: "Past 24 Hours" },
    { id: "7d", label: "Past 7 Days" },
    { id: "30d", label: "Past 30 Days (Default)" },
    { id: "90d", label: "Past 90 Days" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-background text-foreground font-mono text-xs select-none">
        <div className="p-6 space-y-6">
          <SheetHeader className="space-y-1 text-left">
            <div className="text-[10px] uppercase tracking-widest text-[#FA520F] flex items-center gap-1.5 font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>OBSERVATORY / FILTERS</span>
            </div>
            <SheetTitle className="text-base font-bold font-sans">
              Filter Operational Activity
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground font-sans">
              Filter product events by action classification, resource type, and time window.
            </SheetDescription>
          </SheetHeader>

          {/* Section 1: Date Range */}
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              01 / Time Window
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {dateRanges.map((dr) => (
                <button
                  key={dr.id}
                  type="button"
                  onClick={() => onDateRangeChange(dr.id as any)}
                  className={`p-2.5 rounded-lg border text-left text-xs font-mono transition-colors ${
                    dateRange === dr.id
                      ? "border-[#FA520F] bg-[#FA520F]/10 text-foreground font-bold"
                      : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {dr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Action Category */}
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              02 / Action Classification
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCategoryFilterChange(c.id)}
                  className={`p-2 rounded-lg border text-left text-xs font-mono transition-colors ${
                    categoryFilter === c.id
                      ? "border-[#FA520F] bg-[#FA520F]/10 text-foreground font-bold"
                      : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Resource Scope */}
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              03 / Resource Scope
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {resourceTypes.map((rt) => (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => onResourceFilterChange(rt.id)}
                  className={`p-2 rounded-lg border text-left text-xs font-mono transition-colors ${
                    resourceFilter === rt.id
                      ? "border-[#FA520F] bg-[#FA520F]/10 text-foreground font-bold"
                      : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="p-4 border-t border-border/70 bg-muted/20 flex flex-row items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs font-mono text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-mono bg-[#FA520F] text-white hover:bg-[#FA520F]/90 px-4"
          >
            Show {matchingCount} {matchingCount === 1 ? "Event" : "Events"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
