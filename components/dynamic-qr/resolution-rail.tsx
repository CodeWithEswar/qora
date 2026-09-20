"use client";

import * as React from "react";
import { Globe, ArrowRight, ShieldCheck, Cpu, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResolutionRailProps {
  slug: string;
  host: string;
  publishedRevision: number;
  publishedDestination: string;
  draftDestination?: string;
  hasUnpublishedChanges: boolean;
  routingRuleCount?: number;
  status: string;
}

export function ResolutionRail({
  slug,
  host,
  publishedRevision,
  publishedDestination,
  draftDestination,
  hasUnpublishedChanges,
  routingRuleCount = 0,
  status,
}: ResolutionRailProps) {
  // Format destination display
  const cleanPublishedDest = publishedDestination
    ? publishedDestination.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "No destination configured";

  const cleanDraftDest = draftDestination
    ? draftDestination.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : cleanPublishedDest;

  return (
    <div className="flex flex-col items-center justify-between w-full h-full p-5 bg-card/60 dark:bg-card/40 rounded-2xl border border-border/70 shadow-sm relative overflow-hidden backdrop-blur-xs">
      {/* Decorative subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8881_1px,transparent_1px),linear-gradient(to_bottom,#8881_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

      {/* Top indicator */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-border/50 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FA520F] animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-muted-foreground">
            Resolution Pipeline
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono border-primary/20 bg-primary/5 text-primary">
          Deterministic V1
        </Badge>
      </div>

      {/* Interactive Rail Diagram */}
      <div className="w-full my-auto py-4 flex flex-col items-center gap-2 z-10">
        {/* Node 1: Stable Identity */}
        <div className="w-full max-w-[280px] p-2.5 rounded-xl bg-background/80 border border-border flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
            <span className="font-mono text-xs font-bold">QR</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Stable Identity
            </div>
            <div className="font-mono text-xs font-semibold text-foreground truncate">
              /{slug}
            </div>
          </div>
          <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0 h-4 shrink-0">
            Fixed
          </Badge>
        </div>

        {/* Connector 1 */}
        <div className="flex flex-col items-center my-0.5">
          <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-[#FFA110]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFA110]" />
        </div>

        {/* Node 2: Published Edge Resolver Snapshot */}
        <div className="w-full max-w-[280px] p-2.5 rounded-xl bg-background/80 border border-border flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#FFA110]/10 border border-[#FFA110]/30 flex items-center justify-center shrink-0 text-[#FFA110]">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span>Edge Cache</span>
              <span className="inline-block w-1 h-1 rounded-full bg-emerald-500" />
            </div>
            <div className="font-mono text-xs font-semibold text-foreground truncate">
              Snapshot Rev {publishedRevision}
            </div>
          </div>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
            &lt;10ms
          </Badge>
        </div>

        {/* Connector 2 */}
        <div className="flex flex-col items-center my-0.5">
          <div className="w-0.5 h-4 bg-gradient-to-b from-[#FFA110] to-[#FA520F]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FA520F]" />
        </div>

        {/* Node 3: Routing Engine (QR Brain) */}
        <div className="w-full max-w-[280px] p-2.5 rounded-xl bg-background/80 border border-border flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Edge Routing Decision
            </div>
            <div className="font-mono text-xs font-semibold text-foreground truncate">
              {routingRuleCount > 0 ? `${routingRuleCount} Conditional Rules` : "Default Route Direct"}
            </div>
          </div>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 shrink-0 font-mono">
            {routingRuleCount > 0 ? "Smart" : "1:1"}
          </Badge>
        </div>

        {/* Connector 3: Branching line to destination */}
        <div className="flex flex-col items-center my-0.5">
          <div className="w-0.5 h-4 bg-[#FA520F]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FA520F]" />
        </div>

        {/* Node 4: Target Destination */}
        <div className="w-full max-w-[280px] flex flex-col gap-2">
          {/* Published Destination (Always Solid) */}
          <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/30 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 text-primary">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-primary flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Live Destination</span>
              </div>
              <div className="font-mono text-xs font-medium text-foreground truncate" title={publishedDestination}>
                {cleanPublishedDest}
              </div>
            </div>
          </div>

          {/* Draft Destination (Dashed Amber Branch when unpublished changes exist) */}
          {hasUnpublishedChanges && (
            <div className="p-2.5 rounded-xl bg-[#FFA110]/10 border border-dashed border-[#FFA110]/60 flex items-center gap-3 shadow-xs animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-lg bg-[#FFA110]/20 border border-[#FFA110]/40 flex items-center justify-center shrink-0 text-[#FFA110]">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#FFA110] font-semibold flex items-center gap-1">
                  <span>Draft Revision Pending</span>
                </div>
                <div className="font-mono text-xs font-medium text-foreground truncate" title={draftDestination}>
                  {cleanDraftDest}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="w-full pt-3 border-t border-border/50 text-center z-10">
        <p className="text-[11px] text-muted-foreground font-sans">
          Physical QR stays permanent. Only the edge destination resolves dynamically.
        </p>
      </div>
    </div>
  );
}
