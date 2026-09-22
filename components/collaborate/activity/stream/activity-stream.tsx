"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ActivityProjection } from "@/lib/supabase/types/activity";
import { ActivityEventRow } from "./activity-event-row";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

interface ActivityStreamProps {
  events: ActivityProjection[];
  onSelectEvent: (event: ActivityProjection) => void;
  onClearFilters?: () => void;
  isFiltered?: boolean;
  className?: string;
}

export function ActivityStream({
  events,
  onSelectEvent,
  onClearFilters,
  isFiltered = false,
  className,
}: ActivityStreamProps) {
  // Group events by TODAY, YESTERDAY, THIS WEEK, EARLIER
  const groups = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const bucketToday: ActivityProjection[] = [];
    const bucketYesterday: ActivityProjection[] = [];
    const bucketWeek: ActivityProjection[] = [];
    const bucketEarlier: ActivityProjection[] = [];

    events.forEach((e) => {
      const d = new Date(e.occurredAt);
      if (d >= today) {
        bucketToday.push(e);
      } else if (d >= yesterday) {
        bucketYesterday.push(e);
      } else if (d >= thisWeek) {
        bucketWeek.push(e);
      } else {
        bucketEarlier.push(e);
      }
    });

    return [
      { label: "TODAY", events: bucketToday },
      { label: "YESTERDAY", events: bucketYesterday },
      { label: "THIS WEEK", events: bucketWeek },
      { label: "EARLIER", events: bucketEarlier },
    ].filter((g) => g.events.length > 0);
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="p-12 text-center border border-border/60 rounded-xl bg-card/30 font-mono text-xs text-muted-foreground space-y-3">
        <span className="text-sm font-bold text-foreground font-sans block">
          No Activity Recorded
        </span>
        <p className="text-xs text-muted-foreground font-sans max-w-sm mx-auto">
          {isFiltered
            ? "No operational changes match the selected filter criteria or time period."
            : "Operational actions such as QR publications, approvals, comments, and team changes will appear here."}
        </p>
        {isFiltered && onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs font-mono text-[#FA520F] border-border/80"
          >
            Clear Active Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-5 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md space-y-6 select-none",
        className
      )}
      role="feed"
      aria-label="Activity History Stream"
    >
      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          {/* Group Header */}
          <div className="flex items-center gap-2 pb-1 border-b border-border/50">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">
              {group.label}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/50">
              ({group.events.length})
            </span>
          </div>

          {/* Group Events on Vertical Spine */}
          <div className="relative pl-1">
            {/* Continuous Vertical Wire Line */}
            <div
              className="absolute left-[13px] top-3 bottom-3 w-px bg-border/80 pointer-events-none"
              aria-hidden="true"
            />

            <div className="space-y-1">
              {group.events.map((evt) => (
                <ActivityEventRow
                  key={evt.id}
                  event={evt}
                  onSelectEvent={onSelectEvent}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
