"use client";

import * as React from "react";
import { Route, Layers, Compass, BarChart3, ShieldCheck } from "lucide-react";
import { RoutingAssetItem } from "../types";

interface RoutingAnalyticsViewProps {
  assets: RoutingAssetItem[];
}

export function RoutingAnalyticsView({ assets }: RoutingAnalyticsViewProps) {
  const totalAssets = assets.length;

  const { conditionalCount, defaultCount, conditionTypeStats, totalConditions } =
    React.useMemo(() => {
      let conditional = 0;
      let def = 0;
      const types: Record<string, number> = {};
      let totalConds = 0;

      for (const a of assets) {
        if (a.ruleCount > 0) {
          conditional++;
          for (const r of a.rules || []) {
            for (const c of r.conditions || []) {
              const t = (c.type || "unknown").toLowerCase();
              types[t] = (types[t] || 0) + 1;
              totalConds++;
            }
          }
        } else {
          def++;
        }
      }

      return {
        conditionalCount: conditional,
        defaultCount: def,
        conditionTypeStats: types,
        totalConditions: totalConds,
      };
    }, [assets]);

  const conditionalPercent =
    totalAssets > 0 ? Math.round((conditionalCount / totalAssets) * 100) : 0;
  const defaultPercent =
    totalAssets > 0 ? Math.round((defaultCount / totalAssets) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Routing Mode Distribution Strip */}
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-5 sm:p-6 space-y-5 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F7F4EC]">
            Routing Architecture Distribution
          </h3>
          <p className="text-xs text-[#85827B] mt-0.5">
            Truthful breakdown of deterministic conditional policies versus static default routes.
          </p>
        </div>

        {/* Signal Geometry Bars */}
        <div className="space-y-4 font-mono text-xs">
          {/* Conditional */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[#B8B5AD]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FA520F]" />
                CONDITIONAL ROUTING (RULES)
              </span>
              <span className="text-[#F7F4EC] font-bold">
                {conditionalCount} assets ({conditionalPercent}%)
              </span>
            </div>
            <div className="h-3 w-full rounded bg-[#1f1f23] overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full rounded-sm bg-gradient-to-r from-[#FA520F] to-[#FF8105] transition-all duration-500"
                style={{ width: `${conditionalPercent}%` }}
              />
            </div>
          </div>

          {/* Default */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[#B8B5AD]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#85827B]" />
                DEFAULT DIRECT ROUTING
              </span>
              <span className="text-[#F7F4EC] font-bold">
                {defaultCount} assets ({defaultPercent}%)
              </span>
            </div>
            <div className="h-3 w-full rounded bg-[#1f1f23] overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full rounded-sm bg-white/20 transition-all duration-500"
                style={{ width: `${defaultPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Condition Criteria Distribution */}
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-5 sm:p-6 space-y-4 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F7F4EC]">
            Active Evaluation Criteria Breakdown
          </h3>
          <p className="text-xs text-[#85827B] mt-0.5">
            Distribution of condition types evaluated across all workspace rules.
          </p>
        </div>

        {totalConditions === 0 ? (
          <div className="py-6 text-center text-xs text-[#85827B]">
            No condition criteria configured yet. Configure QR Brain rules to see condition distributions.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {Object.entries(conditionTypeStats).map(([type, count]) => {
              const pct = Math.round((count / totalConditions) * 100);
              return (
                <div
                  key={type}
                  className="p-3.5 rounded-lg border border-white/5 bg-[#18181b] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-[#85827B]">
                    <span className="uppercase font-mono text-[10px] tracking-wider font-semibold">
                      {type}
                    </span>
                    <span className="text-[#FA520F] font-mono text-xs">{count}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-mono text-[#F7F4EC]">
                      {pct}%
                    </span>
                    <span className="text-[10px] text-[#85827B] font-mono">of conditions</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-[#FA520F] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
