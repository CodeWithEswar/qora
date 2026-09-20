"use client";

import * as React from "react";
import { RoutingRule } from "@nxtqr/contracts";
import {
  validateRoutingPolicyBeforePublish,
  runStaticRoutingAnalysis,
} from "@nxtqr/routing-engine";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface DecisionHealthRailProps {
  rules: RoutingRule[];
  defaultUrl: string;
  hasUnpublishedChanges: boolean;
  draftChangeCount?: number;
  onOpenConflicts: () => void;
  onOpenPublish: () => void;
  onOpenDestinations?: () => void;
  onSelectDefault?: () => void;
  className?: string;
}

export function DecisionHealthRail({
  rules,
  defaultUrl,
  hasUnpublishedChanges,
  draftChangeCount = 0,
  onOpenConflicts,
  onOpenPublish,
  onOpenDestinations,
  onSelectDefault,
  className,
}: DecisionHealthRailProps) {
  // Pure calculations from routing engine
  const analysis = React.useMemo(() => {
    return runStaticRoutingAnalysis(rules);
  }, [rules]);

  const validation = React.useMemo(() => {
    return validateRoutingPolicyBeforePublish(rules, defaultUrl);
  }, [rules, defaultUrl]);

  const activeRulesCount = React.useMemo(() => {
    return rules.filter((r) => r.isActive).length;
  }, [rules]);

  const totalConflicts =
    (analysis?.contradictions?.length || 0) +
    (analysis?.shadowedRules?.length || 0) +
    (analysis?.overlaps?.length || 0);

  const destinationsValid = validation.errors.length === 0 && Boolean(defaultUrl);
  const defaultRouteConfigured = Boolean(defaultUrl && defaultUrl.trim().length > 0);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-border bg-card dark:bg-[#161616]/90 backdrop-blur-sm text-xs font-mono select-none shadow-xs",
        className
      )}
      role="region"
      aria-label="Decision Health Status"
    >
      {/* Label / Status Section */}
      <div className="flex items-center justify-between sm:justify-start gap-2 text-muted-foreground font-semibold tracking-wider text-[11px] uppercase shrink-0">
        <div className="flex items-center gap-1.5">
          <NxtqrIcon
            icon="solar:shield-check-bold"
            size={14}
            className={totalConflicts === 0 && destinationsValid ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"}
          />
          <span className="text-foreground font-semibold">Decision Health</span>
        </div>

        {/* Quick mobile status chip */}
        <span
          className={cn(
            "sm:hidden text-[10px] font-mono px-2 py-0.5 rounded-md border",
            totalConflicts === 0 && destinationsValid
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
          )}
        >
          {totalConflicts === 0 && destinationsValid ? "Healthy" : `${totalConflicts} issues`}
        </span>
      </div>

      {/* Metrics Row: Clean chips that scroll smoothly on mobile and align neatly on desktop */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 sm:mx-0 sm:px-0">
        {/* Destinations */}
        <button
          type="button"
          onClick={onOpenDestinations}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/40 dark:bg-white/[0.03] border border-border/70 hover:border-border transition-colors group cursor-pointer text-left shrink-0 text-[11px]"
          title="Destinations integrity"
        >
          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
            Destinations
          </span>
          {destinationsValid ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <NxtqrIcon icon="solar:check-circle-bold" size={12} />
              <span>Valid</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
              <NxtqrIcon icon="solar:close-circle-bold" size={12} />
              <span>Issues</span>
            </span>
          )}
        </button>

        {/* Active Rules */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/40 dark:bg-white/[0.03] border border-border/70 shrink-0 text-[11px]">
          <span className="text-muted-foreground">Rules</span>
          <span className="text-foreground font-semibold">
            {activeRulesCount} <span className="font-normal text-muted-foreground">active</span>
            {rules.length !== activeRulesCount && (
              <span className="text-muted-foreground font-normal ml-1">
                ({rules.length})
              </span>
            )}
          </span>
        </div>

        {/* Conflicts */}
        <button
          type="button"
          onClick={onOpenConflicts}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-colors group cursor-pointer text-left shrink-0 text-[11px]",
            totalConflicts > 0
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/20"
              : "bg-muted/40 dark:bg-white/[0.03] border-border/70 hover:border-border"
          )}
          title="Click to open Conflict Lens"
        >
          <span className={totalConflicts > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground group-hover:text-foreground"}>
            Conflicts
          </span>
          {totalConflicts === 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <NxtqrIcon icon="solar:check-circle-bold" size={12} />
              <span>0</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
              <NxtqrIcon icon="solar:danger-triangle-bold" size={12} />
              <span>{totalConflicts}</span>
            </span>
          )}
        </button>

        {/* Default Route */}
        <button
          type="button"
          onClick={onSelectDefault}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/40 dark:bg-white/[0.03] border border-border/70 hover:border-border transition-colors group cursor-pointer text-left shrink-0 text-[11px]"
          title="Default fallthrough route"
        >
          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
            Default
          </span>
          {defaultRouteConfigured ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <NxtqrIcon icon="solar:check-circle-bold" size={12} />
              <span>Configured</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
              <NxtqrIcon icon="solar:danger-circle-bold" size={12} />
              <span>Missing</span>
            </span>
          )}
        </button>

        {/* Draft changes */}
        <button
          type="button"
          onClick={onOpenPublish}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-colors group cursor-pointer text-left shrink-0 text-[11px]",
            hasUnpublishedChanges
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/20"
              : "bg-muted/40 dark:bg-white/[0.03] border-border/70 hover:border-border text-muted-foreground"
          )}
          title="Click to review & publish draft"
        >
          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
            Draft
          </span>
          {hasUnpublishedChanges ? (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
              <span>
                {draftChangeCount > 0 ? `${draftChangeCount} chg` : "Unpublished"}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <NxtqrIcon icon="solar:check-circle-bold" size={12} />
              <span>In Sync</span>
            </span>
          )}
        </button>
      </div>

      {/* Quick Action Buttons on right */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onOpenConflicts}
          className={cn(
            "h-7 px-2.5 rounded-md border text-[11px] font-mono inline-flex items-center gap-1 transition-all cursor-pointer",
            totalConflicts > 0
              ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20"
              : "border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          <NxtqrIcon icon="solar:shield-warning-bold" size={12} className={totalConflicts > 0 ? "text-amber-500" : "text-muted-foreground"} />
          <span>Conflict Lens</span>
        </button>
      </div>
    </div>
  );
}
