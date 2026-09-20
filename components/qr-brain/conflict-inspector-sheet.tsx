"use client";

import * as React from "react";
import { RoutingRule } from "@nxtqr/contracts";
import {
  runStaticRoutingAnalysis,
  StaticAnalysisReport,
} from "@nxtqr/routing-engine";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface ConflictInspectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: RoutingRule[];
  onSelectRule?: (ruleId: string) => void;
}

export function ConflictInspectorSheet({
  open,
  onOpenChange,
  rules,
  onSelectRule,
}: ConflictInspectorSheetProps) {
  const report: StaticAnalysisReport = React.useMemo(() => {
    return runStaticRoutingAnalysis(rules);
  }, [rules]);

  const hasIssues =
    (report.contradictions?.length || 0) > 0 ||
    (report.shadowedRules?.length || 0) > 0 ||
    (report.overlaps?.length || 0) > 0;

  const handleFixRule = (ruleId: string) => {
    onSelectRule?.(ruleId);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col bg-card dark:bg-[#141414] border-border text-xs font-mono text-foreground select-none">
        <SheetHeader className="p-6 border-b border-border/70 bg-muted/40 dark:bg-[#171717]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <NxtqrIcon icon="solar:shield-warning-bold" size={20} />
            </span>
            <div>
              <SheetTitle className="text-base font-bold text-foreground font-serif">
                Conflict Lens
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Deterministic static analysis verifying rule reachability, contradictions, and overlaps.
              </SheetDescription>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-2 pt-3 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-mono gap-1",
                (report.contradictions?.length || 0) > 0
                  ? "bg-rose-500/10 text-rose-500 dark:text-rose-300 border-rose-500/30"
                  : "text-muted-foreground"
              )}
            >
              <NxtqrIcon icon="solar:danger-triangle-bold" size={12} />
              <span>{report.contradictions?.length || 0} Contradictions</span>
            </Badge>

            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-mono gap-1",
                (report.shadowedRules?.length || 0) > 0
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30"
                  : "text-muted-foreground"
              )}
            >
              <NxtqrIcon icon="solar:shield-warning-bold" size={12} />
              <span>{report.shadowedRules?.length || 0} Shadowed</span>
            </Badge>

            <Badge variant="outline" className="text-[11px] font-mono gap-1 text-muted-foreground">
              <NxtqrIcon icon="solar:info-circle-bold" size={12} />
              <span>{report.overlaps?.length || 0} Overlaps</span>
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* CLEAN STATE */}
          {!hasIssues ? (
            <div className="py-12 px-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500 dark:text-emerald-400">
                <NxtqrIcon icon="solar:check-circle-bold" size={24} />
              </div>
              <h4 className="text-sm font-bold text-foreground">Decision Policy Clean</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Zero contradictions or unreachable rules detected. All configured rules are mathematically deterministic and will execute as expected.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 1. CONTRADICTIONS */}
              {(report.contradictions?.length || 0) > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-500 uppercase tracking-wider">
                    <NxtqrIcon icon="solar:danger-triangle-bold" size={14} />
                    <span>Contradictions (Fatal Logic Errors)</span>
                  </div>
                  <div className="space-y-2">
                    {report.contradictions.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between font-medium text-rose-500 dark:text-rose-400">
                          <span className="font-bold">{c.ruleName}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFixRule(c.ruleId)}
                            className="h-6 text-[10px] font-mono border-rose-500/40 text-rose-600 dark:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                          >
                            Focus Rule
                          </Button>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{c.message}</p>
                        <div className="text-[11px] text-muted-foreground font-mono bg-muted/50 dark:bg-black/40 p-2 rounded-lg border border-border">
                          Fix: Switch match mode from ALL to ANY, or remove contradictory values for "{c.field}".
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. UNREACHABLE / SHADOWED RULES */}
              {(report.shadowedRules?.length || 0) > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider">
                    <NxtqrIcon icon="solar:shield-warning-bold" size={14} />
                    <span>Unreachable / Shadowed Rules</span>
                  </div>
                  <div className="space-y-2">
                    {report.shadowedRules.map((u, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between font-medium text-amber-600 dark:text-amber-300">
                          <span className="font-bold">{u.shadowedRuleName}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFixRule(u.shadowedRuleId)}
                            className="h-6 text-[10px] font-mono border-amber-500/40 text-amber-600 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                          >
                            Focus Rule
                          </Button>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{u.reason}</p>
                        <div className="text-[11px] text-muted-foreground font-mono bg-muted/50 dark:bg-black/40 p-2 rounded-lg border border-border">
                          Fix: Move "{u.shadowedRuleName}" above shadowing rules in priority, or refine conditions.
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. PARTIAL OVERLAPS */}
              {(report.overlaps?.length || 0) > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                    <NxtqrIcon icon="solar:info-circle-bold" size={14} />
                    <span>Partial Overlaps (Priority Tie-Breaking)</span>
                  </div>
                  <div className="space-y-2">
                    {report.overlaps.map((o, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-border bg-muted/30 dark:bg-black/30 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between font-medium text-foreground">
                          <span>{o.rule1Name} & {o.rule2Name}</span>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            Priority Tie-Breaker
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{o.message}</p>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-primary mt-1">
                          <span>Winning Rule:</span>
                          <span className="font-bold">{o.winningRuleName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
