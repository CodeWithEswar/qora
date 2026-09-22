"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { CanonicalApprovalView } from "@/lib/supabase/types/approvals";

export type ApprovalViewTab = CanonicalApprovalView | "my_review" | "all_open" | "decided";

interface ApprovalViewsProps {
  activeView: ApprovalViewTab;
  onViewChange: (view: CanonicalApprovalView) => void;
  counts: {
    myQueue: number;
    allRequests: number;
    requestedByMe: number;
    history: number;
  };
  className?: string;
}

export function ApprovalViews({
  activeView,
  onViewChange,
  counts,
  className,
}: ApprovalViewsProps) {
  // Normalize canonical key
  const normalizedActive: CanonicalApprovalView =
    activeView === "my_review" ? "my_queue"
    : activeView === "all_open" ? "all_requests"
    : activeView === "decided" ? "history"
    : (activeView as CanonicalApprovalView);

  const tabs: Array<{ id: CanonicalApprovalView; label: string; count: number }> = [
    { id: "my_queue", label: "MY QUEUE", count: counts.myQueue },
    { id: "all_requests", label: "ALL REQUESTS", count: counts.allRequests },
    { id: "requested_by_me", label: "REQUESTED BY ME", count: counts.requestedByMe },
    { id: "history", label: "HISTORY", count: counts.history },
  ];

  return (
    <nav
      aria-label="Governance Decision Views"
      className={cn("flex items-center gap-1 border-b border-border/70 overflow-x-auto no-scrollbar", className)}
    >
      {tabs.map((tab) => {
        const isActive = normalizedActive === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onViewChange(tab.id)}
            className={cn(
              "px-3.5 py-2.5 text-xs font-mono tracking-wider whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
              isActive
                ? "border-primary text-foreground font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60 font-medium"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-mono",
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tab.count < 10 ? `0${tab.count}` : tab.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
