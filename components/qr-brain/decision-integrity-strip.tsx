"use client";

import * as React from "react";
import { RoutingRule } from "@nxtqr/contracts";
import {
  validateRoutingPolicyBeforePublish,
  runStaticRoutingAnalysis,
} from "@nxtqr/routing-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DecisionIntegrityStripProps {
  rules: RoutingRule[];
  defaultUrl: string;
  onOpenConflictLens: () => void;
  onOpenSimulator: () => void;
}

export function DecisionIntegrityStrip({
  rules,
  defaultUrl,
  onOpenConflictLens,
  onOpenSimulator,
}: DecisionIntegrityStripProps) {
  const analysis = React.useMemo(() => {
    return runStaticRoutingAnalysis(rules);
  }, [rules]);

  const validation = React.useMemo(() => {
    return validateRoutingPolicyBeforePublish(rules, defaultUrl);
  }, [rules, defaultUrl]);

  const totalConflicts = (analysis?.contradictions?.length || 0) + (analysis?.shadowedRules?.length || 0);
  const isHealthy = validation.valid && totalConflicts === 0;

  return (
    <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Integrity Checklist Badges */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Decision Integrity:</span>
        </div>

        {/* 1. Conditions & Destination Syntax */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          {validation.errors.length === 0 ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          )}
          <span className={validation.errors.length === 0 ? "text-foreground" : "text-rose-500"}>
            Destinations & URLs Valid
          </span>
        </div>

        {/* 2. Static Analysis Logic */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          {totalConflicts === 0 ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className={totalConflicts === 0 ? "text-foreground" : "text-amber-500"}>
            {totalConflicts === 0
              ? "Zero Contradictions"
              : `${totalConflicts} Logic Warning${totalConflicts > 1 ? "s" : ""}`}
          </span>
        </div>

        {/* 3. Fallthrough Route */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          {defaultUrl ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          )}
          <span className="text-foreground">Default Fallthrough Set</span>
        </div>
      </div>

      {/* Action Buttons: Conflict Lens & Simulator */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenConflictLens}
          className={cn(
            "h-7 text-xs gap-1.5 font-mono",
            totalConflicts > 0
              ? "border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {totalConflicts > 0 ? (
            <AlertTriangle className="w-3 h-3 text-amber-500" />
          ) : (
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
          )}
          <span>Conflict Lens</span>
          {totalConflicts > 0 && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-amber-500/20 text-amber-600">
              {totalConflicts}
            </Badge>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSimulator}
          className="h-7 text-xs gap-1.5 font-mono text-[#FA520F] border-[#FA520F]/40 hover:bg-[#FA520F]/10"
        >
          <Zap className="w-3 h-3 fill-[#FA520F]" />
          <span>Simulate Scan</span>
        </Button>
      </div>
    </div>
  );
}
