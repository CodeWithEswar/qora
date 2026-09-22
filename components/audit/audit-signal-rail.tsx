"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { AuditSignalMetrics } from "@nxtqr/contracts";

interface AuditSignalRailProps {
  metrics: AuditSignalMetrics;
  activeFilter?: string | null;
  onSelectFilter?: (key: string | null) => void;
}

export function AuditSignalRail({
  metrics,
  activeFilter,
  onSelectFilter,
}: AuditSignalRailProps) {
  const signals = [
    {
      id: "events",
      label: "EVENTS",
      value: metrics.totalEvents.toLocaleString(),
      sublabel: "Forensic records",
      icon: "solar:shield-check-bold",
      accent: "#FA520F",
    },
    {
      id: "actors",
      label: "ACTORS",
      value: String(metrics.totalActors).padStart(2, "0"),
      sublabel: "Active initiators",
      icon: "solar:users-group-two-rounded-bold",
      accent: "#FFB83E",
    },
    {
      id: "resources",
      label: "RESOURCE TYPES",
      value: String(metrics.totalResources).padStart(2, "0"),
      sublabel: "Distinct boundaries",
      icon: "solar:box-minimalistic-bold",
      accent: "#FFD06A",
    },
    {
      id: "failed",
      label: "FAILED OPERATIONS",
      value: String(metrics.failedOperations).padStart(2, "0"),
      sublabel: "Denied or aborted",
      icon: "solar:danger-triangle-bold",
      accent: metrics.failedOperations > 0 ? "#F43F5E" : "#85827B",
    },
    {
      id: "range",
      label: "TIME RANGE",
      value: metrics.timeRange.toUpperCase(),
      sublabel: "Active window",
      icon: "solar:calendar-date-bold",
      accent: "#85827B",
    },
  ];

  return (
    <div className="border-b border-white/[0.08] bg-[#151515] px-6 py-2.5 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-3 sm:gap-6 min-w-max text-xs">
        {signals.map((signal, index) => {
          const isSelected = activeFilter === signal.id;
          return (
            <React.Fragment key={signal.id}>
              <button
                onClick={() => onSelectFilter?.(isSelected ? null : signal.id)}
                className={`group flex items-center gap-2.5 px-2.5 py-1 rounded-md transition-all text-left ${
                  isSelected
                    ? "bg-white/[0.08] ring-1 ring-[#FA520F]/50"
                    : "hover:bg-white/[0.04]"
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                  style={{ backgroundColor: signal.accent }}
                />

                <span className="font-mono text-[11px] tracking-wider text-[#85827B] uppercase font-medium">
                  {signal.label}
                </span>

                <span className="font-mono font-bold text-sm text-[#F7F4EC]">
                  {signal.value}
                </span>

                <span className="text-[10px] text-[#85827B] hidden md:inline-block font-sans border-l border-white/[0.08] pl-2">
                  {signal.sublabel}
                </span>
              </button>

              {index < signals.length - 1 && (
                <div className="h-3 w-px bg-white/[0.08] shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
