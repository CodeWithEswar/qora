"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ActivityProjection } from "@/lib/supabase/types/activity";
import { Network, ArrowRight } from "lucide-react";

interface EventConstellationProps {
  events: ActivityProjection[];
  onSelectEvent: (event: ActivityProjection) => void;
  className?: string;
}

export function EventConstellation({
  events,
  onSelectEvent,
  className,
}: EventConstellationProps) {
  // Take the most recent 12 events to construct a clear structured graph
  const sampleEvents = React.useMemo(() => {
    return events.slice(0, 12);
  }, [events]);

  const [hoveredEventId, setHoveredEventId] = React.useState<string | null>(null);

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md font-mono text-xs select-none",
        className
      )}
      role="region"
      aria-label="Event Constellation"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#FA520F] font-bold flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5" />
            <span>09 / EVENT CONSTELLATION</span>
          </span>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-xs text-muted-foreground font-sans">
            Actor ➔ Event ➔ Resource ➔ Milestone graph
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          Structured Geometry
        </span>
      </div>

      {sampleEvents.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-xs font-mono">
          No constellation events available in this period.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sampleEvents.map((evt) => {
            const isHovered = hoveredEventId === evt.id;
            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                onMouseEnter={() => setHoveredEventId(evt.id)}
                onMouseLeave={() => setHoveredEventId(null)}
                className={cn(
                  "p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between space-y-2",
                  isHovered
                    ? "border-[#FA520F] bg-[#FA520F]/10 ring-1 ring-[#FA520F]/30"
                    : "border-border/60 bg-muted/20 hover:bg-muted/40"
                )}
              >
                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <span className="font-bold text-foreground truncate max-w-[120px]">
                    {evt.actor.name}
                  </span>
                  <span className="text-[#FA520F] uppercase font-bold text-[9px]">
                    {evt.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <span className="truncate">{evt.resource.name}</span>
                  {evt.revision && (
                    <span className="text-[10px] text-[#FA520F] font-mono shrink-0">
                      (rev {evt.revision})
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                  <span>{evt.context}</span>
                  <span className="flex items-center gap-0.5 text-foreground hover:text-[#FA520F]">
                    Inspect <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
