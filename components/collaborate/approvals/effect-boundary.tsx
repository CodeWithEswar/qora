"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowDown, ShieldCheck } from "lucide-react";

interface EffectBoundaryProps {
  decisionLabel: string;
  effectDescription: string;
  className?: string;
}

export function EffectBoundary({
  decisionLabel,
  effectDescription,
  className,
}: EffectBoundaryProps) {
  return (
    <div className={cn("space-y-2 text-xs font-mono", className)}>
      <div className="text-[10px] tracking-widest text-muted-foreground uppercase flex items-center justify-between">
        <span>EFFECT BOUNDARY</span>
        <span className="text-[9px] text-muted-foreground">SEPARATION OF DECISION & EXECUTION</span>
      </div>

      <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-3 relative overflow-hidden">
        {/* Step 1: Decision */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground uppercase text-[10px]">DECISION</span>
          <span className="font-semibold text-foreground">{decisionLabel}</span>
        </div>

        {/* Transition Rail */}
        <div className="flex items-center justify-center my-0.5" aria-hidden="true">
          <div className="w-full border-t border-dashed border-border/80 relative flex justify-center">
            <span className="absolute -top-2 bg-card border border-border/80 px-1 rounded-full text-muted-foreground">
              <ArrowDown className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Step 2: Effect */}
        <div className="space-y-1 pt-1">
          <div className="text-[10px] text-primary uppercase font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-primary" />
            <span>AUTHORITATIVE RUNNER EFFECT</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {effectDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
