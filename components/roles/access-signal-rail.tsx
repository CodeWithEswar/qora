"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { RolesControlPlaneMetrics } from "@nxtqr/contracts";

interface AccessSignalRailProps {
  metrics: RolesControlPlaneMetrics;
  activeFilter?: string | null;
  onSelectFilter?: (filterKey: string | null) => void;
}

export function AccessSignalRail({
  metrics,
  activeFilter,
  onSelectFilter,
}: AccessSignalRailProps) {
  const signals = [
    {
      id: "roles_all",
      label: "ROLES",
      value: String(metrics.totalRoles).padStart(2, "0"),
      sublabel: `${metrics.systemRoles} System · ${metrics.customRoles} Custom`,
      icon: "solar:shield-star-bold",
      accent: "#FA520F",
    },
    {
      id: "members",
      label: "MEMBERS",
      value: String(metrics.totalMembers).padStart(2, "0"),
      sublabel: "Active identities",
      icon: "solar:users-group-two-rounded-bold",
      accent: "#FFB83E",
    },
    {
      id: "capabilities",
      label: "CAPABILITIES",
      value: String(metrics.totalCapabilities).padStart(2, "0"),
      sublabel: "Canonical permissions",
      icon: "solar:key-square-bold",
      accent: "#FFD06A",
    },
    {
      id: "custom_roles",
      label: "CUSTOM ROLES",
      value: String(metrics.customRoles).padStart(2, "0"),
      sublabel: "Tenant-scoped",
      icon: "solar:shield-user-bold",
      accent: "#FA520F",
    },
    {
      id: "teams",
      label: "TEAMS",
      value: String(metrics.teamsCount).padStart(2, "0"),
      sublabel: "Organizational units",
      icon: "solar:user-hand-up-bold",
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
