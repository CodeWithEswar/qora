"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ListFilter, Network, Layers, Users } from "lucide-react";

export type ActivityViewTab = "stream" | "observatory" | "resources" | "people";

interface ActivityTabsProps {
  activeTab: ActivityViewTab;
  onTabChange: (tab: ActivityViewTab) => void;
  counts: {
    stream: number;
    resources: number;
    people: number;
  };
  className?: string;
}

export function ActivityTabs({
  activeTab,
  onTabChange,
  counts,
  className,
}: ActivityTabsProps) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const tabs: Array<{ id: ActivityViewTab; label: string; icon: React.ElementType; count?: number }> = [
    { id: "stream", label: "Stream", icon: ListFilter, count: counts.stream },
    { id: "observatory", label: "Observatory", icon: Network },
    { id: "resources", label: "Resources", icon: Layers, count: counts.resources },
    { id: "people", label: "People", icon: Users, count: counts.people },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-border/80 pb-2 select-none",
        className
      )}
      role="tablist"
      aria-label="Activity Views"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "group flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              isActive
                ? "bg-foreground/10 text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#FA520F]" : "text-muted-foreground")} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                  isActive
                    ? "bg-foreground/15 text-foreground"
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                )}
              >
                {pad(tab.count)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
