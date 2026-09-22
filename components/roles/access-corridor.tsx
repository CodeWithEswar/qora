"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { AccessCorridorStep } from "@nxtqr/contracts";

interface AccessCorridorProps {
  steps: AccessCorridorStep[];
  decision: "allowed" | "denied" | "approval_required";
  reasons?: string[];
}

export function AccessCorridor({
  steps,
  decision,
  reasons = [],
}: AccessCorridorProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#151515] p-5 sm:p-6 space-y-6">
      {/* Corridor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Icon icon="solar:route-bold" className="w-4 h-4 text-[#FA520F]" />
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#F7F4EC]">
              Access Decision Corridor
            </h4>
          </div>
          <p className="text-xs text-[#85827B] mt-0.5">
            8-stage deterministic authorization pipeline. Checks short-circuit upon denial.
          </p>
        </div>

        {/* Decision Badge */}
        <div className="flex items-center gap-2">
          {decision === "allowed" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              ACTION ALLOWED
            </div>
          )}
          {decision === "denied" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              ACTION DENIED
            </div>
          )}
          {decision === "approval_required" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              APPROVAL REQUIRED
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Pipeline */}
      <div className="overflow-x-auto scrollbar-none py-2">
        <div className="flex items-center min-w-[680px] justify-between">
          {steps.map((step, index) => {
            const isPassed = step.status === "passed";
            const isBlocked = step.status === "blocked";
            const isApproval = step.status === "requires_approval";

            return (
              <React.Fragment key={step.stage}>
                <div className="flex flex-col items-center text-center group min-w-[64px]">
                  {/* Step Icon Indicator */}
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                      isPassed
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10"
                        : isBlocked
                        ? "border-rose-500/60 bg-rose-500/10 text-rose-400 ring-2 ring-rose-500/20"
                        : isApproval
                        ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                        : "border-white/[0.08] bg-[#191919] text-[#85827B]"
                    }`}
                  >
                    {isPassed ? (
                      <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                    ) : isBlocked ? (
                      <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                    ) : isApproval ? (
                      <Icon icon="solar:hourglass-bold" className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-mono font-bold text-[#85827B]">—</span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#F7F4EC] mt-2">
                    {step.stage}
                  </span>

                  <span className="text-[9px] text-[#85827B] max-w-[80px] truncate mt-0.5">
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded transition-colors ${
                      isPassed ? "bg-emerald-500/40" : "bg-white/[0.08]"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Corridor Decision Notes / Reasons */}
      {reasons.length > 0 && (
        <div className="p-3 rounded-lg border border-white/[0.06] bg-[#191919] space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-[#85827B] tracking-wider font-semibold">
            Evaluation Details
          </span>
          <ul className="text-xs text-[#B8B5AD] space-y-1">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#FA520F] font-mono text-[10px]">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
