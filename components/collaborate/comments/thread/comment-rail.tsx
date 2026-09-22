"use client";

import * as React from "react";
import { CommentItem } from "./comment-item";
import { ResolutionMarker } from "../workspace/resolution-marker";
import type { CommentDTO, ThreadDetail } from "@/lib/supabase/types/comments";

interface CommentRailProps {
  thread: ThreadDetail;
  onReply: (comment: CommentDTO) => void;
  onEdit: (comment: CommentDTO) => void;
  onDelete: (comment: CommentDTO) => void;
  onReopen?: () => void;
  className?: string;
}

export function CommentRail({
  thread,
  onReply,
  onEdit,
  onDelete,
  onReopen,
  className = "",
}: CommentRailProps) {
  const isResolved = thread.state === "RESOLVED";

  const handleScrollToComment = (commentId: string) => {
    const el = document.getElementById(`comment-${commentId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-[#CC785C]/10");
      setTimeout(() => {
        el.classList.remove("bg-[#CC785C]/10");
      }, 1800);
    }
  };

  return (
    <div className={`relative ${className}`} role="feed" aria-label="Comment Discussion Rail">
      {/* Signature Vertical Rail Line */}
      <div
        className="absolute left-[13px] top-3 bottom-4 w-[1px] bg-border/80 pointer-events-none"
        aria-hidden="true"
      />

      {/* Discussion Origin Node */}
      <div className="relative pl-8 pb-3 text-xs font-mono text-muted-foreground flex items-center gap-2">
        <div
          className="absolute left-[13px] top-1 w-2 h-2 -ml-1 rounded-full bg-[#CC785C] ring-4 ring-background"
          aria-hidden="true"
        />
        <div className="space-y-0.5">
          <span className="text-[10px] tracking-wider uppercase font-semibold text-foreground/70">
            Discussion Started
          </span>
          <p className="text-[11px] text-muted-foreground font-sans">
            Created by {thread.createdBy.name}
          </p>
        </div>
      </div>

      {/* Comment List */}
      {thread.comments.length === 0 ? (
        <div className="relative pl-8 py-6 text-xs text-muted-foreground font-mono">
          No comments yet. Start the conversation below.
        </div>
      ) : (
        thread.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onScrollToComment={handleScrollToComment}
          />
        ))
      )}

      {/* Resolution Event Marker */}
      {isResolved && (
        <ResolutionMarker
          resolvedBy={thread.resolvedBy}
          resolvedAt={thread.resolvedAt}
          resolutionNote={thread.resolutionNote}
          canReopen={thread.availableActions.canReopen}
          onReopen={onReopen}
        />
      )}
    </div>
  );
}
