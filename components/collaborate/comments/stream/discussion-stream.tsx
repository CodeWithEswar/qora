"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ThreadSummary, AttentionReason } from "@/lib/supabase/types/comments";
import { ParticipantPreview } from "../registry/participant-preview";
import { MessageSquare, Check, Search, SlidersHorizontal, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DiscussionStreamProps {
  threads: ThreadSummary[];
  selectedThreadId?: string;
  onSelectThread: (thread: ThreadSummary) => void;
  onStartDiscussion?: () => void;
  onOpenFilters?: () => void;
  activeFilterCount?: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentUserId?: string;
  activeView?: string;
  className?: string;
}

export function DiscussionStream({
  threads,
  selectedThreadId,
  onSelectThread,
  onStartDiscussion,
  onOpenFilters,
  activeFilterCount = 0,
  searchQuery,
  onSearchChange,
  currentUserId,
  activeView,
  className,
}: DiscussionStreamProps) {
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

  // Deterministic attention reason for For You view
  const getAttentionReason = (thread: ThreadSummary): { label: string; badgeClass: string } | null => {
    if (thread.isMentioned || thread.mentionedCurrentMember) {
      return {
        label: "MENTIONED YOU",
        badgeClass: "bg-[#FA520F]/15 text-[#FA520F] border-[#FA520F]/30",
      };
    }
    if (thread.contextType === "approval" && thread.state === "OPEN") {
      return {
        label: "REVIEW REQUIRES ATTENTION",
        badgeClass: "bg-[#FFB83E]/15 text-[#FFB83E] border-[#FFB83E]/30",
      };
    }
    if (thread.isCurrentUserParticipant) {
      return {
        label: "YOU PARTICIPATED",
        badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      };
    }
    if (currentUserId && thread.createdBy.id === currentUserId) {
      return {
        label: "CREATED BY YOU",
        badgeClass: "bg-muted text-muted-foreground border-border/80",
      };
    }
    return null;
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card/40 border border-border/70 rounded-xl overflow-hidden shadow-xs select-none",
        className
      )}
      role="region"
      aria-label="Discussion Stream"
    >
      {/* 01 Search & Filter Toolbar */}
      <div className="p-3 border-b border-border/70 bg-background/95 backdrop-blur-xs flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search discussions, resources, members…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs font-mono bg-muted/40 border-border/60 focus-visible:ring-1 focus-visible:ring-[#FA520F]"
          />
        </div>

        {onOpenFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenFilters}
            className={cn(
              "h-8 px-2.5 text-xs font-mono gap-1.5 shrink-0 border-border/70",
              activeFilterCount > 0 && "border-[#FA520F] text-[#FA520F] bg-[#FA520F]/10"
            )}
            title="Filter discussions"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="h-4 w-4 rounded-full bg-[#FA520F] text-white text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}

        {onStartDiscussion && (
          <Button
            type="button"
            size="sm"
            onClick={onStartDiscussion}
            className="h-8 px-2.5 text-xs font-mono gap-1 bg-[#FA520F] text-white hover:bg-[#FA520F]/90 shrink-0"
            title="Start new discussion"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New</span>
          </Button>
        )}
      </div>

      {/* 02 Discussion Row List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-xs font-mono text-muted-foreground space-y-2">
            <span>No discussions found.</span>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange("")}
                className="text-xs font-mono text-[#FA520F]"
              >
                Clear search query
              </Button>
            )}
          </div>
        ) : (
          threads.map((thread, index) => {
            const isSelected = selectedThreadId === thread.id;
            const isResolved = thread.state === "RESOLVED";
            const attention = getAttentionReason(thread);
            const revisionContext = thread.contextMetadata?.revision;

            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={cn(
                  "group relative p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 select-none",
                  isSelected
                    ? "border-[#FA520F] bg-[#FA520F]/10 shadow-xs ring-1 ring-[#FA520F]/30"
                    : thread.isUnread
                    ? "border-border/90 bg-card hover:bg-muted/40"
                    : "border-border/60 bg-card/50 hover:bg-muted/30"
                )}
              >
                {/* Header: Index, Resource Context & Status */}
                <div className="flex items-center justify-between gap-1.5 mb-1 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-muted-foreground/60">{pad(index + 1)} /</span>
                    <span className="uppercase tracking-wider font-bold text-[#FA520F]">
                      {thread.contextType.replace("_", " ")}
                    </span>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="font-semibold text-foreground truncate max-w-[110px]">
                      {thread.contextRef}
                    </span>
                    {revisionContext && (
                      <span className="text-[9px] text-muted-foreground font-mono">
                        (Rev {revisionContext})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {thread.isUnread && (
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-[#FA520F]"
                        title="Unread discussion"
                      />
                    )}
                    {isResolved ? (
                      <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-0.5 text-[9px]">
                        <Check className="w-2.5 h-2.5 stroke-[2.5]" /> RESOLVED
                      </span>
                    ) : (
                      <span className="text-[#FFB83E] font-semibold text-[9px]">
                        ● OPEN
                      </span>
                    )}
                  </div>
                </div>

                {/* Thread Title */}
                <h3
                  className={cn(
                    "text-xs font-sans tracking-tight line-clamp-1 mb-1",
                    thread.isUnread ? "font-bold text-foreground" : "font-semibold text-foreground/90"
                  )}
                >
                  {thread.title}
                </h3>

                {/* Attention Reason Pill (For You or Attention contexts) */}
                {attention && (activeView === "for_you" || activeView === "mentions") && (
                  <div className="mb-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded border",
                        attention.badgeClass
                      )}
                    >
                      {attention.label}
                    </span>
                  </div>
                )}

                {/* Latest Comment Excerpt */}
                {thread.latestComment && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1 font-sans mb-2">
                    <span className="font-semibold text-foreground/80">
                      {thread.latestComment.authorName}:
                    </span>{" "}
                    &ldquo;{thread.latestComment.snippet}&rdquo;
                  </p>
                )}

                {/* Footer: Participants, Replies Count & Last Activity */}
                <div className="flex items-center justify-between pt-1.5 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
                  <ParticipantPreview participants={thread.participants} maxCount={3} />

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-muted-foreground/70" />
                      <span>{pad(thread.commentCount)}</span>
                    </div>
                    <span>•</span>
                    <span>{formatRelativeTime(thread.lastActivityAt)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
