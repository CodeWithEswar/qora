"use client";

import * as React from "react";
import type { ThreadPulseMetrics } from "@/lib/supabase/types/comments";
import { cn } from "@/lib/utils";

interface ThreadPulseProps {
  metrics: ThreadPulseMetrics;
  className?: string;
}

export function ThreadPulse({ metrics, className }: ThreadPulseProps) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-y-2 border-y border-border/70 py-2.5 text-xs font-mono uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      <div className="flex items-center gap-2 pr-4 sm:pr-6">
        <span className="text-[10px] tracking-widest text-muted-foreground/70">THREADS</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-semibold text-foreground">{pad(metrics.totalThreads ?? metrics.threadsCount ?? 0)}</span>
      </div>

      <div className="hidden sm:block h-3 w-px bg-border/60" />

      <div className="flex items-center gap-2 px-0 sm:px-6">
        <span className="text-[10px] tracking-widest text-muted-foreground/70">UNREAD</span>
        <span className="text-muted-foreground/40">/</span>
        <span
          className={cn(
            "font-semibold",
            metrics.unreadCount > 0 ? "text-[#CC785C]" : "text-foreground"
          )}
        >
          {pad(metrics.unreadCount)}
        </span>
      </div>

      <div className="hidden sm:block h-3 w-px bg-border/60" />

      <div className="flex items-center gap-2 px-0 sm:px-6">
        <span className="text-[10px] tracking-widest text-muted-foreground/70">MENTIONS</span>
        <span className="text-muted-foreground/40">/</span>
        <span
          className={cn(
            "font-semibold",
            metrics.mentionsCount > 0 ? "text-[#CC785C]" : "text-foreground"
          )}
        >
          {pad(metrics.mentionsCount)}
        </span>
      </div>

      <div className="hidden sm:block h-3 w-px bg-border/60" />

      <div className="flex items-center gap-2 pl-0 sm:pl-6">
        <span className="text-[10px] tracking-widest text-muted-foreground/70">UNRESOLVED</span>
        <span className="text-muted-foreground/40">/</span>
        <span
          className={cn(
            "font-semibold",
            metrics.unresolvedCount > 0 ? "text-[#D4A017]" : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {pad(metrics.unresolvedCount)}
        </span>
      </div>
    </div>
  );
}
