"use client";

import * as React from "react";
import type { ThreadSummary } from "@/lib/supabase/types/comments";
import { ParticipantPreview } from "./participant-preview";
import { cn } from "@/lib/utils";
import { Check, MessageSquare } from "lucide-react";

interface DiscussionRowProps {
  thread: ThreadSummary;
  isSelected: boolean;
  onSelect: (thread: ThreadSummary) => void;
  index: number;
}

export function DiscussionRow({
  thread,
  isSelected,
  onSelect,
  index,
}: DiscussionRowProps) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const formatRelativeTime = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const isResolved = thread.state === "RESOLVED";

  return (
    <div
      onClick={() => onSelect(thread)}
      className={cn(
        "group relative p-3 sm:p-4 rounded-xl border text-left cursor-pointer transition-all duration-150 select-none",
        isSelected
          ? "border-[#CC785C]/60 bg-[#CC785C]/5 shadow-xs"
          : thread.isUnread
          ? "border-border/90 bg-card hover:bg-muted/40"
          : "border-border/60 bg-card/50 hover:bg-muted/30"
      )}
    >
      {/* Top Bar: Index + Domain / Context + Unread/State */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-muted-foreground/60">{pad(index + 1)}</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="uppercase tracking-wider font-semibold text-muted-foreground">
            {thread.contextType}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-foreground font-mono font-medium truncate max-w-[120px]">
            {thread.contextRef}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {thread.isMentioned && (
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#CC785C]/15 text-[#CC785C] font-semibold">
              @YOU
            </span>
          )}

          {thread.isUnread && (
            <div
              className="h-2 w-2 rounded-full bg-[#CC785C] ring-2 ring-background"
              title="Unread discussion"
            />
          )}

          {isResolved ? (
            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3 stroke-[2.5]" />
              <span className="uppercase font-semibold">RESOLVED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#D4A017]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#D4A017]" />
              <span className="uppercase font-semibold">OPEN</span>
            </div>
          )}
        </div>
      </div>

      {/* Thread Title */}
      <div className="space-y-1 mb-2">
        <h3
          className={cn(
            "text-xs sm:text-sm font-sans tracking-tight line-clamp-1",
            thread.isUnread ? "font-bold text-foreground" : "font-semibold text-foreground/90"
          )}
        >
          {thread.title}
        </h3>

        {/* Latest comment snippet */}
        {thread.latestComment && (
          <p className="text-[11px] text-muted-foreground line-clamp-1 font-sans">
            <span className="font-medium text-foreground/80">
              {thread.latestComment.authorName}:
            </span>{" "}
            &quot;{thread.latestComment.snippet}&quot;
          </p>
        )}
      </div>

      {/* Footer: Participants + Comments count + Time */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
        <ParticipantPreview participants={thread.participants} />

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-muted-foreground/70" />
            <span>{pad(thread.commentCount)}</span>
          </div>
          <span className="text-muted-foreground/40">•</span>
          <span>{formatRelativeTime(thread.lastActivityAt)}</span>
        </div>
      </div>
    </div>
  );
}
