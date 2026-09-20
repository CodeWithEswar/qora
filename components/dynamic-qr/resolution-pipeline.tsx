"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ResolutionPipelineProps {
  slug: string;
  publishedRevision: number;
  publishedDestination: string;
  draftDestination?: string;
  hasUnpublishedChanges: boolean;
  routingRuleCount?: number;
  status: string;
  className?: string;
}

export function ResolutionPipeline({
  slug,
  publishedRevision,
  publishedDestination,
  draftDestination,
  hasUnpublishedChanges,
  routingRuleCount = 0,
  className,
}: ResolutionPipelineProps) {
  // Format hostnames safely
  const cleanPublishedHost = React.useMemo(() => {
    try {
      if (!publishedDestination) return "No destination";
      const u = new URL(publishedDestination.startsWith("http") ? publishedDestination : `https://${publishedDestination}`);
      return u.hostname;
    } catch {
      return publishedDestination.replace(/^https?:\/\//, "").split("/")[0] || "Destination";
    }
  }, [publishedDestination]);

  const cleanDraftHost = React.useMemo(() => {
    if (!draftDestination) return cleanPublishedHost;
    try {
      const u = new URL(draftDestination.startsWith("http") ? draftDestination : `https://${draftDestination}`);
      return u.hostname;
    } catch {
      return draftDestination.replace(/^https?:\/\//, "").split("/")[0] || "Draft destination";
    }
  }, [draftDestination, cleanPublishedHost]);

  // One-time subtle signal pulse animation state with prefers-reduced-motion check
  const [activeStep, setActiveStep] = React.useState<number>(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return 4;
    }
    return 0;
  });

  React.useEffect(() => {
    if (activeStep === 4) return;

    const t1 = setTimeout(() => setActiveStep(1), 100);
    const t2 = setTimeout(() => setActiveStep(2), 350);
    const t3 = setTimeout(() => setActiveStep(3), 600);
    const t4 = setTimeout(() => setActiveStep(4), 850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [activeStep]);

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-surface/80 backdrop-blur-xs shadow-2xs overflow-hidden",
        className
      )}
    >
      {/* Technical Background Grid Pattern */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#8881_1px,transparent_1px),linear-gradient(to_bottom,#8881_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-25"
        aria-hidden="true"
      />

      {/* 1. Header */}
      <div className="relative z-10 w-full flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-muted-foreground">
            Resolution Pipeline
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-mono tracking-wide uppercase border-primary/20 bg-primary/5 text-primary"
        >
          Deterministic V1
        </Badge>
      </div>

      {/* 2. Signature NXTQR Resolution Spine */}
      <div className="relative z-10 w-full my-auto py-5 flex flex-col items-center">
        {/* Stage 1: QR Identity */}
        <div
          className={cn(
            "w-full max-w-[320px] p-3 rounded-xl border bg-surface flex items-center justify-between shadow-2xs transition-all duration-300",
            activeStep >= 1 ? "border-primary/40 bg-[#FFFDF7] dark:bg-[#1E1E1E]" : "border-border/80"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-mono text-xs font-bold">
              01
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                QR Identity
              </div>
              <div className="font-mono text-xs font-semibold text-foreground truncate">
                /s/{slug}
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0 h-4 shrink-0 font-mono">
            Stable
          </Badge>
        </div>

        {/* Connector 1 */}
        <div className="flex flex-col items-center my-1">
          <div
            className={cn(
              "w-0.5 h-5 transition-colors duration-300",
              activeStep >= 2 ? "bg-primary" : "bg-border"
            )}
          />
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors duration-300",
              activeStep >= 2 ? "bg-primary" : "bg-border"
            )}
          />
        </div>

        {/* Stage 2: Edge Resolver */}
        <div
          className={cn(
            "w-full max-w-[320px] p-3 rounded-xl border bg-surface flex items-center justify-between shadow-2xs transition-all duration-300",
            activeStep >= 2 ? "border-primary/40 bg-[#FFFDF7] dark:bg-[#1E1E1E]" : "border-border/80"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold">
              02
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span>Edge Resolver Cache</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="font-mono text-xs font-semibold text-foreground truncate">
                Snapshot Rev {publishedRevision}
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0 font-mono"
          >
            Ready
          </Badge>
        </div>

        {/* Connector 2 */}
        <div className="flex flex-col items-center my-1">
          <div
            className={cn(
              "w-0.5 h-5 transition-colors duration-300",
              activeStep >= 3 ? "bg-primary" : "bg-border"
            )}
          />
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors duration-300",
              activeStep >= 3 ? "bg-primary" : "bg-border"
            )}
          />
        </div>

        {/* Stage 3: Routing Decision */}
        <div
          className={cn(
            "w-full max-w-[320px] p-3 rounded-xl border bg-surface flex items-center justify-between shadow-2xs transition-all duration-300",
            activeStep >= 3 ? "border-primary/40 bg-[#FFFDF7] dark:bg-[#1E1E1E]" : "border-border/80"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold">
              03
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Routing Decision
              </div>
              <div className="font-mono text-xs font-semibold text-foreground truncate">
                {routingRuleCount > 0 ? `${routingRuleCount} conditional rule${routingRuleCount === 1 ? "" : "s"}` : "Default route"}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0 h-4 shrink-0 font-mono border-border">
            {routingRuleCount > 0 ? "Evaluated" : "Direct"}
          </Badge>
        </div>

        {/* Connector 3 */}
        <div className="flex flex-col items-center my-1">
          <div
            className={cn(
              "w-0.5 h-5 transition-colors duration-300",
              activeStep >= 4 ? "bg-primary" : "bg-border"
            )}
          />
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors duration-300",
              activeStep >= 4 ? "bg-primary" : "bg-border"
            )}
          />
        </div>

        {/* Stage 4: Live Destination + Optional Draft Overlay */}
        <div
          className={cn(
            "w-full max-w-[320px] p-3 rounded-xl border bg-surface flex items-center justify-between shadow-2xs transition-all duration-300",
            activeStep >= 4 ? "border-primary/40 bg-[#FFFDF7] dark:bg-[#1E1E1E]" : "border-border/80"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
              04
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {hasUnpublishedChanges ? "Published Target" : "Live Destination"}
              </div>
              <div className="font-mono text-xs font-semibold text-foreground truncate">
                {cleanPublishedHost}
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[9px] uppercase px-1.5 py-0 h-4 shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono"
          >
            Active
          </Badge>
        </div>

        {/* Draft Route Overlay (Dashed Orange Connector + Node when draft changes exist) */}
        {hasUnpublishedChanges && (
          <div className="w-full max-w-[320px] mt-2 pt-2 border-t border-dashed border-primary/40">
            <div className="p-3 rounded-xl border border-primary/40 bg-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 text-primary font-mono text-xs font-bold">
                  D
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
                    Draft Target (Unpublished)
                  </div>
                  <div className="font-mono text-xs font-semibold text-foreground truncate">
                    {cleanDraftHost}
                  </div>
                </div>
              </div>
              <Badge className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-mono uppercase px-1.5 py-0 h-4">
                Draft
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer */}
      <div className="relative z-10 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <div className="flex items-center gap-1.5">
          <Icon icon="hugeicons:route-01" className="w-3.5 h-3.5 text-primary" />
          <span>The printed identity stays stable while published routing changes.</span>
        </div>
      </div>
    </div>
  );
}
