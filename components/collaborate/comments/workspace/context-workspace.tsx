"use client";

import * as React from "react";
import { ContextAnchor } from "./context-anchor";
import { ContextRelationshipRail } from "./context-relationship-rail";
import { DiscussionTopology } from "./discussion-topology";
import { CommentRail } from "../thread/comment-rail";
import { CommentComposer } from "../composer/comment-composer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Info,
  CheckCircle2,
  RotateCcw,
  Link2,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import type {
  ThreadDetail,
  CommentDTO,
  CommentReferenceItem,
} from "@/lib/supabase/types/comments";
import type { MentionMemberItem } from "../composer/mention-popover";
import { toast } from "sonner";

interface ContextWorkspaceProps {
  thread: ThreadDetail | null;
  isLoading?: boolean;
  onBackToRegistry?: () => void; // Mobile view back button
  onOpenDetails: () => void;
  onOpenResolve: () => void;
  onOpenReopen: () => void;
  onEditComment: (comment: CommentDTO) => void;
  onDeleteComment: (comment: CommentDTO) => void;
  onSubmitComment: (payload: {
    body: string;
    parentCommentId?: string;
    mentions?: string[];
    references?: Array<{
      referencedType: string;
      referencedId: string;
      referencedRef: string;
      referencedTitle?: string;
      referencedState?: string;
    }>;
    attachments?: Array<{
      name: string;
      fileType: string;
      mimeType: string;
      sizeBytes: number;
      storagePath: string;
    }>;
  }) => Promise<boolean>;
  members?: MentionMemberItem[];
  className?: string;
}

export function ContextWorkspace({
  thread,
  isLoading = false,
  onBackToRegistry,
  onOpenDetails,
  onOpenResolve,
  onOpenReopen,
  onEditComment,
  onDeleteComment,
  onSubmitComment,
  members = [],
  className = "",
}: ContextWorkspaceProps) {
  const [replyTo, setReplyTo] = React.useState<CommentDTO | null>(null);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center h-[520px] font-mono text-xs text-muted-foreground border border-border/50 rounded-xl bg-card/30 ${className}`}>
        <div className="space-y-3 max-w-sm">
          <div className="flex justify-center items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#CC785C] animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-foreground">
              Loading Contextual Workspace…
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-sans">
            Connecting operational thread to authoritative domain object.
          </p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center h-[520px] font-mono text-xs text-muted-foreground border border-dashed border-border/70 rounded-xl bg-card/20 ${className}`}>
        <div className="space-y-2 max-w-sm">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-foreground">
            No Discussion Selected
          </span>
          <p className="text-xs text-muted-foreground font-sans">
            Select an operational conversation from the registry on the left to inspect its context, thread rail, and participants.
          </p>
        </div>
      </div>
    );
  }

  const isResolved = thread.state === "RESOLVED";

  const handleCopyThreadLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("thread", thread.publicId);
    navigator.clipboard.writeText(url.toString());
    toast.success(`Copied deep link for thread ${thread.publicId}`);
  };

  return (
    <div
      className={`flex flex-col h-full bg-card/40 border border-border/60 rounded-xl shadow-xs overflow-hidden ${className}`}
    >
      {/* 01 Workspace Header */}
      <div className="px-4 py-3.5 border-b border-border/60 bg-background/95 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onBackToRegistry && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToRegistry}
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 md:hidden"
              title="Back to discussions"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#CC785C]">
                {thread.contextType.replace("_", " ")}
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span className="text-xs font-mono font-bold text-foreground">
                {thread.contextRef}
              </span>
              <Badge
                variant="outline"
                className={`text-[9px] font-mono px-1.5 py-0 h-4 uppercase ${
                  isResolved
                    ? "border-[#5DB872]/40 text-[#5DB872] bg-[#5DB872]/10"
                    : "border-[#CC785C]/40 text-[#CC785C] bg-[#CC785C]/10"
                }`}
              >
                ● {thread.state}
              </Badge>
            </div>
            <h2 className="text-sm font-sans font-bold text-foreground truncate mt-0.5">
              {thread.title}
            </h2>
          </div>
        </div>

        {/* Right actions: Info & More */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenDetails}
            className="h-8 px-2.5 text-xs font-mono text-muted-foreground hover:text-foreground gap-1.5"
            title="Inspect Thread & Context details"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Details</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="sr-only">Thread options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs font-mono">
              <DropdownMenuItem onClick={handleCopyThreadLink} className="gap-2">
                <Link2 className="w-3.5 h-3.5" />
                <span>Copy thread link</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenDetails} className="gap-2">
                <Info className="w-3.5 h-3.5" />
                <span>View full details</span>
              </DropdownMenuItem>

              {thread.contextUrl && (
                <DropdownMenuItem asChild className="gap-2">
                  <a href={thread.contextUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open context object</span>
                  </a>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {!isResolved && thread.availableActions.canResolve && (
                <DropdownMenuItem
                  onClick={onOpenResolve}
                  className="gap-2 text-[#5DB872] focus:text-[#5DB872]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolve discussion</span>
                </DropdownMenuItem>
              )}

              {isResolved && thread.availableActions.canReopen && (
                <DropdownMenuItem
                  onClick={onOpenReopen}
                  className="gap-2 text-[#CC785C] focus:text-[#CC785C]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen discussion</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 02 Signature Relationship Rail */}
      <div className="px-4 py-2 border-b border-border/40 bg-muted/10">
        <ContextRelationshipRail
          contextType={thread.contextType}
          contextRef={thread.contextRef}
          peopleCount={thread.participants.length}
          commentCount={thread.commentCount}
        />
      </div>

      {/* 03 Scrollable Discussion Thread Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Context Object Banner */}
        <ContextAnchor
          contextType={thread.contextType}
          contextRef={thread.contextRef}
          contextTitle={thread.contextTitle}
          contextState={thread.contextState || "ACTIVE"}
          contextUrl={thread.contextUrl}
        />

        {/* Continuous Operational Comment Rail */}
        <CommentRail
          thread={thread}
          onReply={(comment) => setReplyTo(comment)}
          onEdit={onEditComment}
          onDelete={onDeleteComment}
          onReopen={onOpenReopen}
          className="pt-2"
        />
      </div>

      {/* 04 Sticky Bottom Composer */}
      <div className="p-3 border-t border-border/60 bg-background/95 backdrop-blur-xs shrink-0">
        <CommentComposer
          threadPublicId={thread.publicId}
          isThreadResolved={isResolved}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onSubmitComment={onSubmitComment}
          members={members}
          canComment={thread.availableActions.canComment}
        />
      </div>
    </div>
  );
}
