"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ActivityProjection } from "@/lib/supabase/types/activity";
import { ArrowRight, CheckCircle2, ShieldCheck, QrCode } from "lucide-react";

interface OperationalStoryProps {
  resourceTitle: string;
  resourceType: string;
  events: ActivityProjection[];
  className?: string;
}

export function OperationalStory({
  resourceTitle,
  resourceType,
  events,
  className,
}: OperationalStoryProps) {
  const chronological = React.useMemo(() => {
    return [...events].sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
    );
  }, [events]);

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border/70 bg-card/60 font-mono text-xs space-y-3 select-none",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div>
          <span className="text-[10px] text-[#FA520F] uppercase tracking-wider font-bold block">
            OPERATIONAL STORY
          </span>
          <h4 className="text-xs font-bold text-foreground font-sans">
            {resourceTitle}
          </h4>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {events.length} Milestones
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {chronological.map((evt, idx) => (
          <React.Fragment key={evt.id}>
            {idx > 0 && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />}
            <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 shrink-0 min-w-[140px] space-y-1">
              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <span className="text-[#FA520F] font-bold uppercase">{evt.category}</span>
                <span suppressHydrationWarning>
                  {new Date(evt.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground font-sans truncate">
                {evt.verb}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                by {evt.actor.name}
              </p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
