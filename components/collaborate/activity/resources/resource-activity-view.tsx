"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ActivityProjection } from "@/lib/supabase/types/activity";
import { OperationalStory } from "./operational-story";
import { formatDistanceToNow } from "@/lib/utils/date-format";
import { Layers, ChevronDown, ChevronUp, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceActivityViewProps {
  events: ActivityProjection[];
  onSelectEvent: (event: ActivityProjection) => void;
  className?: string;
}

export function ResourceActivityView({
  events,
  onSelectEvent,
  className,
}: ResourceActivityViewProps) {
  const [expandedResourceId, setExpandedResourceId] = React.useState<string | null>(null);

  // Group events by distinct resource
  const resourceGroups = React.useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        type: string;
        name: string;
        ref: string;
        events: ActivityProjection[];
        contributors: Set<string>;
        latestAt: string;
      }
    >();

    events.forEach((e) => {
      const key = `${e.resource.type}:${e.resource.id}`;
      const existing = map.get(key) || {
        id: e.resource.id,
        type: e.resource.type,
        name: e.resource.name,
        ref: e.resource.ref,
        events: [],
        contributors: new Set<string>(),
        latestAt: e.occurredAt,
      };

      existing.events.push(e);
      existing.contributors.add(e.actor.name);
      if (new Date(e.occurredAt) > new Date(existing.latestAt)) {
        existing.latestAt = e.occurredAt;
      }
      map.set(key, existing);
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime()
    );
  }, [events]);

  if (resourceGroups.length === 0) {
    return (
      <div className="p-12 text-center border border-border/60 rounded-xl bg-card/30 font-mono text-xs text-muted-foreground">
        No resource activity recorded in this period.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 select-none", className)}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#FA520F] font-bold">
          RESOURCES TOUCHED ({resourceGroups.length})
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          Click row to expand Operational Story
        </span>
      </div>

      <div className="space-y-3">
        {resourceGroups.map((res) => {
          const isExpanded = expandedResourceId === res.id;
          const relativeTime = formatDistanceToNow(res.latestAt, { addSuffix: true });

          return (
            <div
              key={`${res.type}-${res.id}`}
              className="p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md space-y-3 hover:border-[#FA520F]/50 transition-colors"
            >
              <div
                onClick={() => setExpandedResourceId(isExpanded ? null : res.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-foreground/10 text-[#FA520F] shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase text-[#FA520F] font-bold">
                        {res.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-muted-foreground/30">•</span>
                      <span className="text-xs font-mono text-muted-foreground font-semibold">
                        {res.ref}
                      </span>
                    </div>
                    <h3 className="text-sm font-sans font-bold text-foreground truncate mt-0.5">
                      {res.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground self-end sm:self-auto">
                  <span>
                    <strong className="text-foreground">{res.events.length}</strong> events
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-foreground">{res.contributors.size}</strong> contributors
                  </span>
                  <span>•</span>
                  <span>{relativeTime}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Expandable Operational Story */}
              {isExpanded && (
                <div className="pt-2 border-t border-border/50">
                  <OperationalStory
                    resourceTitle={res.name}
                    resourceType={res.type}
                    events={res.events}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
