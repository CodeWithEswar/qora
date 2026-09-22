"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import type {
  DetailedPropertyDiff,
  ChangeTopologyCategory,
  ApprovalType,
} from "@/lib/supabase/types/approvals";
import { cn } from "@/lib/utils";
import { ArrowRight, Plus, Minus, Edit2, Check, AlertCircle } from "lucide-react";

interface RevisionDiffProps {
  type: ApprovalType;
  propertyDiffs?: DetailedPropertyDiff[];
  selectedCategory?: ChangeTopologyCategory | "ALL";
  baseRevisionNumber?: number;
  targetRevisionNumber: number;
}

export function RevisionDiff({
  type,
  propertyDiffs = [],
  selectedCategory = "ALL",
  baseRevisionNumber = 1,
  targetRevisionNumber = 2,
}: RevisionDiffProps) {
  const filteredDiffs = selectedCategory === "ALL"
    ? propertyDiffs
    : propertyDiffs.filter((d) => d.category === selectedCategory);

  const getSemanticBadge = (changeType: string) => {
    switch (changeType) {
      case "ADDED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Plus className="w-2.5 h-2.5" /> ADDED
          </span>
        );
      case "REMOVED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Minus className="w-2.5 h-2.5" /> REMOVED
          </span>
        );
      case "CHANGED":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            <Edit2 className="w-2.5 h-2.5" /> CHANGED
          </span>
        );
    }
  };

  const renderValuePreview = (diff: DetailedPropertyDiff, isProposed: boolean) => {
    const val = isProposed ? (diff.proposedDisplay ?? diff.proposedValue) : (diff.beforeDisplay ?? diff.beforeValue);
    const strVal = String(val ?? "");

    // Color Swatch check
    if (strVal.startsWith("#") && (strVal.length === 4 || strVal.length === 7)) {
      return (
        <div className="flex items-center gap-2 font-mono text-xs">
          <span
            className="w-4 h-4 rounded border border-border/80 shadow-2xs shrink-0"
            style={{ backgroundColor: strVal }}
          />
          <span className="text-foreground font-semibold">{strVal}</span>
        </div>
      );
    }

    // URL check
    if (strVal.startsWith("http://") || strVal.startsWith("https://")) {
      return (
        <span className="font-mono text-xs text-foreground font-medium break-all underline decoration-border/60">
          {strVal}
        </span>
      );
    }

    return (
      <span className="font-mono text-xs text-foreground font-medium">
        {strVal || "—"}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-bold flex items-center gap-2">
          <span>REVISION DIFFERENTIAL</span>
          <span className="text-border">/</span>
          <span className="text-foreground">REV {baseRevisionNumber} ➔ REV {targetRevisionNumber}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          Showing {filteredDiffs.length} {filteredDiffs.length === 1 ? "property" : "properties"}
        </span>
      </div>

      {filteredDiffs.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-border text-center space-y-2 font-mono">
          <p className="text-xs text-muted-foreground">
            No property modifications found for category: <span className="font-semibold text-foreground">{selectedCategory}</span>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDiffs.map((diff) => (
            <div
              key={diff.id}
              className="p-4 rounded-xl border border-border/70 bg-card/40 hover:bg-card/70 transition-all font-mono space-y-3"
            >
              {/* Field Label & Category */}
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-muted/60 text-muted-foreground font-bold">
                    {diff.category}
                  </span>
                  <span className="text-xs font-semibold text-foreground font-sans">
                    {diff.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    ({diff.field})
                  </span>
                </div>

                {getSemanticBadge(diff.changeType)}
              </div>

              {/* Differential Comparison: BEFORE ➔ PROPOSED */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* BEFORE */}
                <div className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-1">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                    BEFORE (REV {baseRevisionNumber})
                  </div>
                  <div className="pt-1">
                    {renderValuePreview(diff, false)}
                  </div>
                </div>

                {/* PROPOSED */}
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-1">
                  <div className="text-[9px] uppercase tracking-wider text-primary font-bold">
                    PROPOSED (REV {targetRevisionNumber})
                  </div>
                  <div className="pt-1">
                    {renderValuePreview(diff, true)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
