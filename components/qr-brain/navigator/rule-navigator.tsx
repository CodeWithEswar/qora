"use client";

import * as React from "react";
import { RoutingRule } from "@nxtqr/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface RuleNavigatorProps {
  rules: RoutingRule[];
  selectedRuleId: string | null;
  onSelectRule: (ruleId: string) => void;
  onAddRule: () => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleActive: (ruleId: string, active: boolean) => void;
  defaultDestinationUrl: string;
  isDefaultSelected?: boolean;
  onSelectDefault?: () => void;
  conflictRuleIds?: Set<string>;
  className?: string;
}

type FilterType = "all" | "active" | "disabled" | "conflicts";

export function RuleNavigator({
  rules,
  selectedRuleId,
  onSelectRule,
  onAddRule,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  defaultDestinationUrl,
  isDefaultSelected = false,
  onSelectDefault,
  conflictRuleIds = new Set(),
  className,
}: RuleNavigatorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");

  // Filter & Search logic
  const filteredRules = React.useMemo(() => {
    return rules.filter((rule) => {
      // 1. Status Filter
      if (activeFilter === "active" && !rule.isActive) return false;
      if (activeFilter === "disabled" && rule.isActive) return false;
      if (activeFilter === "conflicts" && !conflictRuleIds.has(rule.id)) return false;

      // 2. Search Query
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const matchName = rule.name.toLowerCase().includes(query);
      const matchDest = rule.action?.destinationUrl?.toLowerCase().includes(query);
      const matchCond = (rule.conditions || []).some((c: any) =>
        String(c.value).toLowerCase().includes(query) ||
        String(c.field || c.type).toLowerCase().includes(query)
      );

      return matchName || matchDest || matchCond;
    });
  }, [rules, activeFilter, searchQuery, conflictRuleIds]);

  const defaultHost = React.useMemo(() => {
    try {
      if (!defaultDestinationUrl) return "Not configured";
      const u = new URL(defaultDestinationUrl);
      return u.hostname + (u.pathname !== "/" ? u.pathname : "");
    } catch {
      return defaultDestinationUrl || "Not configured";
    }
  }, [defaultDestinationUrl]);

  return (
    <nav
      className={cn(
        "flex flex-col h-full bg-card dark:bg-[#141414] border-r border-border text-xs font-mono select-none overflow-hidden",
        className
      )}
      aria-label="Rule Navigator"
    >
      {/* Header with Search & Filter & New Rule */}
      <div className="p-3 border-b border-border space-y-2.5 shrink-0 bg-card dark:bg-[#141414]">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground tracking-wide flex items-center gap-1.5 text-[11px] uppercase text-muted-foreground">
            <NxtqrIcon icon="solar:route-bold" size={13} className="text-primary" />
            <span>Rule Navigator</span>
          </span>

          <Button
            size="sm"
            onClick={onAddRule}
            className="h-7 px-2.5 text-[11px] font-mono gap-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer font-medium"
          >
            <NxtqrIcon icon="solar:add-circle-bold" size={13} />
            <span>New Rule</span>
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <NxtqrIcon
            icon="solar:magnifer-linear"
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules, destinations..."
            className="h-8 pl-8 pr-7 text-xs font-mono bg-muted/40 dark:bg-[#1a1a1a] border-border placeholder:text-muted-foreground/60 focus-visible:ring-primary/40 text-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <NxtqrIcon icon="solar:close-circle-bold" size={12} />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px]">
          {(["all", "active", "disabled", "conflicts"] as FilterType[]).map((f) => {
            const isSelected = activeFilter === f;
            const count =
              f === "all"
                ? rules.length
                : f === "active"
                ? rules.filter((r) => r.isActive).length
                : f === "disabled"
                ? rules.filter((r) => !r.isActive).length
                : rules.filter((r) => conflictRuleIds.has(r.id)).length;

            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-2 py-0.5 rounded capitalize whitespace-nowrap transition-colors cursor-pointer border",
                  isSelected
                    ? "bg-primary/15 text-primary border-primary/40 font-semibold"
                    : "bg-muted/40 text-muted-foreground border-border/50 hover:text-foreground hover:bg-muted"
                )}
              >
                {f} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
        {filteredRules.length === 0 ? (
          <div className="py-8 text-center px-4 space-y-2 text-muted-foreground">
            <NxtqrIcon icon="solar:filter-linear" size={24} className="mx-auto text-muted-foreground/40" />
            <p className="text-[11px]">
              {rules.length === 0
                ? "No rules defined yet."
                : "No rules match the current filter."}
            </p>
            {rules.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="text-[10px] text-primary hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          filteredRules.map((rule) => {
            const isSelected = selectedRuleId === rule.id && !isDefaultSelected;
            const hasConflict = conflictRuleIds.has(rule.id);
            const globalIndex = rules.findIndex((r) => r.id === rule.id);

            // Format destination
            let destPreview = rule.action?.destinationUrl || "No destination";
            try {
              const u = new URL(destPreview);
              destPreview = u.hostname + (u.pathname !== "/" ? u.pathname : "");
            } catch {
              // keep as-is
            }

            return (
              <div
                key={rule.id}
                onClick={() => onSelectRule(rule.id)}
                className={cn(
                  "group relative flex flex-col p-2.5 rounded-lg border transition-all cursor-pointer text-left",
                  isSelected
                    ? "bg-[#FFF8F3] dark:bg-[#1f1a17] border-primary/60 text-foreground shadow-xs shadow-primary/5 ring-1 ring-primary/30"
                    : "bg-card dark:bg-[#181818] border-border hover:bg-muted/40 dark:hover:bg-[#1c1c1c] hover:border-border-strong text-muted-foreground hover:text-foreground shadow-2xs"
                )}
              >
                {/* Active selection vertical signal stripe */}
                {isSelected && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary" />
                )}

                {/* Top row: Index + Name + Status */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-[11px] text-primary font-mono">
                      {String(globalIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="font-semibold text-foreground truncate text-xs">
                      {rule.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {hasConflict && (
                      <span
                        className="w-2 h-2 rounded-full bg-amber-400"
                        title="Conflict detected in this rule"
                      />
                    )}
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        rule.isActive ? "bg-emerald-500" : "bg-muted-foreground/40"
                      )}
                    />
                  </div>
                </div>

                {/* Middle row: Conditions count + Destination summary */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5 gap-2">
                  <span className="bg-muted/60 dark:bg-black/30 px-1.5 py-0.5 rounded border border-border/60 shrink-0 text-foreground/80">
                    {rule.conditions?.length || 0} cond · {rule.matchType || "ALL"}
                  </span>
                  <span className="truncate text-muted-foreground/80 font-mono text-[10px]" title={destPreview}>
                    → {destPreview}
                  </span>
                </div>

                {/* Hover Reorder controls */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1 mt-1.5 pt-1 border-t border-border/40 transition-opacity">
                  <button
                    type="button"
                    disabled={globalIndex === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp(globalIndex);
                    }}
                    className="p-1 rounded hover:bg-muted dark:hover:bg-white/10 disabled:opacity-20 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Move up in priority"
                    aria-label="Move rule up"
                  >
                    <NxtqrIcon icon="solar:arrow-up-linear" size={11} />
                  </button>

                  <button
                    type="button"
                    disabled={globalIndex >= rules.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown(globalIndex);
                    }}
                    className="p-1 rounded hover:bg-muted dark:hover:bg-white/10 disabled:opacity-20 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Move down in priority"
                    aria-label="Move rule down"
                  >
                    <NxtqrIcon icon="solar:arrow-down-linear" size={11} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Default Route Footer */}
      <div className="p-2.5 border-t border-border bg-muted/30 dark:bg-[#161616] shrink-0">
        <div
          onClick={onSelectDefault}
          className={cn(
            "p-2 rounded-lg border transition-all cursor-pointer flex flex-col gap-1",
            isDefaultSelected
              ? "bg-[#FFF8F3] dark:bg-[#1f1a17] border-primary/60 text-foreground ring-1 ring-primary/30 shadow-xs"
              : "bg-card dark:bg-[#181818] border-border hover:bg-muted/50 dark:hover:bg-[#1c1c1c] text-muted-foreground hover:text-foreground shadow-2xs"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[11px] text-foreground flex items-center gap-1.5">
              <span className="text-primary font-bold">∞</span>
              <span>Default Fallthrough</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
              Terminal
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono truncate" title={defaultDestinationUrl}>
            → {defaultHost}
          </div>
        </div>
      </div>
    </nav>
  );
}
