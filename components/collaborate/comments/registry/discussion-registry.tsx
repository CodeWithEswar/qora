"use client";

import * as React from "react";
import type { ThreadSummary } from "@/lib/supabase/types/comments";
import { DiscussionRow } from "./discussion-row";
import { MessageSquareOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscussionRegistryProps {
  threads: ThreadSummary[];
  selectedThreadId?: string;
  onSelectThread: (thread: ThreadSummary) => void;
  onClearFilters?: () => void;
  hasFilters?: boolean;
}

export function DiscussionRegistry({
  threads,
  selectedThreadId,
  onSelectThread,
  onClearFilters,
  hasFilters = false,
}: DiscussionRegistryProps) {
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border/80 bg-card/30 min-h-[300px]">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
          <MessageSquareOff className="h-5 w-5" />
        </div>
        <div className="space-y-1 max-w-xs mb-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {hasFilters ? "COMMENTS / NO MATCH" : "COMMENTS / QUIET"}
          </div>
          <h3 className="text-xs font-semibold text-foreground">
            {hasFilters
              ? "No discussions match your filter criteria."
              : "No operational discussions have been started yet."}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {hasFilters
              ? "Try clearing filters to see all available collaboration threads."
              : "Conversations will appear here when attached to a real NXTQR object."}
          </p>
        </div>
        {hasFilters && onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="text-xs h-7">
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread, index) => (
        <DiscussionRow
          key={thread.id}
          thread={thread}
          isSelected={selectedThreadId === thread.id}
          onSelect={onSelectThread}
          index={index}
        />
      ))}
    </div>
  );
}
