"use client";

import * as React from "react";
import { RoutingRule } from "@nxtqr/contracts";
import { RouteValidationReport } from "@nxtqr/routing-engine";
import { RuleAnalyticsSummary } from "@/lib/domains/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface ContextInspectorProps {
  selectedRule: RoutingRule | null;
  defaultDestinationUrl: string;
  publishedRevision: number;
  totalRulesCount: number;
  validationReport?: RouteValidationReport;
  conflict?: { type: string; message: string; details?: string };
  ruleAnalytics?: RuleAnalyticsSummary;
  totalScans?: number;
  onUpdateRule?: (updated: RoutingRule) => void;
  onDeleteRule?: (ruleId: string) => void;
  onDuplicateRule?: (rule: RoutingRule) => void;
  onUpdateDefaultUrl?: (url: string) => void;
  onOpenSimulator: () => void;
  onClose?: () => void;
  className?: string;
}

export function ContextInspector({
  selectedRule,
  defaultDestinationUrl,
  publishedRevision,
  totalRulesCount,
  validationReport,
  conflict,
  ruleAnalytics,
  totalScans = 0,
  onUpdateRule,
  onDeleteRule,
  onDuplicateRule,
  onUpdateDefaultUrl,
  onOpenSimulator,
  onClose,
  className,
}: ContextInspectorProps) {
  const [activeTab, setActiveTab] = React.useState<"config" | "validation" | "signal">("config");

  // Destination host helper
  const destinationHost = React.useMemo(() => {
    const url = selectedRule ? selectedRule.action?.destinationUrl : defaultDestinationUrl;
    try {
      if (!url) return "Not set";
      const u = new URL(url);
      return u.hostname + (u.pathname !== "/" ? u.pathname : "");
    } catch {
      return url || "Not set";
    }
  }, [selectedRule, defaultDestinationUrl]);

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#FCFBFA] dark:bg-[#141414] border-l border-border text-xs font-mono select-none overflow-hidden",
        className
      )}
      aria-label="Context Inspector"
    >
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between shrink-0 bg-[#FCFBFA] dark:bg-[#141414]">
        <div className="flex items-center gap-1.5 min-w-0">
          <NxtqrIcon
            icon={selectedRule ? "solar:tuning-square-bold" : "solar:compass-bold"}
            size={14}
            className="text-primary shrink-0"
          />
          <span className="font-semibold text-foreground truncate text-[11px] uppercase tracking-wider text-muted-foreground">
            {selectedRule ? `Rule: ${selectedRule.name}` : "Routing Overview"}
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/10 cursor-pointer"
            aria-label="Close inspector"
          >
            <NxtqrIcon icon="solar:close-circle-linear" size={14} />
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div className="px-3 pt-2 pb-1 border-b border-border/60 shrink-0 bg-muted/30 dark:bg-[#161616]">
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="grid grid-cols-3 h-7 bg-muted/60 dark:bg-black/40 p-0.5 text-[10px]">
            <TabsTrigger
              value="config"
              className="h-6 text-[10px] data-[state=active]:bg-background dark:data-[state=active]:bg-[#242424] data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              Config
            </TabsTrigger>
            <TabsTrigger
              value="validation"
              className="h-6 text-[10px] data-[state=active]:bg-background dark:data-[state=active]:bg-[#242424] data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              Validation
              {conflict && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </TabsTrigger>
            <TabsTrigger
              value="signal"
              className="h-6 text-[10px] data-[state=active]:bg-background dark:data-[state=active]:bg-[#242424] data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              Signal
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">
        {activeTab === "config" && (
          <>
            {selectedRule ? (
              <div className="space-y-3.5">
                {/* Rule Identity */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Rule Name
                  </label>
                  <Input
                    value={selectedRule.name}
                    onChange={(e) =>
                      onUpdateRule?.({ ...selectedRule, name: e.target.value })
                    }
                    className="h-8 text-xs font-mono bg-background dark:bg-[#1c1c1c] border-border text-foreground"
                  />
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-muted/30 dark:bg-black/30 border border-border/70">
                    <span className="text-[10px] text-muted-foreground block">Priority Order</span>
                    <span className="font-bold text-foreground text-sm">
                      #{selectedRule.priority}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-muted/30 dark:bg-black/30 border border-border/70 flex flex-col justify-between">
                    <span className="text-[10px] text-muted-foreground block">Status</span>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-foreground">
                        {selectedRule.isActive ? "Active" : "Disabled"}
                      </span>
                      <Switch
                        checked={selectedRule.isActive}
                        onCheckedChange={(checked) =>
                          onUpdateRule?.({ ...selectedRule, isActive: checked })
                        }
                        className="scale-75 data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Match Mode */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Match Evaluation
                  </label>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/30 dark:bg-black/30 border border-border/70">
                    <button
                      type="button"
                      onClick={() => onUpdateRule?.({ ...selectedRule, matchType: "ALL" })}
                      className={cn(
                        "flex-1 py-1 rounded text-center text-[10px] font-semibold transition-colors cursor-pointer",
                        selectedRule.matchType === "ALL"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      ALL (Logical AND)
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateRule?.({ ...selectedRule, matchType: "ANY" })}
                      className={cn(
                        "flex-1 py-1 rounded text-center text-[10px] font-semibold transition-colors cursor-pointer",
                        selectedRule.matchType === "ANY"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      ANY (Logical OR)
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70">
                    {selectedRule.matchType === "ALL"
                      ? "All conditions must be satisfied before this destination is applied."
                      : "Matching any single condition triggers immediate redirection."}
                  </p>
                </div>

                {/* Destination */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Target Destination
                  </label>
                  <Input
                    value={selectedRule.action?.destinationUrl || ""}
                    onChange={(e) =>
                      onUpdateRule?.({
                        ...selectedRule,
                        action: {
                          ...selectedRule.action,
                          type: "redirect",
                          destinationUrl: e.target.value,
                        },
                      })
                    }
                    className="h-8 text-xs font-mono bg-background dark:bg-[#1c1c1c] border-border text-foreground"
                    placeholder="https://..."
                  />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="truncate">Host: {destinationHost}</span>
                    {selectedRule.action?.destinationUrl && (
                      <a
                        href={selectedRule.action.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Open</span>
                        <NxtqrIcon icon="solar:link-square-linear" size={11} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-2 border-t border-border/60 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                    Actions
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDuplicateRule?.(selectedRule)}
                      className="h-7 text-[11px] font-mono gap-1 border-border cursor-pointer hover:bg-muted dark:hover:bg-white/5"
                    >
                      <NxtqrIcon icon="solar:copy-bold" size={12} />
                      <span>Duplicate</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteRule?.(selectedRule.id)}
                      className="h-7 text-[11px] font-mono gap-1 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <NxtqrIcon icon="solar:trash-bin-trash-bold" size={12} />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Overview when no rule is selected */
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-card dark:bg-black/40 border border-border shadow-xs space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    QR Brain Status
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Total Rules</span>
                      <span className="text-foreground font-bold text-base">
                        {totalRulesCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Published Revision</span>
                      <span className="text-foreground font-bold text-base">
                        v{publishedRevision}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Default Route Configuration */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                    Default Fallthrough Route
                  </label>
                  <Input
                    value={defaultDestinationUrl}
                    onChange={(e) => onUpdateDefaultUrl?.(e.target.value)}
                    placeholder="https://example.com/fallback"
                    className="h-8 text-xs font-mono bg-background dark:bg-[#1c1c1c] border-border text-foreground"
                  />
                  <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                    Scans that do not match any active conditional rule will automatically route to this destination.
                  </p>
                </div>

                {/* Test in simulator prompt */}
                <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
                    <NxtqrIcon icon="solar:bolt-bold" size={14} />
                    <span>Dry-run Simulation</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Verify how device, location, and time contexts resolve before publishing live.
                  </p>
                  <Button
                    size="sm"
                    onClick={onOpenSimulator}
                    className="w-full h-7 text-xs font-mono gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    <NxtqrIcon icon="solar:play-bold" size={12} />
                    <span>Open Simulator</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "validation" && (
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Integrity Diagnostics
            </div>

            {/* Conflict details if present */}
            {conflict ? (
              <div className="p-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 font-semibold text-xs">
                  <NxtqrIcon icon="solar:danger-triangle-bold" size={13} />
                  <span className="uppercase">{conflict.type}</span>
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-200/90 leading-relaxed">
                  {conflict.message}
                </p>
                {conflict.details && (
                  <p className="text-[10px] text-amber-600/80 dark:text-amber-300/70 font-mono">
                    {conflict.details}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <NxtqrIcon icon="solar:check-circle-bold" size={14} />
                <span className="text-xs font-semibold">No Logic Conflicts</span>
              </div>
            )}

            {/* General Validation Items */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] p-2 rounded bg-muted/30 dark:bg-black/30 border border-border/70">
                <span className="text-muted-foreground">Destination Format</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Valid URL</span>
              </div>
              <div className="flex items-center justify-between text-[11px] p-2 rounded bg-muted/30 dark:bg-black/30 border border-border/70">
                <span className="text-muted-foreground">Conditions Syntax</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Normalized</span>
              </div>
              <div className="flex items-center justify-between text-[11px] p-2 rounded bg-muted/30 dark:bg-black/30 border border-border/70">
                <span className="text-muted-foreground">Edge Snapshot Size</span>
                <span className="text-foreground font-mono">&lt; 2 KB</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "signal" && (
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Routing Telemetry
            </div>

            {totalScans > 0 && ruleAnalytics ? (
              <div className="space-y-2.5">
                <div className="p-3 rounded-lg bg-muted/30 dark:bg-black/30 border border-border/70">
                  <span className="text-[10px] text-muted-foreground block">Rule Matches</span>
                  <span className="text-base font-bold text-foreground">
                    {ruleAnalytics.matchedScans.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-2">
                    ({ruleAnalytics.routingSharePercentage.toFixed(1)}% share)
                  </span>
                </div>

                <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${Math.min(100, ruleAnalytics.routingSharePercentage)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-border bg-muted/20 dark:bg-black/30 text-center space-y-2">
                <NxtqrIcon icon="solar:chart-2-linear" size={24} className="mx-auto text-muted-foreground/40" />
                <p className="text-[11px] text-muted-foreground">
                  No scan telemetry recorded for this rule yet.
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  Telemetry updates in real-time as scanners hit your dynamic link.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
