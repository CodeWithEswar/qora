"use client";

import * as React from "react";
import { Search, LayoutGrid, ListFilter, X, Filter } from "lucide-react";
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
  ExperimentControlTab,
  ExperimentLayoutMode,
  ExperimentSortOption,
  EligibleDynamicQrOption,
} from "./types";

interface ExperimentToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTab: ExperimentControlTab;
  onTabChange: (tab: ExperimentControlTab) => void;
  selectedQrId: string;
  onQrSelect: (qrId: string) => void;
  selectedSort: ExperimentSortOption;
  onSortChange: (sort: ExperimentSortOption) => void;
  layoutMode: ExperimentLayoutMode;
  onLayoutModeChange: (mode: ExperimentLayoutMode) => void;
  eligibleQrs: EligibleDynamicQrOption[];
  counts: {
    all: number;
    running: number;
    draft: number;
    paused: number;
    completed: number;
  };
}

export function ExperimentToolbar({
  searchQuery,
  onSearchChange,
  selectedTab,
  onTabChange,
  selectedQrId,
  onQrSelect,
  selectedSort,
  onSortChange,
  layoutMode,
  onLayoutModeChange,
  eligibleQrs,
  counts,
}: ExperimentToolbarProps) {
  const tabs: { id: ExperimentControlTab; label: string; count: number }[] = [
    { id: "all", label: "All Experiments", count: counts.all },
    { id: "running", label: "Running", count: counts.running },
    { id: "draft", label: "Draft", count: counts.draft },
    { id: "paused", label: "Paused", count: counts.paused },
    { id: "completed", label: "Completed", count: counts.completed },
  ];

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedTab !== "all" || selectedQrId !== "all"
  );

  return (
    <div className="space-y-3">
      {/* Primary Control Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card border border-border rounded-xl p-2 sm:p-2.5 shadow-xs">
        {/* Status Lifecycle Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 select-none ${
                  isActive
                    ? "bg-muted text-foreground font-semibold border border-border/80 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-primary/15 text-primary font-bold"
                      : "bg-muted-foreground/10 text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Actions & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search experiments or QRs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 pl-8 pr-8 text-xs bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40 rounded-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* QR Asset Filter */}
          <Select value={selectedQrId} onValueChange={onQrSelect}>
            <SelectTrigger className="h-8 w-[140px] sm:w-[160px] text-xs bg-background border-input text-foreground rounded-lg">
              <div className="flex items-center gap-1.5 truncate">
                <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All QRs" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-xs text-popover-foreground shadow-md">
              <SelectItem value="all">All QR Assets</SelectItem>
              {eligibleQrs.map((qr) => (
                <SelectItem key={qr.id} value={qr.id}>
                  {qr.name} ({qr.slug})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Selector */}
          <Select value={selectedSort} onValueChange={(v) => onSortChange(v as ExperimentSortOption)}>
            <SelectTrigger className="h-8 w-[130px] sm:w-[145px] text-xs bg-background border-input text-foreground rounded-lg">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-xs text-popover-foreground shadow-md">
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="observations">Most Observations</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="name">Experiment Name</SelectItem>
            </SelectContent>
          </Select>

          {/* Layout Toggle: Signal Rail Grid vs Dense List */}
          <div className="flex items-center p-0.5 bg-muted/70 border border-border rounded-lg">
            <button
              type="button"
              onClick={() => onLayoutModeChange("signal")}
              title="Signal Nodes (Architecture Grid)"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                layoutMode === "signal"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onLayoutModeChange("list")}
              title="Dense Routing Matrix"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                layoutMode === "list"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
          <span className="text-[11px] font-mono text-muted-foreground">FILTERED:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border text-foreground text-[11px]">
              Query: &ldquo;{searchQuery}&rdquo;
              <button type="button" onClick={() => onSearchChange("")}>
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </span>
          )}
          {selectedTab !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border text-foreground text-[11px] uppercase">
              Status: {selectedTab}
              <button type="button" onClick={() => onTabChange("all")}>
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </span>
          )}
          {selectedQrId !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border text-foreground text-[11px]">
              QR: {eligibleQrs.find((q) => q.id === selectedQrId)?.name || selectedQrId}
              <button type="button" onClick={() => onQrSelect("all")}>
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange("");
              onTabChange("all");
              onQrSelect("all");
            }}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            Reset All
          </Button>
        </div>
      )}
    </div>
  );
}
