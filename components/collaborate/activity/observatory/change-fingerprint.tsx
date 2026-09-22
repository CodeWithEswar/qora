"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { EventCompositionItem } from "@/lib/supabase/types/activity";

interface ChangeFingerprintProps {
  items: EventCompositionItem[];
  className?: string;
}

export function ChangeFingerprint({ items, className }: ChangeFingerprintProps) {
  // Deterministic 8x8 module grid computed from category distribution
  const grid = React.useMemo(() => {
    const total = items.reduce((sum, it) => sum + it.count, 0);
    if (total === 0) return [];

    const cells: Array<{ color: string; label: string }> = [];
    items.forEach((it) => {
      const cellCount = Math.max(1, Math.round((it.count / total) * 64));
      for (let i = 0; i < cellCount; i++) {
        if (cells.length < 64) {
          cells.push({ color: it.color, label: it.label });
        }
      }
    });

    // Fill remaining
    while (cells.length < 64) {
      cells.push({ color: "rgba(255,255,255,0.05)", label: "Inactive" });
    }
    return cells;
  }, [items]);

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md font-mono text-xs select-none",
        className
      )}
      role="region"
      aria-label="Change Fingerprint"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#FA520F] font-bold">
            08 / CHANGE FINGERPRINT
          </span>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-xs text-muted-foreground font-sans">
            Deterministic QR-pattern signature
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          8×8 Pattern
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* 8x8 Grid Canvas */}
        <div className="p-2.5 rounded-lg border border-border/80 bg-black/40 shrink-0">
          <div className="grid grid-cols-8 gap-1 w-36 h-36">
            {grid.map((cell, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: cell.color }}
                className="w-full h-full rounded-2xs transition-all duration-150 hover:scale-110"
                title={`Module ${idx + 1}: ${cell.label}`}
              />
            ))}
          </div>
        </div>

        {/* Textual Description */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <h4 className="text-xs font-bold text-foreground font-sans">
            Operational Work Signature
          </h4>
          <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
            This module grid encodes the proportion of operational actions during the selected window. 
            The visual fingerprint varies deterministically as your organization balances creation, updates, and governance.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
            {items.slice(0, 4).map((it) => (
              <span key={it.category} className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: it.color }} />
                <span>{it.label}: {it.percentage}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
