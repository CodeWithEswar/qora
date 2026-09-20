"use client";

import * as React from "react";
import { Icon } from "@iconify/react";

export type GuardianTab = "overview" | "monitors" | "incidents" | "recovery";

interface GuardianNavTabsProps {
  activeTab: GuardianTab;
  onTabChange: (tab: GuardianTab) => void;
  incidentsCount: number;
  monitorsCount: number;
}

export function GuardianNavTabs({
  activeTab,
  onTabChange,
  incidentsCount,
  monitorsCount,
}: GuardianNavTabsProps) {
  const tabs: Array<{ id: GuardianTab; label: string; icon: string; count?: number }> = [
    { id: "overview", label: "Overview", icon: "solar:graph-up-linear" },
    { id: "monitors", label: "Monitors", icon: "solar:server-square-linear", count: monitorsCount },
    { id: "incidents", label: "Incidents", icon: "solar:danger-triangle-linear", count: incidentsCount },
    { id: "recovery", label: "Recovery", icon: "solar:restart-square-linear" },
  ];

  return (
    <div className="border-b border-border">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-foreground text-background font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon icon={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full ${
                    isActive
                      ? "bg-background text-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
