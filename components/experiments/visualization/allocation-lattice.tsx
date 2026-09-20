"use client";

import * as React from "react";
import { Sliders, CheckCircle2, AlertCircle } from "lucide-react";
import { ExperimentVariantItem } from "../types";

interface AllocationLatticeProps {
  variants: ExperimentVariantItem[];
  totalObservations: number;
}

export function AllocationLattice({ variants, totalObservations }: AllocationLatticeProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-4 font-sans shadow-xs text-card-foreground">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground uppercase font-mono text-[11px] tracking-wider">
            ALLOCATION LATTICE — EXPECTED VS OBSERVED
          </span>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">
          DELTA INTEGRITY
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="space-y-3">
        {variants.map((v, idx) => {
          const expectedPct = v.trafficWeight;
          const observedPct =
            totalObservations > 0 ? (v.totalScans / totalObservations) * 100 : expectedPct;
          const delta = (observedPct - expectedPct).toFixed(1);
          const isBalanced = Math.abs(Number(delta)) <= 5.0;

          return (
            <div
              key={v.id || idx}
              className="p-3.5 rounded-xl bg-muted/40 dark:bg-[#141418] border border-border dark:border-white/5 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center ${
                      idx === 0
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-semibold text-foreground">{v.name}</span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-muted-foreground">
                    Exp: <strong className="text-foreground">{expectedPct}%</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Obs: <strong className="text-primary">{observedPct.toFixed(1)}%</strong>
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      isBalanced
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    Δ {Number(delta) >= 0 ? `+${delta}%` : `${delta}%`}
                  </span>
                </div>
              </div>

              {/* Dual Bar (Expected vs Observed) */}
              <div className="space-y-1">
                {/* Expected Bar */}
                <div className="h-1.5 w-full bg-muted dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-muted-foreground/30 dark:bg-zinc-600 rounded-full"
                    style={{ width: `${expectedPct}%` }}
                    title={`Expected: ${expectedPct}%`}
                  />
                </div>
                {/* Observed Bar */}
                <div className="h-1.5 w-full bg-muted dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0 ? "bg-blue-500" : "bg-purple-500"
                    }`}
                    style={{ width: `${observedPct}%` }}
                    title={`Observed: ${observedPct.toFixed(1)}%`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-muted-foreground font-mono leading-relaxed pt-1">
        Normal statistical variance is expected in early sampling. Cloudflare edge seed hashing
        converges toward the exact target weights as observations accumulate.
      </div>
    </div>
  );
}
