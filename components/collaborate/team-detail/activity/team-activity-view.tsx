"use client";

import * as React from "react";
import { Activity, Search, Calendar, User, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { TeamDetail } from "@/lib/supabase/types/teams";

interface TeamActivityViewProps {
  team: TeamDetail;
}

export function TeamActivityView({ team }: TeamActivityViewProps) {
  const [search, setSearch] = React.useState("");

  const events = team.recentActivity || [];

  const filteredEvents = React.useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter((e) => {
      const actorStr = String(e.metadata?.actorEmail || e.metadata?.actorId || "");
      return (
        e.action.toLowerCase().includes(q) ||
        actorStr.toLowerCase().includes(q) ||
        (e.resourceType && e.resourceType.toLowerCase().includes(q))
      );
    });
  }, [events, search]);

  const formatActionTitle = (action: string) => {
    switch (action) {
      case "team.created":
        return "Team created in workspace";
      case "team.member.added":
        return "Member added to team";
      case "team.member.removed":
        return "Member removed from team";
      case "team.resource.connected":
        return "Resource connected to team";
      case "team.resource.disconnected":
        return "Resource disconnected from team";
      case "team.updated":
        return "Team settings modified";
      default:
        return action.replace(/_/g, " ").replace(/\./g, " ").toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="pb-5 border-b border-border/70">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
          <span>TEAM</span>
          <span>/</span>
          <span>{team.name}</span>
          <span>/</span>
          <span className="text-primary font-bold">ACTIVITY</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Team Activity History
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xl">
          Authoritative operational history of memberships, connected work assignments, and settings changes for {team.name}.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 p-2.5 rounded-md bg-surface border border-border/70">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search activity events or actors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-8 bg-background border-border/60 rounded-md"
          />
        </div>
        <div className="text-[11px] font-mono text-muted-foreground">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      </div>

      {/* Events Timeline */}
      {events.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-lg bg-surface/50 border border-dashed border-border/80 space-y-3">
          <div className="w-12 h-12 rounded-md bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <History className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              NO TEAM ACTIVITY RECORDED
            </h4>
            <p className="text-xs text-muted-foreground">
              Operational events such as adding members or connecting resources will record here automatically.
            </p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground font-mono bg-surface/30 rounded-md border border-border/50">
          No activity matches &quot;{search}&quot;.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 border-l border-border/80 ml-3">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="relative group">
              <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-surface border-2 border-primary/70 group-hover:border-primary transition-colors flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-primary" />
              </div>

              <div className="p-3.5 rounded-md bg-surface border border-border/60 hover:border-border transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-foreground">
                    {formatActionTitle(evt.action)}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formatDate(evt.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{evt.metadata?.actorEmail || evt.metadata?.actorId || "System"}</span>
                  </span>
                  <span className="text-border">|</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-muted">
                    {evt.action}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
