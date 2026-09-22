"use client";

import * as React from "react";
import { Paperclip, Bookmark, Send, X, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MentionPopover, type MentionMemberItem } from "./mention-popover";
import { ReferenceDialog } from "./reference-dialog";
import type {
  CommentDTO,
  CommentReferenceItem,
  CommentAttachmentItem,
} from "@/lib/supabase/types/comments";
import { toast } from "sonner";

interface CommentComposerProps {
  threadPublicId: string;
  isThreadResolved: boolean;
  replyTo: CommentDTO | null;
  onCancelReply: () => void;
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
  canComment?: boolean;
  className?: string;
}

export function CommentComposer({
  threadPublicId,
  isThreadResolved,
  replyTo,
  onCancelReply,
  onSubmitComment,
  members = [],
  canComment = true,
  className = "",
}: CommentComposerProps) {
  const [body, setBody] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isRefDialogOpen, setIsRefDialogOpen] = React.useState(false);
  const [selectedReferences, setSelectedReferences] = React.useState<
    Array<Omit<CommentReferenceItem, "id">>
  >([]);
  const [pendingAttachments, setPendingAttachments] = React.useState<
    Array<{
      name: string;
      fileType: string;
      mimeType: string;
      sizeBytes: number;
      storagePath: string;
    }>
  >([]);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus textarea on reply
  React.useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  const handleSelectMember = (member: MentionMemberItem) => {
    setBody((prev) => {
      const mentionTag = `@${member.name} `;
      return prev ? `${prev} ${mentionTag}` : mentionTag;
    });
    textareaRef.current?.focus();
  };

  const handleAddReference = (ref: Omit<CommentReferenceItem, "id">) => {
    setSelectedReferences((prev) => [...prev, ref]);
    toast.success(`Attached reference ${ref.referencedRef}`);
  };

  const handleRemoveReference = (index: number) => {
    setSelectedReferences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const newAttachments = fileList.map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        name: file.name,
        fileType: isImage ? "image" : "document",
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        storagePath: `attachments/${Date.now()}-${file.name}`,
      };
    });

    setPendingAttachments((prev) => [...prev, ...newAttachments]);
    toast.success(`Added ${newAttachments.length} file(s) to attach`);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!body.trim() || isSubmitting) return;

    // Extract mention ids if they match names
    const mentionsFound: string[] = [];
    members.forEach((m) => {
      if (body.includes(`@${m.name}`)) {
        mentionsFound.push(m.id);
      }
    });

    setIsSubmitting(true);
    try {
      const success = await onSubmitComment({
        body: body.trim(),
        parentCommentId: replyTo?.id,
        mentions: mentionsFound,
        references: selectedReferences.map((r) => ({
          referencedType: r.referencedType || r.type || "qr_code",
          referencedId: r.referencedId || r.idRef || "",
          referencedRef: r.referencedRef || r.publicRef || "",
          referencedTitle: r.referencedTitle || r.title,
          referencedState: r.referencedState || r.state || undefined,
        })),
        attachments: pendingAttachments,
      });

      if (success) {
        setBody("");
        setSelectedReferences([]);
        setPendingAttachments([]);
        if (replyTo) onCancelReply();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isThreadResolved) {
    return (
      <div className={`p-3.5 rounded-lg border border-border/50 bg-muted/20 text-center font-mono text-xs ${className}`}>
        <span className="text-muted-foreground">
          This discussion is <strong className="text-[#5DB872]">RESOLVED</strong>. Reopen the thread to add new comments.
        </span>
      </div>
    );
  }

  if (!canComment) {
    return (
      <div className={`p-3 rounded-lg border border-border/50 bg-muted/10 text-center font-mono text-xs text-muted-foreground ${className}`}>
        You do not have permission to comment on this discussion.
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-border/70 bg-card shadow-2xs overflow-hidden transition-all focus-within:border-[#CC785C]/60 ${className}`}>
      {/* Reply Context Banner */}
      {replyTo && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border/40 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-muted-foreground truncate">
            <CornerDownRight className="w-3.5 h-3.5 text-[#CC785C] shrink-0" />
            <span>Replying to <strong className="text-foreground">{replyTo.author.name}</strong>:</span>
            <span className="truncate max-w-xs font-sans text-[11px]">&ldquo;{replyTo.body}&rdquo;</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-foreground shrink-0"
            onClick={onCancelReply}
            title="Cancel reply"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Selected References Tag Strip */}
      {selectedReferences.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 pt-2">
          {selectedReferences.map((ref, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted border border-border/60 text-foreground"
            >
              <Bookmark className="w-3 h-3 text-[#CC785C]" />
              <span>{ref.referencedRef}</span>
              <button
                type="button"
                onClick={() => handleRemoveReference(idx)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Selected Attachments Tag Strip */}
      {pendingAttachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 pt-2">
          {pendingAttachments.map((att, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted border border-border/60 text-foreground"
            >
              <Paperclip className="w-3 h-3 text-[#5DB8A6]" />
              <span className="truncate max-w-[120px]">{att.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(idx)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Main Textarea */}
      <Textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add context to this discussion… (⌘+Enter to send)"
        rows={3}
        className="w-full resize-none border-0 bg-transparent px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 font-sans"
      />

      {/* Bottom Tool Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border/40 bg-muted/15">
        <div className="flex items-center gap-1">
          {/* Mention Popover */}
          <MentionPopover members={members} onSelectMember={handleSelectMember} />

          {/* Reference Dialog Trigger */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsRefDialogOpen(true)}
            className="h-7 px-2 text-xs font-mono text-muted-foreground hover:text-foreground gap-1"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#5DB8A6]" />
            <span>Reference</span>
          </Button>

          {/* Attach file */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 px-2 text-xs font-mono text-muted-foreground hover:text-foreground gap-1"
          >
            <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Attach</span>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf,text/plain"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/60 hidden sm:inline">
            ⌘+↵
          </span>
          <Button
            size="sm"
            onClick={() => handleSubmit()}
            disabled={!body.trim() || isSubmitting}
            className="h-7 px-3 text-xs font-mono bg-[#CC785C] hover:bg-[#CC785C]/90 text-white gap-1.5 shadow-2xs"
          >
            {isSubmitting ? (
              <span>Posting…</span>
            ) : (
              <>
                <span>Comment</span>
                <Send className="w-3 h-3" />
              </>
            )}
          </Button>
        </div>
      </div>

      <ReferenceDialog
        open={isRefDialogOpen}
        onOpenChange={setIsRefDialogOpen}
        onAddReference={handleAddReference}
      />
    </div>
  );
}
