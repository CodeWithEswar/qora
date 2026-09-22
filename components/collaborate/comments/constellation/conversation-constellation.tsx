"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ThreadSummary, ConstellationLens } from "@/lib/supabase/types/comments";
import { Network, Users, Layers, MessageSquare, Check, ArrowUpRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ConversationConstellationProps {
  threads: ThreadSummary[];
  selectedThreadId?: string;
  onSelectThread: (thread: ThreadSummary) => void;
  className?: string;
}

export function ConversationConstellation({
  threads,
  selectedThreadId,
  onSelectThread,
  className,
}: ConversationConstellationProps) {
  const [lens, setLens] = React.useState<ConstellationLens>("threads");
  const [hoveredPersonId, setHoveredPersonId] = React.useState<string | null>(null);
  const [hoveredThreadId, setHoveredThreadId] = React.useState<string | null>(null);
  const [hoveredResourceId, setHoveredResourceId] = React.useState<string | null>(null);

  // 1. Deterministic aggregation of people across threads
  const people = React.useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; email: string; initials: string; threadIds: string[]; role?: string }
    >();
    threads.forEach((t) => {
      // Creator
      if (t.createdBy?.id) {
        const existing = map.get(t.createdBy.id) || {
          id: t.createdBy.id,
          name: t.createdBy.name,
          email: t.createdBy.email || "",
          initials: t.createdBy.initials || "??",
          threadIds: [],
        };
        if (!existing.threadIds.includes(t.id)) existing.threadIds.push(t.id);
        map.set(t.createdBy.id, existing);
      }
      // Participants
      t.participants.forEach((p) => {
        const existing = map.get(p.id) || {
          id: p.id,
          name: p.name,
          email: p.email || "",
          initials: p.initials || "??",
          threadIds: [],
        };
        if (!existing.threadIds.includes(t.id)) existing.threadIds.push(t.id);
        map.set(p.id, existing);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.threadIds.length - a.threadIds.length);
  }, [threads]);

  // 2. Deterministic aggregation of resources
  const resources = React.useMemo(() => {
    const map = new Map<
      string,
      { id: string; type: string; title: string; ref: string; threadIds: string[]; openCount: number }
    >();
    threads.forEach((t) => {
      const key = `${t.contextType}:${t.contextRef}`;
      const existing = map.get(key) || {
        id: key,
        type: t.contextType,
        title: t.contextTitle || t.contextRef,
        ref: t.contextRef,
        threadIds: [],
        openCount: 0,
      };
      existing.threadIds.push(t.id);
      if (t.state === "OPEN") existing.openCount++;
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.threadIds.length - a.threadIds.length);
  }, [threads]);

  // 3. Deterministic aggregation of revisions & contexts
  const revisions = React.useMemo(() => {
    const list: Array<{
      id: string;
      label: string;
      sublabel: string;
      threadId: string;
      status: string;
    }> = [];
    threads.forEach((t) => {
      const rev = t.contextMetadata?.revision || (t.contextRef.includes("REV") ? t.contextRef : null);
      list.push({
        id: `rev-${t.id}`,
        label: rev ? `Revision ${rev}` : `${t.contextType.toUpperCase()} Anchor`,
        sublabel: t.contextState || (t.state === "RESOLVED" ? "Resolved" : "Active"),
        threadId: t.id,
        status: t.state,
      });
    });
    return list;
  }, [threads]);

  // Check if a person is connected to currently hovered/selected item
  const isPersonHighlighted = (personId: string) => {
    if (hoveredPersonId === personId) return true;
    if (hoveredThreadId) {
      const thread = threads.find((t) => t.id === hoveredThreadId);
      return thread?.participants.some((p) => p.id === personId) || thread?.createdBy.id === personId;
    }
    if (hoveredResourceId) {
      const res = resources.find((r) => r.id === hoveredResourceId);
      return threads
        .filter((t) => res?.threadIds.includes(t.id))
        .some((t) => t.participants.some((p) => p.id === personId) || t.createdBy.id === personId);
    }
    if (selectedThreadId) {
      const thread = threads.find((t) => t.id === selectedThreadId);
      return thread?.participants.some((p) => p.id === personId) || thread?.createdBy.id === personId;
    }
    return false;
  };

  const isThreadHighlighted = (threadId: string) => {
    if (hoveredThreadId === threadId || selectedThreadId === threadId) return true;
    if (hoveredPersonId) {
      const person = people.find((p) => p.id === hoveredPersonId);
      return Boolean(person?.threadIds.includes(threadId));
    }
    if (hoveredResourceId) {
      const res = resources.find((r) => r.id === hoveredResourceId);
      return Boolean(res?.threadIds.includes(threadId));
    }
    return false;
  };

  const isResourceHighlighted = (resId: string) => {
    if (hoveredResourceId === resId) return true;
    const res = resources.find((r) => r.id === resId);
    if (!res) return false;
    if (hoveredThreadId) return res.threadIds.includes(hoveredThreadId);
    if (selectedThreadId) return res.threadIds.includes(selectedThreadId);
    if (hoveredPersonId) {
      return res.threadIds.some((tid) => {
        const t = threads.find((thr) => thr.id === tid);
        return t?.participants.some((p) => p.id === hoveredPersonId) || t?.createdBy.id === hoveredPersonId;
      });
    }
    return false;
  };

  return (
    <div
      className={cn(
        "flex flex-col border border-border/80 bg-card/50 backdrop-blur-md rounded-xl overflow-hidden shadow-sm",
        className
      )}
    >
      {/* 01 Constellation Header & Mode Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-border/70 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FA520F]/10 border border-[#FA520F]/20 flex items-center justify-center text-[#FA520F]">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Conversation Constellation
              </h2>
              <Badge variant="outline" className="text-[9px] font-mono uppercase px-1.5 py-0 h-4 border-border/80">
                Deterministic Field
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              Structured relationship graph: People ➔ Discussions ➔ Resources ➔ Revisions
            </p>
          </div>
        </div>

        {/* Lens Switcher: Threads | Resources | People */}
        <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-lg border border-border/70">
          <button
            type="button"
            onClick={() => setLens("threads")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-md transition-colors",
              lens === "threads"
                ? "bg-muted text-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Threads</span>
          </button>
          <button
            type="button"
            onClick={() => setLens("resources")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-md transition-colors",
              lens === "resources"
                ? "bg-muted text-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="w-3 h-3" />
            <span>Resources</span>
          </button>
          <button
            type="button"
            onClick={() => setLens("people")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-md transition-colors",
              lens === "people"
                ? "bg-muted text-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-3 h-3" />
            <span>People</span>
          </button>
        </div>
      </div>

      {/* 02 The Structured Geometry Topology Canvas */}
      <div className="relative p-5 overflow-x-auto min-w-[780px]">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-xs font-mono text-muted-foreground">
            <span>No discussion topology available yet. Start discussions to populate the constellation.</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6 relative">
            {/* Column 1: PEOPLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  01 / People ({people.length})
                </span>
              </div>
              <div className="space-y-2">
                {people.map((p) => {
                  const highlighted = isPersonHighlighted(p.id);
                  return (
                    <div
                      key={p.id}
                      onMouseEnter={() => setHoveredPersonId(p.id)}
                      onMouseLeave={() => setHoveredPersonId(null)}
                      className={cn(
                        "group p-2.5 rounded-lg border text-left transition-all duration-150 cursor-pointer select-none",
                        highlighted
                          ? "border-[#FA520F] bg-[#FA520F]/10 ring-1 ring-[#FA520F]/40 shadow-xs"
                          : "border-border/60 bg-card/60 hover:border-border hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0",
                            highlighted
                              ? "bg-[#FA520F] text-white"
                              : "bg-muted text-foreground border border-border/80"
                          )}
                        >
                          {p.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-sans font-semibold text-foreground truncate">{p.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground truncate">
                            {p.threadIds.length} {p.threadIds.length === 1 ? "thread" : "threads"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 2: DISCUSSIONS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  02 / Discussions ({threads.length})
                </span>
              </div>
              <div className="space-y-2">
                {threads.map((t) => {
                  const isSelected = selectedThreadId === t.id;
                  const highlighted = isThreadHighlighted(t.id);
                  const isResolved = t.state === "RESOLVED";
                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectThread(t)}
                      onMouseEnter={() => setHoveredThreadId(t.id)}
                      onMouseLeave={() => setHoveredThreadId(null)}
                      className={cn(
                        "group p-2.5 rounded-lg border text-left transition-all duration-150 cursor-pointer select-none",
                        isSelected
                          ? "border-[#FA520F] bg-[#FA520F]/15 ring-2 ring-[#FA520F]/40 shadow-xs"
                          : highlighted
                          ? "border-[#FA520F]/80 bg-[#FA520F]/5 ring-1 ring-[#FA520F]/30"
                          : "border-border/60 bg-card/60 hover:border-border hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono font-bold text-foreground">
                          {t.publicId}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] font-mono">
                          {isResolved ? (
                            <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> RES
                            </span>
                          ) : (
                            <span className="text-[#FFB83E] font-semibold">● OPEN</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-sans font-semibold text-foreground line-clamp-1 mb-1">
                        {t.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                        <span>{t.commentCount} replies</span>
                        <span className="group-hover:text-foreground flex items-center gap-0.5">
                          Open <ArrowUpRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 3: WORK / RESOURCES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  03 / Resources ({resources.length})
                </span>
              </div>
              <div className="space-y-2">
                {resources.map((r) => {
                  const highlighted = isResourceHighlighted(r.id);
                  return (
                    <div
                      key={r.id}
                      onMouseEnter={() => setHoveredResourceId(r.id)}
                      onMouseLeave={() => setHoveredResourceId(null)}
                      className={cn(
                        "group p-2.5 rounded-lg border text-left transition-all duration-150 cursor-pointer select-none",
                        highlighted
                          ? "border-[#FA520F] bg-[#FA520F]/10 ring-1 ring-[#FA520F]/40 shadow-xs"
                          : "border-border/60 bg-card/60 hover:border-border hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 text-[9px] font-mono mb-1">
                        <span className="uppercase text-[#FA520F] font-bold">{r.type}</span>
                        <span className="text-muted-foreground font-mono">{r.ref}</span>
                      </div>
                      <p className="text-xs font-sans font-semibold text-foreground truncate">
                        {r.title}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-1">
                        {r.threadIds.length} connected discussions
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 4: REVISION / CONTEXT ANCHOR */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  04 / Context & Revisions
                </span>
              </div>
              <div className="space-y-2">
                {revisions.map((rev) => {
                  const isConnected = isThreadHighlighted(rev.threadId);
                  return (
                    <div
                      key={rev.id}
                      className={cn(
                        "p-2.5 rounded-lg border text-left transition-all duration-150 font-mono text-xs select-none",
                        isConnected
                          ? "border-[#FA520F]/80 bg-[#FA520F]/5 text-foreground ring-1 ring-[#FA520F]/30"
                          : "border-border/60 bg-card/40 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-bold text-foreground">{rev.label}</span>
                        <Badge
                          variant="outline"
                          className="text-[8px] uppercase px-1 py-0 h-3.5 border-border/80"
                        >
                          {rev.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-sans truncate">{rev.sublabel}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 03 Constellation Topology Summary Rail */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 border-t border-border/70 bg-muted/20 text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Active Connections: <strong className="text-foreground">{threads.length}</strong></span>
          <span>•</span>
          <span>Participants: <strong className="text-foreground">{people.length}</strong></span>
          <span>•</span>
          <span>Resources Anchored: <strong className="text-foreground">{resources.length}</strong></span>
        </div>
        <div className="text-[10px] text-muted-foreground/80 uppercase tracking-wider">
          Deterministic Structured Geometry • Zero Random Physics
        </div>
      </div>
    </div>
  );
}
