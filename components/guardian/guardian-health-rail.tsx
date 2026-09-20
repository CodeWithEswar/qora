"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { GuardianPulseMetricsV1 } from "@nxtqr/contracts";

interface GuardianHealthRailProps {
  pulse: GuardianPulseMetricsV1;
  activeFilter?: string;
  onFilterSelect: (filter: string) => void;
}

export function GuardianHealthRail({
  pulse,
  activeFilter,
  onFilterSelect,
}: GuardianHealthRailProps) {
  const metrics = [
    {
      id: "all",
      label: "MONITORED",
      value: pulse.monitoredCount,
      icon: "solar:shield-check-linear",
      color: "text-foreground",
      borderActive: "border-primary",
      bgHover: "hover:border-primary/50",
    },
    {
      id: "healthy",
      label: "HEALTHY",
      value: pulse.healthyCount,
      icon: "solar:check-circle-bold",
      color: "text-emerald-600 dark:text-emerald-400",
      borderActive: "border-emerald-500",
      bgHover: "hover:border-emerald-500/50",
    },
    {
      id: "degraded",
      label: "DEGRADED",
      value: pulse.degradedCount,
      icon: "solar:danger-triangle-bold",
      color: "text-amber-600 dark:text-amber-400",
      borderActive: "border-amber-500",
      bgHover: "hover:border-amber-500/50",
    },
    {
      id: "unavailable",
      label: "UNAVAILABLE",
      value: pulse.unavailableCount,
      icon: "solar:close-circle-bold",
      color: "text-rose-600 dark:text-rose-400",
      borderActive: "border-rose-500",
      bgHover: "hover:border-rose-500/50",
    },
    {
      id: "incidents",
      label: "OPEN INCIDENTS",
      value: pulse.openIncidentsCount,
      icon: "solar:bell-bing-bold",
      color: "text-[#FA520F]",
      borderActive: "border-[#FA520F]",
      bgHover: "hover:border-[#FA520F]/50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {metrics.map((item) => {
        const isSelected =
          (activeFilter === item.id) ||
          (!activeFilter && item.id === "all");

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onFilterSelect(item.id)}
            className={`p-3.5 rounded-xl border bg-surface/90 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2 shadow-2xs ${
              isSelected
                ? `${item.borderActive} ring-1 ring-primary/20 bg-surface`
                : `border-border/80 ${item.bgHover}`
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-mono font-medium tracking-wider text-muted-foreground uppercase">
                {item.label}
              </span>
              <Icon icon={item.icon} className={`w-4 h-4 ${item.color}`} />
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono tracking-tight ${item.color}`}>
                {item.value}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
