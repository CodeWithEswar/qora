"use client";

import * as React from "react";
import {
  RoutingRule,
  RoutingSimulationResult,
} from "@nxtqr/contracts";
import { SignalSpine } from "./signal-spine";
import { RuleDecisionBlock } from "./canvas/rule-decision-block";
import { StaticAnalysisReport } from "@nxtqr/routing-engine";
import { QrBrainDestinationOption, RuleAnalyticsSummary } from "@/lib/domains/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";
import { generateOpaqueId } from "@nxtqr/db";
import { toast } from "sonner";

interface DecisionCanvasProps {
  rules: RoutingRule[];
  destinations: QrBrainDestinationOption[];
  defaultDestinationUrl: string;
  fallbackDestinationUrl?: string;
  qrName: string;
  slug: string;
  host: string;
  selectedRuleId: string | null;
  simulationTrace: RoutingSimulationResult | null;
  staticAnalysis: StaticAnalysisReport;
  analyticsStats?: RuleAnalyticsSummary[];
  onSelectRule: (ruleId: string) => void;
  onChangeRules: (rules: RoutingRule[]) => void;
  onChangeDefaultUrl?: (url: string) => void;
  onOpenSimulator: () => void;
  className?: string;
}

export function DecisionCanvas({
  rules,
  destinations,
  defaultDestinationUrl,
  fallbackDestinationUrl,
  qrName,
  slug,
  host,
  selectedRuleId,
  simulationTrace,
  staticAnalysis,
  analyticsStats,
  onSelectRule,
  onChangeRules,
  onChangeDefaultUrl,
  onOpenSimulator,
  className,
}: DecisionCanvasProps) {
  // Public resolver URL
  const publicUrl = `https://${host}/s/${slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public resolver URL copied to clipboard.");
  };

  // Add rule helper
  const handleAddRule = () => {
    const newRule: RoutingRule = {
      id: generateOpaqueId("rule"),
      qrId: "",
      name: `Rule ${rules.length + 1}`,
      priority: rules.length + 1,
      isActive: true,
      matchType: "ALL",
      conditions: [
        {
          id: generateOpaqueId("cond"),
          type: "device",
          operator: "eq",
          value: "mobile",
        },
      ],
      action: {
        type: "redirect",
        destinationUrl: defaultDestinationUrl || "https://example.com/mobile",
      },
    };
    const nextRules = [...rules, newRule];
    onChangeRules(nextRules);
    onSelectRule(newRule.id);
  };

  const handleDuplicateRule = (rule: RoutingRule) => {
    const dup: RoutingRule = {
      ...rule,
      id: generateOpaqueId("rule"),
      name: `${rule.name} (Copy)`,
      priority: rules.length + 1,
      conditions: (rule.conditions || []).map((c) => ({
        ...c,
        id: generateOpaqueId("cond"),
      })),
    };
    onChangeRules([...rules, dup]);
    onSelectRule(dup.id);
    toast.success(`Duplicated "${rule.name}"`);
  };

  const handleUpdateRule = (index: number, updated: RoutingRule) => {
    const next = [...rules];
    next[index] = updated;
    onChangeRules(next);
  };

  const handleDeleteRule = (index: number) => {
    const deletedId = rules[index]?.id;
    const next = rules.filter((_, i) => i !== index);
    const reordered = next.map((r, idx) => ({ ...r, priority: idx + 1 }));
    onChangeRules(reordered);
    if (selectedRuleId === deletedId) {
      onSelectRule(reordered[0]?.id || "");
    }
    toast.info("Rule deleted from draft.");
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...rules];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    const reordered = next.map((r, idx) => ({ ...r, priority: idx + 1 }));
    onChangeRules(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index >= rules.length - 1) return;
    const next = [...rules];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    const reordered = next.map((r, idx) => ({ ...r, priority: idx + 1 }));
    onChangeRules(reordered);
  };

  // Simulation indicators
  const matchedRuleId = simulationTrace?.matchedRuleId;
  const isDefaultMatched = simulationTrace && !matchedRuleId;

  // Build conflict index map
  const conflictMap = React.useMemo(() => {
    const map = new Map<string, { type: "contradiction" | "shadowed" | "overlap"; message: string; details?: string }>();
    if (staticAnalysis?.contradictions) {
      for (const c of staticAnalysis.contradictions) {
        map.set(c.ruleId, {
          type: "contradiction",
          message: c.message,
          details: c.field ? `Field: ${c.field}` : undefined,
        });
      }
    }
    if (staticAnalysis?.shadowedRules) {
      for (const s of staticAnalysis.shadowedRules) {
        map.set(s.shadowedRuleId, {
          type: "shadowed",
          message: s.reason,
          details: `Shadowed by higher-priority rule ${s.shadowingRuleName || s.shadowingRuleId}`,
        });
      }
    }
    return map;
  }, [staticAnalysis]);

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto px-4 sm:px-8 py-6 flex flex-col items-center select-none bg-[#F6F5F0] dark:bg-[#111111]",
        // Precision grid background (warm cream-taupe dots in light mode, technical dark in dark mode)
        "bg-[radial-gradient(#D5D0C4_1px,transparent_1px)] dark:bg-[radial-gradient(#222222_1px,transparent_1px)] [background-size:24px_24px]",
        className
      )}
    >
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* 1. TOP NODE: INCOMING SCAN IDENTITY */}
        <div className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-[#171717] shadow-xs relative z-10 transition-all hover:border-orange-500/50 text-xs font-mono">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FA520F] shrink-0">
                <NxtqrIcon icon="solar:qr-code-bold" size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-muted-foreground font-semibold">
                    Inbound Scan
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono h-4 px-1.5 bg-zinc-100 dark:bg-black/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                    {rules.filter((r) => r.isActive).length} Active
                  </Badge>
                </div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-foreground truncate mt-0.5">{qrName}</h2>
                <div className="text-[11px] font-mono text-zinc-600 dark:text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <span className="truncate">{publicUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="hover:text-zinc-900 dark:hover:text-foreground text-zinc-400 dark:text-muted-foreground p-0.5 rounded cursor-pointer"
                    title="Copy public URL"
                    aria-label="Copy public URL"
                  >
                    <NxtqrIcon icon="solar:copy-linear" size={12} />
                  </button>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSimulator}
              className="h-7 text-xs gap-1.5 font-mono text-orange-600 dark:text-[#FA520F] border-orange-500/40 bg-white dark:bg-transparent hover:bg-orange-500/10 cursor-pointer font-medium shadow-2xs"
            >
              <NxtqrIcon icon="solar:play-bold" size={12} />
              <span>Simulate</span>
            </Button>
          </div>
        </div>

        {/* 2. THE DECISION SPINE: EVALUATION START */}
        <SignalSpine
          height={40}
          label="EVALUATION START"
          status={simulationTrace ? "evaluated" : "idle"}
        />

        {/* 3. RULES LIST WITH INTERSPERSED DECISION SPINE CONNECTORS */}
        {rules.length === 0 ? (
          <div className="w-full my-4 p-8 rounded-xl border border-dashed border-zinc-300 dark:border-border bg-white/80 dark:bg-[#161616]/60 text-center space-y-3 font-mono shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FA520F] mx-auto">
              <NxtqrIcon icon="solar:route-bold" size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-foreground">No Conditional Rules Defined</h3>
              <p className="text-xs text-zinc-600 dark:text-muted-foreground max-w-sm mx-auto leading-relaxed">
                All scans will pass directly through to your default destination without branching.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleAddRule}
              className="h-8 text-xs font-mono gap-1.5 bg-[#FA520F] text-white hover:bg-[#CC3A05] font-semibold cursor-pointer shadow-xs"
            >
              <NxtqrIcon icon="solar:add-circle-bold" size={14} />
              <span>Create First Rule</span>
            </Button>
          </div>
        ) : (
          rules.map((rule, idx) => {
            const isMatch = matchedRuleId === rule.id;
            const conflict = conflictMap.get(rule.id);
            const telemetry = analyticsStats?.find((s) => s.ruleId === rule.id);

            return (
              <React.Fragment key={rule.id}>
                {/* Rule block */}
                <div className="w-full">
                  <RuleDecisionBlock
                    rule={rule}
                    index={idx}
                    totalRules={rules.length}
                    isSelected={selectedRuleId === rule.id}
                    destinations={destinations}
                    isSimulatedMatch={isMatch}
                    isSimulatedEvaluated={Boolean(simulationTrace)}
                    conflict={conflict}
                    telemetry={telemetry ? {
                      matches: telemetry.matchedScans,
                      sharePercentage: telemetry.routingSharePercentage,
                    } : undefined}
                    onSelect={() => onSelectRule(rule.id)}
                    onChange={(updated) => handleUpdateRule(idx, updated)}
                    onDelete={() => handleDeleteRule(idx)}
                    onDuplicate={() => handleDuplicateRule(rule)}
                    onMoveUp={() => handleMoveUp(idx)}
                    onMoveDown={() => handleMoveDown(idx)}
                  />
                </div>

                {/* Connector between rules */}
                {idx < rules.length - 1 && (
                  <SignalSpine
                    height={32}
                    label={isMatch ? "STOP: MATCHED" : "NO MATCH ↓"}
                    status={isMatch ? "matched" : simulationTrace ? "evaluated" : "idle"}
                  />
                )}
              </React.Fragment>
            );
          })
        )}

        {/* 4. SPINE CONNECTOR TO DEFAULT ROUTE */}
        <SignalSpine
          height={40}
          label={isDefaultMatched ? "FALLTHROUGH MATCH" : "NO RULES MATCHED ↓"}
          status={isDefaultMatched ? "matched" : "idle"}
          isTracePath={Boolean(isDefaultMatched)}
        />

        {/* 5. TERMINAL NODE: DEFAULT FALLTHROUGH DESTINATION */}
        <div
          className={cn(
            "w-full p-4 rounded-xl border transition-all text-xs font-mono select-none shadow-xs",
            isDefaultMatched
              ? "border-[#FA520F] ring-2 ring-[#FA520F] bg-[#FFF8F3] dark:bg-[#1e1714] shadow-lg shadow-[#FA520F]/10"
              : "border-zinc-200 dark:border-border bg-white dark:bg-[#161616] hover:border-zinc-300 dark:hover:border-border-strong"
          )}
        >
          {isDefaultMatched && (
            <div className="bg-[#FA520F] text-white text-[11px] font-mono font-semibold -m-4 mb-3 p-2 px-3 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-1.5">
                <NxtqrIcon icon="solar:bolt-bold" size={13} />
                <span>DEFAULT FALLTHROUGH APPLIED</span>
              </div>
              <span className="text-[10px] uppercase">No conditional rules matched</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <NxtqrIcon icon="solar:flag-bold" size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-muted-foreground font-semibold">
                    Terminal Destination
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono h-4 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 font-semibold">
                    Default
                  </Badge>
                </div>
                <div className="font-semibold text-zinc-900 dark:text-foreground text-xs mt-0.5 truncate max-w-sm" title={defaultDestinationUrl}>
                  {defaultDestinationUrl || "https://example.com"}
                </div>
              </div>
            </div>

            {defaultDestinationUrl && (
              <a
                href={defaultDestinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-7 px-2.5 rounded-md border border-zinc-200 dark:border-border/80 bg-white dark:bg-transparent hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground flex items-center gap-1 transition-colors shadow-2xs"
                title="Open default destination in new tab"
              >
                <span>Test Link</span>
                <NxtqrIcon icon="solar:link-square-linear" size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Add rule quick trigger at the bottom of the canvas */}
        {rules.length > 0 && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRule}
              className="h-8 text-xs font-mono gap-1.5 border-dashed border-orange-500/30 hover:border-orange-500/60 bg-white dark:bg-transparent hover:bg-orange-500/5 text-orange-600 dark:text-orange-400 font-medium cursor-pointer shadow-2xs"
            >
              <NxtqrIcon icon="solar:add-circle-linear" size={14} className="text-[#FA520F]" />
              <span>Add Another Rule</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
