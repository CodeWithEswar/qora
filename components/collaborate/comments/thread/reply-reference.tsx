"use client";

import * as React from "react";
import { CornerDownRight } from "lucide-react";
import type { ReplyToSnippet } from "@/lib/supabase/types/comments";

interface ReplyReferenceProps {
  replyTo: ReplyToSnippet;
  onScrollToParent?: (commentId: string) => void;
  className?: string;
}

export function ReplyReference({
  replyTo,
  onScrollToParent,
  className = "",
}: ReplyReferenceProps) {
  return (
    <button
      type="button"
      onClick={() => onScrollToParent?.(replyTo.commentId)}
      className={`text-left group flex items-start gap-1.5 px-2 py-1 bg-muted/40 hover:bg-muted/70 border-l-2 border-[#CC785C] rounded-r text-xs transition-colors ${className}`}
      title={`Replying to ${replyTo.authorName}`}
    >
      <CornerDownRight className="w-3 h-3 text-[#CC785C] shrink-0 mt-0.5" />
      <div className="min-w-0">
        <span className="font-mono text-[10px] uppercase font-bold text-foreground/80 group-hover:text-foreground">
          {replyTo.authorName}
        </span>
        <p className="text-[11px] text-muted-foreground truncate max-w-sm font-sans">
          {replyTo.snippet}
        </p>
      </div>
    </button>
  );
}
