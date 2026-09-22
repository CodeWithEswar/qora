"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ListFilter, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CollaborationViewTab =
  | "for_you"
  | "all"
  | "mentions"
  | "my_threads"
  | "resolved";

export type WorkspaceDisplayMode = "stream" | "constellation";

interface CommentsViewTabsProps {
  activeView: CollaborationViewTab;
  onViewChange: (view: CollaborationViewTab) => void;
  displayMode: WorkspaceDisplayMode;
  onDisplayModeChange: (mode: WorkspaceDisplayMode) => void;
  counts: {
    forYou: number;
    all: number;
    mentions: number;
    myThreads: number;
    resolved: number;
  };
  className?: string;
}

export function CommentsViewTabs({
  activeView,
  onViewChange,
  displayMode,
  onDisplayModeChange,
  counts,
  className,
}: CommentsViewTabsProps) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const tabs: Array<{ id: CollaborationViewTab; label: string; count: number; accent?: boolean }> = [
    { id: "for_you", label: "For You", count: counts.forYou, accent: true },
    { id: "all", label: "All Discussions", count: counts.all },
    { id: "mentions", label: "Mentions", count: counts.mentions },
    { id: "my_threads", label: "My Threads", count: counts.myThreads },
    { id: "resolved", label: "Resolved", count: counts.resolved },
  ];

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-2",
        className
      )}
    >
      {/* Tab Navigation */}
      <nav
        className="flex items-center gap-1 overflow-x-auto no-scrollbar"
        aria-label="Discussion Views"
      >
        {tabs.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onViewChange(tab.id)}
              className={cn(
                "group flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors select-none",
                isActive
                  ? "bg-foreground/10 text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                  isActive
                    ? tab.accent
                      ? "bg-[#FA520F]/20 text-[#FA520F]"
                      : "bg-foreground/15 text-foreground"
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                )}
              >
                {pad(tab.count)}
              </span>
            </button>
          );
        })}
      </nav>

      {/* View Mode Toggle: Stream vs Conversation Constellation */}
      <div className="flex items-center gap-1 self-end sm:self-auto bg-muted/40 p-0.5 rounded-lg border border-border/60">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDisplayModeChange("stream")}
          className={cn(
            "h-7 px-2.5 text-xs font-mono gap-1.5 rounded-md",
            displayMode === "stream"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Switch to 3-column Operational Stream"
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Stream</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDisplayModeChange("constellation")}
          className={cn(
            "h-7 px-2.5 text-xs font-mono gap-1.5 rounded-md",
            displayMode === "constellation"
              ? "bg-background text-[#FA520F] shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Switch to Conversation Constellation"
        >
          <Network className="w-3.5 h-3.5 text-[#FA520F]" />
          <span>Constellation</span>
        </Button>
      </div>
    </div>
  );
}
