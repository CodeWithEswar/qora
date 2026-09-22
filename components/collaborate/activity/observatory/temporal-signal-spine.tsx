"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ActivityProjection } from "@/lib/supabase/types/activity";
import { formatTime } from "@/lib/utils/date-format";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRight } from "lucide-react";

interface TemporalSignalSpineProps {
  events: ActivityProjection[];
  onSelectEvent: (event: ActivityProjection) => void;
  className?: string;
}

export function TemporalSignalSpine({
  events,
  onSelectEvent,
  className,
}: TemporalSignalSpineProps) {
  // Take up to 20 chronological events for the horizontal spine
  const displayEvents = React.useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())
      .slice(-20);
  }, [events]);

  const getMarker = (category: string) => {
    if (category === "publish") {
      return {
        symbol: "◆",
        color: "text-[#FA520F] bg-[#FA520F]/20 border-[#FA520F]",
        label: "PUBLISH",
      };
    }
    if (category === "approval") {
      return {
        symbol: "◇",
        color: "text-[#FFB83E] bg-[#FFB83E]/20 border-[#FFB83E]",
        label: "APPROVAL",
      };
    }
    if (category === "archive" || category === "delete") {
      return {
        symbol: "■",
        color: "text-zinc-400 bg-zinc-800 border-zinc-600",
        label: "ARCHIVE",
      };
    }
    return {
      symbol: "●",
      color: "text-blue-400 bg-blue-500/20 border-blue-400",
      label: "STANDARD",
    };
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md font-mono text-xs select-none",
        className
      )}
      role="region"
      aria-label="Temporal Signal Spine"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#FA520F] font-bold">
            01 / TEMPORAL SIGNAL SPINE
          </span>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-xs text-muted-foreground font-sans">
            Chronological operational milestones
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <span className="text-[#FA520F] font-bold">◆</span> Publish
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[#FFB83E] font-bold">◇</span> Approval
          </span>
          <span className="flex items-center gap-1">
            <span className="text-blue-400 font-bold">●</span> Activity
          </span>
          <span className="flex items-center gap-1">
            <span className="text-zinc-400 font-bold">■</span> Archive
          </span>
        </div>
      </div>

      {displayEvents.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-xs font-mono">
          No operational events recorded in this time range.
        </div>
      ) : (
        <>
          {/* Desktop Horizontal View */}
          <div className="hidden md:block relative pt-6 pb-4">
            {/* Horizontal Timeline Spine Wire */}
            <div
              className="absolute left-4 right-4 top-10 h-px bg-border/80 pointer-events-none"
              aria-hidden="true"
            />

            <div className="flex items-center justify-between relative px-2">
              <div className="absolute -top-4 left-0 text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold">
                EARLIER
              </div>
              <div className="absolute -top-4 right-0 text-[9px] uppercase tracking-wider text-[#FA520F] font-bold">
                NOW
              </div>

              {displayEvents.map((evt, idx) => {
                const marker = getMarker(evt.category);
                const timeStr = formatTime(evt.occurredAt);

                return (
                  <TooltipProvider key={evt.id} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => onSelectEvent(evt)}
                          className={cn(
                            "w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-150 relative z-10 hover:scale-125 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FA520F]",
                            marker.color
                          )}
                          aria-label={`${evt.verb} ${evt.resource.name}`}
                        >
                          <span>{marker.symbol}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="p-3 text-xs font-mono space-y-1 bg-popover border-border shadow-md max-w-xs"
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                          <span className="uppercase text-[#FA520F] font-bold">{evt.category}</span>
                          <span suppressHydrationWarning>{timeStr}</span>
                        </div>
                        <p className="font-sans font-semibold text-foreground text-xs">
                          {evt.actor.name} {evt.verb} {evt.resource.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          {evt.resource.type.toUpperCase()}: {evt.resource.ref}
                        </p>
                        <div className="pt-1 text-[9px] text-[#FA520F] uppercase tracking-wider font-semibold flex items-center gap-1">
                          Click to inspect event <ArrowRight className="w-2.5 h-2.5" />
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>

          {/* Mobile Vertical View */}
          <div className="md:hidden relative pl-6 space-y-4 pt-2">
            <div
              className="absolute left-2.5 top-2 bottom-2 w-px bg-border/80 pointer-events-none"
              aria-hidden="true"
            />
            {displayEvents.slice(-6).reverse().map((evt) => {
              const marker = getMarker(evt.category);
              const timeStr = formatTime(evt.occurredAt);

              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="relative flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={cn(
                      "absolute -left-6 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0",
                      marker.color
                    )}
                  >
                    {marker.symbol}
                  </div>
                  <div className="p-2 rounded-lg border border-border/60 bg-muted/20 flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#FA520F] uppercase">{evt.category}</span>
                      <span suppressHydrationWarning className="text-muted-foreground">{timeStr}</span>
                    </div>
                    <p className="text-xs font-sans text-foreground truncate mt-0.5">
                      {evt.actor.name} {evt.verb} {evt.resource.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
