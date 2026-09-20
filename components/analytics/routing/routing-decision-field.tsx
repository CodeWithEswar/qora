"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RoutingRuleStat {
  ruleId: string;
  ruleName: string;
  destinationUrl: string;
  scansRouted: number;
  sharePercentage: number;
  patternStrip: string;
}

interface RoutingDecisionFieldProps {
  rules?: RoutingRuleStat[];
  defaultScans?: number;
  fallbackScans?: number;
  totalScans?: number;
  orgSlug?: string;
  onSelectRule?: (ruleId: string) => void;
  className?: string;
}

export function RoutingDecisionField({
  rules = [],
  defaultScans = 0,
  fallbackScans = 0,
  orgSlug,
  onSelectRule,
  className,
}: RoutingDecisionFieldProps) {
  const hasRules = rules.length > 0;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between text-card-foreground",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-serif text-base font-normal tracking-tight text-foreground">
                Routing Decision Field
              </h4>
            </div>
            <p className="text-[11px] text-muted-foreground">
              QR Brain condition evaluations and rule match distribution
            </p>
          </div>

          {orgSlug && (
            <Button variant="outline" size="sm" asChild className="h-7 text-xs border-border bg-card hover:bg-muted text-foreground gap-1 shadow-xs">
              <Link href={`/${orgSlug}/routes`}>
                <span>Manage Routes</span>
                <ArrowUpRight className="h-3 w-3 opacity-60" />
              </Link>
            </Button>
          )}
        </div>

        {/* Rules List & Inbound Flow */}
        <div className="mt-5 space-y-3 font-mono text-xs">
          {!hasRules ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="uppercase tracking-wider">No dynamic routing rules evaluated</p>
              <span className="text-[11px] block mt-1">
                All scans fall through to default destination URLs.
              </span>
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.ruleId}
                onClick={() => onSelectRule?.(rule.ruleId)}
                className="p-3 rounded-xl border border-border bg-muted/40 hover:border-primary/40 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground font-sans">
                    {rule.ruleName}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-foreground tabular-nums font-semibold">
                      {rule.scansRouted.toLocaleString()}
                    </span>
                    <span className="text-primary font-bold tabular-nums w-12 text-right">
                      {rule.sharePercentage}%
                    </span>
                  </div>
                </div>

                {/* Match Intensity Strip (░░▒▒▓▓████████▓▒░) */}
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-[#FA520F] tracking-widest text-xs select-none">
                    {rule.patternStrip}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                    → {rule.destinationUrl}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Default and Fallback fallthrough counters */}
          <div className="pt-2 grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg border border-border bg-muted/30">
              <span className="text-[10px] text-muted-foreground block">DEFAULT FALLTHROUGH</span>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {defaultScans.toLocaleString()} scans
              </span>
            </div>
            <div className="p-2.5 rounded-lg border border-border bg-muted/30">
              <span className="text-[10px] text-muted-foreground block">FALLBACK EXECUTIONS</span>
              <span className="text-sm font-bold text-emerald-500 tabular-nums">
                {fallbackScans.toLocaleString()} scans
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Deterministic Rule Hierarchy</span>
        <span>░░▒▒▓▓██ Match Intensity</span>
      </div>
    </div>
  );
}
