"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ApprovalChangeDiff } from "@/lib/supabase/types/approvals";
import { ArrowRight, Plus, Minus, Check } from "lucide-react";

interface ChangePreviewProps {
  diff: ApprovalChangeDiff;
  className?: string;
}

export function ChangePreview({ diff, className }: ChangePreviewProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase flex items-center justify-between">
        <span>CHANGE / PREVIEW</span>
        <span className="text-[9px] text-muted-foreground">AUTHORITATIVE DOMAIN DIFF</span>
      </div>

      {/* Side-by-side Before and Proposed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg border border-border/70 bg-card/40">
        {/* CURRENT */}
        <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-border/60 pb-3 sm:pb-0 sm:pr-3">
          <div className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
            <span>CURRENT</span>
          </div>
          <div className="text-xs font-semibold text-foreground">
            {diff.beforeLabel}
          </div>
          <div className="text-xs font-mono text-muted-foreground bg-muted/40 p-2 rounded border border-border/40 break-all">
            {diff.beforeValue}
          </div>
          {diff.beforeStatus && (
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              <span>{diff.beforeStatus}</span>
            </div>
          )}
        </div>

        {/* PROPOSED */}
        <div className="space-y-1.5 sm:pl-1">
          <div className="text-[10px] font-mono uppercase text-primary flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>PROPOSED</span>
          </div>
          <div className="text-xs font-semibold text-foreground">
            {diff.proposedLabel}
          </div>
          <div className="text-xs font-mono text-primary font-medium bg-primary/5 p-2 rounded border border-primary/20 break-all">
            {diff.proposedValue}
          </div>
          {diff.proposedStatus && (
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-primary/10 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{diff.proposedStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Discrete Gaining / Unchanged / Losing Facets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
        {/* GAINING */}
        <div className="p-2.5 rounded border border-emerald-500/20 bg-emerald-500/5 space-y-1">
          <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase flex items-center justify-between">
            <span>GAINING</span>
            <span>+{diff.gaining?.length || 0}</span>
          </div>
          {diff.gaining && diff.gaining.length > 0 ? (
            <ul className="space-y-0.5">
              {diff.gaining.map((item, idx) => (
                <li key={idx} className="text-[11px] text-foreground flex items-center gap-1.5">
                  <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-[11px] text-muted-foreground italic">None</span>
          )}
        </div>

        {/* UNCHANGED */}
        <div className="p-2.5 rounded border border-border/60 bg-muted/20 space-y-1">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center justify-between">
            <span>UNCHANGED</span>
            <span>•{diff.unchanged?.length || 0}</span>
          </div>
          {diff.unchanged && diff.unchanged.length > 0 ? (
            <ul className="space-y-0.5">
              {diff.unchanged.map((item, idx) => (
                <li key={idx} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="text-muted-foreground select-none">•</span>
                  <span className="truncate">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-[11px] text-muted-foreground italic">None</span>
          )}
        </div>

        {/* LOSING */}
        <div className="p-2.5 rounded border border-rose-500/20 bg-rose-500/5 space-y-1">
          <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase flex items-center justify-between">
            <span>LOSING</span>
            <span>-{diff.losing?.length || 0}</span>
          </div>
          {diff.losing && diff.losing.length > 0 ? (
            <ul className="space-y-0.5">
              {diff.losing.map((item, idx) => (
                <li key={idx} className="text-[11px] text-rose-600 dark:text-rose-400 line-through flex items-center gap-1.5">
                  <Minus className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-[11px] text-muted-foreground italic">None</span>
          )}
        </div>
      </div>
    </div>
  );
}
