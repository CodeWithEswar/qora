"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export type AnalyticsTab =
  | "overview"
  | "performance"
  | "geography"
  | "devices"
  | "time"
  | "routing"
  | "experiments"
  | "trafficQuality"
  | "reports";

interface AnalyticsNavProps {
  activeTab: AnalyticsTab;
  onTabChange: (tab: AnalyticsTab) => void;
  className?: string;
}

const TABS: Array<{ id: AnalyticsTab; label: string; icon: string }> = [
  { id: "overview", label: "Overview", icon: "lucide:bar-chart-3" },
  { id: "performance", label: "Performance", icon: "lucide:trending-up" },
  { id: "geography", label: "Geography", icon: "lucide:globe" },
  { id: "devices", label: "Devices", icon: "lucide:smartphone" },
  { id: "time", label: "Time Distribution", icon: "lucide:clock" },
  { id: "routing", label: "Routing", icon: "lucide:git-fork" },
  { id: "experiments", label: "Experiments", icon: "lucide:flask-conical" },
  { id: "trafficQuality", label: "Traffic Quality", icon: "lucide:shield-alert" },
  { id: "reports", label: "Reports", icon: "lucide:file-spreadsheet" },
];

export function AnalyticsNav({ activeTab, onTabChange, className }: AnalyticsNavProps) {
  return (
    <div className={cn("w-full overflow-x-auto no-scrollbar py-1", className)}>
      <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border bg-muted/60 w-max min-w-full sm:min-w-0 shadow-xs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/70"
              )}
            >
              <Icon icon={tab.icon} className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
