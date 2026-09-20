"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GuardianHeaderProps {
  monitoredCount: number;
  openIncidentsCount: number;
  onOpenAddMonitor: () => void;
  onOpenSettings: () => void;
  onToggleFilters: () => void;
  hasActiveFilters?: boolean;
}

export function GuardianHeader({
  monitoredCount,
  openIncidentsCount,
  onOpenAddMonitor,
  onOpenSettings,
  onToggleFilters,
  hasActiveFilters,
}: GuardianHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/80 pb-5">
      {/* Left: Eyebrow, Title & Subtitle */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#FA520F] bg-[#FA520F]/10 px-2 py-0.5 rounded border border-[#FA520F]/20">
            DESTINATION RELIABILITY
          </span>
          {openIncidentsCount > 0 ? (
            <Badge variant="danger" className="text-[10px] font-mono gap-1 py-0.5 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {openIncidentsCount} OPEN {openIncidentsCount === 1 ? "INCIDENT" : "INCIDENTS"}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] font-mono gap-1 py-0.5 px-2 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
              <Icon icon="solar:shield-check-bold" className="w-3 h-3 text-emerald-500" />
              ALL MONITORS NORMAL
            </Badge>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
          Guardian
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Observe destination health, understand incidents, and prepare safe fallback behavior without slowing a single scan.
        </p>
      </div>

      {/* Right: Operational Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className={`h-9 text-xs px-3 gap-1.5 border-border bg-surface hover:bg-surface/80 text-foreground cursor-pointer ${
            hasActiveFilters ? "border-[#FA520F] text-[#FA520F]" : ""
          }`}
        >
          <Icon icon="solar:filter-linear" className="w-3.5 h-3.5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA520F]" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSettings}
          className="h-9 text-xs px-3 gap-1.5 border-border bg-surface hover:bg-surface/80 text-foreground cursor-pointer"
        >
          <Icon icon="solar:settings-linear" className="w-3.5 h-3.5" />
          <span>Guardian Settings</span>
        </Button>

        <Button
          size="sm"
          onClick={onOpenAddMonitor}
          className="h-9 text-xs px-3.5 gap-1.5 bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium shadow-xs cursor-pointer"
        >
          <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
          <span>Add Monitor</span>
        </Button>
      </div>
    </div>
  );
}
