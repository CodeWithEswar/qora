"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ThreadDetail, CommentDTO } from "@/lib/supabase/types/comments";
import type { MentionMemberItem } from "../composer/mention-popover";
import { ContextAnchor } from "./context-anchor";
import { CommentItem } from "../thread/comment-item";
import { CommentComposer } from "../composer/comment-composer";
import { ResolutionMarker } from "./resolution-marker";
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
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface ThreadWorkspaceProps {
  thread: ThreadDetail | null;
  isLoading?: boolean;
  onBackToStream?: () => void;
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

export function ThreadWorkspace({
  thread,
  isLoading = false,
  onBackToStream,
  onOpenDetails,
  onOpenResolve,
  onOpenReopen,
  onEditComment,
  onDeleteComment,
  onSubmitComment,
  members = [],
  className,
}: ThreadWorkspaceProps) {
  const [replyTo, setReplyTo] = React.useState<CommentDTO | null>(null);

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-12 text-center h-[560px] font-mono text-xs text-muted-foreground border border-border/70 rounded-xl bg-card/40",
          className
        )}
      >
        <div className="space-y-3 max-w-sm">
          <div className="flex justify-center items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#FA520F] animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-foreground">
              Loading Thread Workspace…
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-sans">
            Connecting conversation to authoritative resource graph.
          </p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-12 text-center h-[560px] font-mono text-xs text-muted-foreground border border-dashed border-border/70 rounded-xl bg-card/20",
          className
        )}
      >
        <div className="space-y-2 max-w-sm">
          <span className="text-[11px] uppercase tracking-wider font-bold text-foreground">
            No Discussion Selected
          </span>
          <p className="text-xs text-muted-foreground font-sans">
            Select a discussion from the stream on the left to inspect its context spine, participants, and resolution gate.
          </p>
        </div>
      </div>
    );
  }

  const isResolved = thread.state === "RESOLVED";

  // Build Discussion Pulse (sequence of distinct participants in order of contribution)
  const discussionPulse = React.useMemo(() => {
    const sequence: Array<{ name: string; initials: string; id: string }> = [];
    // 1. Thread creator
    if (thread.createdBy) {
      sequence.push({
        id: thread.createdBy.id,
        name: thread.createdBy.name,
        initials: thread.createdBy.initials || "??",
      });
    }
    // 2. Subsequent commentators in chronological order
    thread.comments.forEach((c) => {
      const last = sequence[sequence.length - 1];
      if (!last || last.id !== c.author.id) {
        sequence.push({
          id: c.author.id,
          name: c.author.name,
          initials: c.author.initials || "??",
        });
      }
    });
    return sequence;
  }, [thread]);

  const handleCopyThreadLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("thread", thread.publicId);
    navigator.clipboard.writeText(url.toString());
    toast.success(`Copied thread link: ${thread.publicId}`);
  };

  const rootComment = thread.comments[0] || null;
  const subsequentComments = thread.comments.slice(1);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card/40 border border-border/70 rounded-xl shadow-xs overflow-hidden",
        className
      )}
    >
      {/* 01 Workspace Header */}
      <div className="px-4 py-3 border-b border-border/70 bg-background/95 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onBackToStream && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onBackToStream}
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 md:hidden"
              title="Back to discussion stream"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FA520F]">
                {thread.contextType.replace("_", " ")}
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span className="text-xs font-mono font-bold text-foreground">
                {thread.contextRef}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] font-mono px-1.5 py-0 h-4 uppercase",
                  isResolved
                    ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                    : "border-[#FFB83E]/40 text-[#FFB83E] bg-[#FFB83E]/10"
                )}
              >
                ● {thread.state}
              </Badge>
            </div>
            <h2 className="text-sm font-sans font-bold text-foreground truncate mt-0.5">
              {thread.title}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenDetails}
            className="h-8 px-2.5 text-xs font-mono text-muted-foreground hover:text-foreground gap-1.5"
            title="Inspect full context & relationships"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Context</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="sr-only">Discussion options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs font-mono">
              <DropdownMenuItem onClick={handleCopyThreadLink} className="gap-2">
                <Link2 className="w-3.5 h-3.5" />
                <span>Copy thread link</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenDetails} className="gap-2">
                <Info className="w-3.5 h-3.5" />
                <span>View context rail</span>
              </DropdownMenuItem>
              {thread.contextUrl && (
                <DropdownMenuItem asChild className="gap-2">
                  <a href={thread.contextUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open resource</span>
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {!isResolved && thread.availableActions.canResolve && (
                <DropdownMenuItem
                  onClick={onOpenResolve}
                  className="gap-2 text-emerald-500 focus:text-emerald-500"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolve discussion</span>
                </DropdownMenuItem>
              )}
              {isResolved && thread.availableActions.canReopen && (
                <DropdownMenuItem
                  onClick={onOpenReopen}
                  className="gap-2 text-[#FA520F] focus:text-[#FA520F]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen discussion</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 02 Signature Discussion Pulse (Sequence of Participation) */}
      {discussionPulse.length > 1 && (
        <div className="px-4 py-2 border-b border-border/50 bg-muted/20 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-mono select-none">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-bold shrink-0">
            Discussion Pulse:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {discussionPulse.map((p, idx) => (
              <React.Fragment key={`${p.id}-${idx}`}>
                {idx > 0 && <ArrowRight className="w-2.5 h-2.5 text-muted-foreground/40 shrink-0" />}
                <div
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/60 border border-border/60 text-[10px] shrink-0"
                  title={p.name}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-foreground/10 flex items-center justify-center text-[8px] font-bold">
                    {p.initials}
                  </span>
                  <span className="font-sans font-medium text-foreground truncate max-w-[80px]">
                    {p.name.split(" ")[0]}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 03 Scrollable Discussion Surface with Context Spine */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Context Anchor Card */}
        <ContextAnchor
          contextType={thread.contextType}
          contextRef={thread.contextRef}
          contextTitle={thread.contextTitle}
          contextState={thread.contextState || "ACTIVE"}
          contextUrl={thread.contextUrl}
        />

        {/* The Architectural Context Spine */}
        <div className="relative pl-2">
          {/* Spine vertical rail line */}
          <div
            className="absolute left-[21px] top-4 bottom-4 w-px bg-border/80 pointer-events-none"
            aria-hidden="true"
          />

          {/* Thread Origin */}
          <div className="relative pl-10 pb-4 text-xs font-mono text-muted-foreground flex items-center gap-2">
            <div
              className="absolute left-[21px] top-1.5 w-2 h-2 -ml-1 rounded-full bg-[#FA520F] ring-4 ring-background"
              aria-hidden="true"
            />
            <div className="space-y-0.5">
              <span className="text-[10px] tracking-wider uppercase font-bold text-foreground/80">
                Discussion Anchored
              </span>
              <p className="text-[11px] text-muted-foreground font-sans">
                Started by {thread.createdBy.name}
              </p>
            </div>
          </div>

          {/* Root Comment (Stronger Visual Prominence) */}
          {rootComment && (
            <div className="relative pl-2 mb-3">
              <CommentItem
                comment={rootComment}
                onReply={(c) => setReplyTo(c)}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
                className="bg-card/70 border border-border/70 rounded-xl p-4 shadow-2xs"
              />
            </div>
          )}

          {/* Subsequent Branching Comments */}
          {subsequentComments.map((comment) => (
            <div key={comment.id} className="relative pl-2">
              <CommentItem
                comment={comment}
                onReply={(c) => setReplyTo(c)}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
              />
            </div>
          ))}

          {/* Resolution Gate (Signature feature 38) */}
          {isResolved && (
            <div className="relative pl-10 pt-4">
              <div
                className="absolute left-[21px] top-5 w-2.5 h-2.5 -ml-1.25 rounded-full bg-emerald-500 ring-4 ring-background flex items-center justify-center text-white"
                aria-hidden="true"
              />
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>RESOLUTION GATE</span>
                  </div>
                  {thread.availableActions.canReopen && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onOpenReopen}
                      className="h-6 px-2 text-[10px] font-mono text-muted-foreground hover:text-foreground gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reopen</span>
                    </Button>
                  )}
                </div>

                <p className="text-xs font-sans text-foreground">
                  Resolved by <strong className="font-semibold">{thread.resolvedBy?.name || "Admin"}</strong>
                  {thread.resolvedAt && (
                    <span className="text-muted-foreground text-[11px] ml-1">
                      on {new Date(thread.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </p>

                {thread.resolutionNote && (
                  <p className="text-[11px] text-muted-foreground/90 font-sans italic border-l-2 border-emerald-500/40 pl-2 mt-1">
                    &ldquo;{thread.resolutionNote}&rdquo;
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 04 Pinned Contextual Composer */}
      <div className="p-3 border-t border-border/70 bg-background/95 backdrop-blur-xs shrink-0">
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
