"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type CommentViewTab =
  | "all"
  | "my_threads"
  | "mentions"
  | "unread"
  | "unresolved";

interface CommentViewsProps {
  activeView: CommentViewTab;
  onViewChange: (view: CommentViewTab) => void;
  counts: {
    all: number;
    myThreads: number;
    mentions: number;
    unread: number;
    unresolved: number;
  };
  className?: string;
}

export function CommentViews({
  activeView,
  onViewChange,
  counts,
  className,
}: CommentViewsProps) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const tabs: Array<{ id: CommentViewTab; label: string; count: number }> = [
    { id: "all", label: "All Discussions", count: counts.all },
    { id: "my_threads", label: "My Threads", count: counts.myThreads },
    { id: "mentions", label: "Mentions", count: counts.mentions },
    { id: "unread", label: "Unread", count: counts.unread },
    { id: "unresolved", label: "Unresolved", count: counts.unresolved },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-border/70 pb-px",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors",
              isActive
                ? "border-[#CC785C] text-[#CC785C] font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                isActive
                  ? "bg-[#CC785C]/15 text-[#CC785C]"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {pad(tab.count)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
