"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ActivityProjection } from "@/lib/supabase/types/activity";
import { formatDistanceToNow, formatDateTime, formatTime } from "@/lib/utils/date-format";
import { ArrowUpRight } from "lucide-react";

interface ActivityEventRowProps {
  event: ActivityProjection;
  onSelectEvent: (event: ActivityProjection) => void;
  className?: string;
}

export function ActivityEventRow({
  event,
  onSelectEvent,
  className,
}: ActivityEventRowProps) {
  const getMarker = (category: string) => {
    if (category === "publish") {
      return {
        symbol: "◆",
        color: "text-[#FA520F] bg-[#FA520F]/20 border-[#FA520F]",
      };
    }
    if (category === "approval") {
      return {
        symbol: "◇",
        color: "text-[#FFB83E] bg-[#FFB83E]/20 border-[#FFB83E]",
      };
    }
    if (category === "archive" || category === "delete") {
      return {
        symbol: "■",
        color: "text-zinc-400 bg-zinc-800 border-zinc-600",
      };
    }
    return {
      symbol: "●",
      color: "text-blue-400 bg-blue-500/20 border-blue-400",
    };
  };

  const marker = getMarker(event.category);
  const formattedRelative = formatDistanceToNow(event.occurredAt, { addSuffix: true });
  const timeFormatted = formatTime(event.occurredAt);

  return (
    <div
      onClick={() => onSelectEvent(event)}
      className={cn(
        "group relative pl-8 py-3 rounded-lg hover:bg-muted/30 transition-all cursor-pointer select-none",
        className
      )}
    >
      {/* Node Marker on Spine Wire */}
      <div
        className={cn(
          "absolute left-[13px] top-3.5 w-5 h-5 -ml-2.5 rounded-full border flex items-center justify-center text-[10px] font-bold ring-4 ring-background shadow-xs select-none",
          marker.color
        )}
      >
        {marker.symbol}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Timestamp */}
          <span
            suppressHydrationWarning
            className="text-[11px] font-mono text-muted-foreground/70 font-semibold shrink-0"
          >
            {timeFormatted}
          </span>
          <span className="text-muted-foreground/30">•</span>

          {/* Actor */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center text-[8px] font-mono font-bold text-foreground">
              {event.actor.initials}
            </span>
            <span className="text-xs font-semibold text-foreground font-sans">
              {event.actor.name}
            </span>
          </div>

          {/* Human Readable Prose */}
          <span className="text-xs text-muted-foreground font-sans truncate">
            {event.verb}
          </span>

          <span className="text-xs font-semibold text-foreground font-mono truncate max-w-sm">
            {event.resource.name}
          </span>

          {event.revision && (
            <span className="text-[10px] font-mono text-[#FA520F] px-1 py-0.2 rounded bg-[#FA520F]/10 font-bold shrink-0">
              rev {event.revision}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground shrink-0 pl-6 sm:pl-0">
          <span className="px-1.5 py-0.5 rounded bg-muted border border-border/60 uppercase font-bold text-foreground/80">
            {event.resource.type.replace(/_/g, " ")}
          </span>
          <span suppressHydrationWarning>{formattedRelative}</span>
          <ArrowUpRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </div>
  );
}
