"use client";

import * as React from "react";
import { formatDistanceToNow, formatDateTime } from "@/lib/utils/date-format";
import { MoreHorizontal, Reply, Link2, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ReplyReference } from "./reply-reference";
import { CommentReferenceCard } from "./comment-reference-card";
import { CommentAttachmentPreview } from "./comment-attachment-preview";
import type { CommentDTO } from "@/lib/supabase/types/comments";
import { toast } from "sonner";

interface CommentItemProps {
  comment: CommentDTO;
  onReply: (comment: CommentDTO) => void;
  onEdit: (comment: CommentDTO) => void;
  onDelete: (comment: CommentDTO) => void;
  onScrollToComment?: (commentId: string) => void;
  className?: string;
}

export function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onScrollToComment,
  className = "",
}: CommentItemProps) {
  const isDeleted = Boolean(comment.deletedAt || comment.isDeleted);
  const formattedRelative = formatDistanceToNow(comment.createdAt, {
    addSuffix: true,
  });
  const formattedFull = formatDateTime(comment.createdAt);

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("comment", comment.publicId);
    navigator.clipboard.writeText(url.toString());
    toast.success("Comment link copied to clipboard");
  };

  // Render mentions highlighted in body
  const renderBody = (text: string) => {
    if (isDeleted) {
      return (
        <span className="italic text-muted-foreground/60 text-xs font-mono">
          Comment removed by participant or moderator.
        </span>
      );
    }

    // Split on mentions @name or word boundaries
    const parts = text.split(/(@[A-Za-z0-9_\s]{2,20}(?=\s|$|[.,!?]))/g);

    return (
      <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap break-words font-sans">
        {parts.map((part, index) => {
          if (part.startsWith("@")) {
            return (
              <span
                key={index}
                className="inline-block px-1 py-0.2 mx-0.5 rounded text-[11px] font-mono font-medium text-[#CC785C] bg-[#CC785C]/10 border border-[#CC785C]/20"
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </p>
    );
  };

  return (
    <article
      id={`comment-${comment.id}`}
      data-public-id={comment.publicId}
      className={`relative pl-8 py-3.5 group transition-colors ${className}`}
      aria-label={`Comment by ${comment.author.name}`}
    >
      {/* Rail Node: Avatar / Initials directly on the vertical rail line */}
      <div
        className="absolute left-[13px] top-4 w-6 h-6 -ml-3 rounded-full bg-[#181715] dark:bg-muted text-white dark:text-foreground text-[9px] font-mono font-bold flex items-center justify-center ring-4 ring-background shadow-xs select-none"
        title={comment.author.name}
      >
        {comment.author.initials || "VS"}
      </div>

      <div className="space-y-1.5">
        {/* Author Header & Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-foreground font-sans">
              {comment.author.name}
            </span>
            {comment.author.role && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground uppercase">
                {comment.author.role}
              </span>
            )}
            <span className="text-muted-foreground/30">•</span>
            <time
              dateTime={comment.createdAt}
              title={formattedFull}
              className="text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-default"
            >
              {formattedRelative}
            </time>
            {comment.editedAt && (
              <span
                title={formatDateTime(comment.editedAt)}
                className="text-[9px] font-mono text-muted-foreground/70 italic"
              >
                (edited)
              </span>
            )}
          </div>

          {/* Action Menu (Visible on hover/focus) */}
          {!isDeleted && (
            <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center gap-0.5">
              {comment.availableActions.canReply && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => onReply(comment)}
                  title="Reply"
                >
                  <Reply className="h-3 w-3" />
                  <span className="sr-only">Reply</span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                    <span className="sr-only">Comment options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 text-xs font-mono">
                  {comment.availableActions.canReply && (
                    <DropdownMenuItem onClick={() => onReply(comment)} className="gap-2">
                      <Reply className="h-3.5 w-3.5" />
                      <span>Reply</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
                    <Link2 className="h-3.5 w-3.5" />
                    <span>Copy link</span>
                  </DropdownMenuItem>
                  {(comment.availableActions.canEdit || comment.availableActions.canDelete) && (
                    <DropdownMenuSeparator />
                  )}
                  {comment.availableActions.canEdit && (
                    <DropdownMenuItem onClick={() => onEdit(comment)} className="gap-2">
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                  )}
                  {comment.availableActions.canDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(comment)}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Replying to Context */}
        {comment.replyTo && (
          <ReplyReference
            replyTo={comment.replyTo}
            onScrollToParent={onScrollToComment}
            className="mb-1.5"
          />
        )}

        {/* Comment Body */}
        <div className="pt-0.5">{renderBody(comment.body)}</div>

        {/* Object References */}
        {comment.references.length > 0 && !isDeleted && (
          <div className="pt-2 space-y-1.5">
            <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground block">
              Referenced Objects
            </span>
            <div className="flex flex-col gap-1.5">
              {comment.references.map((ref) => (
                <CommentReferenceCard key={ref.id} reference={ref} />
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {comment.attachments.length > 0 && !isDeleted && (
          <div className="pt-2 space-y-1.5">
            <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground block">
              Attachments
            </span>
            <div className="flex flex-wrap gap-2">
              {comment.attachments.map((att) => (
                <CommentAttachmentPreview key={att.id} attachment={att} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
