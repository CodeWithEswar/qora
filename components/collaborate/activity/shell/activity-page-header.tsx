"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Download, Calendar, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActivityPageHeaderProps {
  dateRange: string;
  onDateRangeChange: (range: "24h" | "7d" | "30d" | "90d") => void;
  onOpenFilters: () => void;
  onOpenExport: () => void;
  activeFilterCount?: number;
}

export function ActivityPageHeader({
  dateRange,
  onDateRangeChange,
  onOpenFilters,
  onOpenExport,
  activeFilterCount = 0,
}: ActivityPageHeaderProps) {
  const rangeLabels: Record<string, string> = {
    "24h": "Past 24 Hours",
    "7d": "Past 7 Days",
    "30d": "Past 30 Days",
    "90d": "Past 90 Days",
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
      <div className="space-y-1">
        <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 font-bold">
          <span>COLLABORATE</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground font-semibold">ACTIVITY</span>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#FA520F] font-bold">
          OPERATIONAL EVENT OBSERVATORY
        </div>
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground tracking-tight">
          Activity
        </h1>
        <p className="text-xs text-muted-foreground max-w-xl">
          Understand how work changes across your NXTQR organization.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
        {/* Date Range Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs font-mono gap-1.5 border-border/70 bg-card/60 hover:bg-muted/40"
            >
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{rangeLabels[dateRange] || dateRange.toUpperCase()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs font-mono w-44">
            <DropdownMenuItem onClick={() => onDateRangeChange("24h")}>
              Past 24 Hours
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateRangeChange("7d")}>
              Past 7 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateRangeChange("30d")}>
              Past 30 Days (Default)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDateRangeChange("90d")}>
              Past 90 Days
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenFilters}
          className={`h-8 px-2.5 text-xs font-mono gap-1.5 border-border/70 ${
            activeFilterCount > 0 ? "border-[#FA520F] text-[#FA520F] bg-[#FA520F]/10 font-bold" : ""
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="h-4 w-4 rounded-full bg-[#FA520F] text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Export Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenExport}
          className="h-8 px-2.5 text-xs font-mono gap-1.5 border-border/70 text-foreground hover:bg-muted/40"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </Button>
      </div>
    </div>
  );
}
