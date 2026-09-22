"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ActivityProjection } from "@/lib/supabase/types/activity";
import { Users, Filter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PeopleActivityViewProps {
  events: ActivityProjection[];
  onFilterByActor: (actorId: string) => void;
  className?: string;
}

export function PeopleActivityView({
  events,
  onFilterByActor,
  className,
}: PeopleActivityViewProps) {
  const peopleGroups = React.useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        initials: string;
        role?: string;
        events: ActivityProjection[];
        resources: Set<string>;
        categories: Set<string>;
        latestAt: string;
      }
    >();

    events.forEach((e) => {
      const actorId = e.actor.id;
      const existing = map.get(actorId) || {
        id: actorId,
        name: e.actor.name,
        initials: e.actor.initials,
        role: e.actor.role,
        events: [],
        resources: new Set<string>(),
        categories: new Set<string>(),
        latestAt: e.occurredAt,
      };

      existing.events.push(e);
      existing.resources.add(e.resource.name);
      existing.categories.add(e.category);
      if (new Date(e.occurredAt) > new Date(existing.latestAt)) {
        existing.latestAt = e.occurredAt;
      }
      map.set(actorId, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.events.length - a.events.length);
  }, [events]);

  if (peopleGroups.length === 0) {
    return (
      <div className="p-12 text-center border border-border/60 rounded-xl bg-card/30 font-mono text-xs text-muted-foreground">
        No contributor activity recorded in this period.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 select-none", className)}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#FA520F] font-bold">
          COLLABORATION DIRECTORY ({peopleGroups.length} CONTRIBUTORS)
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          Operational Distribution • No Employee Ranking
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {peopleGroups.map((person) => {
          const latestEvent = person.events[0];
          return (
            <div
              key={person.id}
              className="p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-muted border border-border/80 flex items-center justify-center text-xs font-mono font-bold text-foreground shrink-0">
                    {person.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground font-sans truncate">
                      {person.name}
                    </h4>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      {person.role || "Organization Member"}
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] font-mono border-border/80 shrink-0">
                  {person.events.length} {person.events.length === 1 ? "event" : "events"}
                </Badge>
              </div>

              {/* Categories Touched */}
              <div className="space-y-1 text-xs font-mono">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold block">
                  Domains Touched:
                </span>
                <div className="flex flex-wrap gap-1">
                  {Array.from(person.categories).map((cat) => (
                    <span
                      key={cat}
                      className="px-1.5 py-0.5 rounded bg-muted/60 border border-border/50 text-[10px] uppercase font-bold text-foreground/80"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Latest Action */}
              {latestEvent && (
                <p className="text-[11px] text-muted-foreground font-sans line-clamp-1 border-t border-border/40 pt-2">
                  Last active: <span className="font-semibold text-foreground/80">{latestEvent.verb}</span>{" "}
                  <span className="font-mono">{latestEvent.resource.name}</span>
                </p>
              )}

              {/* Filter CTA */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterByActor(person.id)}
                className="w-full h-7 text-xs font-mono gap-1.5 border-border/70 text-foreground hover:bg-muted/40 justify-between"
              >
                <span>Filter Stream for {person.name.split(" ")[0]}</span>
                <Filter className="w-3 h-3 text-[#FA520F]" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
