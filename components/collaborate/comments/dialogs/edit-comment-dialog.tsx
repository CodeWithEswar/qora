"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import type { CommentDTO } from "@/lib/supabase/types/comments";

interface EditCommentDialogProps {
  comment: CommentDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (commentPublicId: string, newBody: string) => Promise<boolean>;
}

export function EditCommentDialog({
  comment,
  open,
  onOpenChange,
  onSave,
}: EditCommentDialogProps) {
  const [body, setBody] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (comment) {
      setBody(comment.body);
    }
  }, [comment]);

  if (!comment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await onSave(comment.publicId, body.trim());
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border text-xs font-mono">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <Pencil className="w-4 h-4 text-[#CC785C]" />
            <span>Edit Comment</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-sans">
            Updated comment will be marked as edited. The operational record remains intact.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="text-xs font-sans resize-none"
            placeholder="Edit your operational note..."
            required
          />

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs font-mono"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!body.trim() || isSubmitting}
              className="h-8 text-xs font-mono bg-[#CC785C] hover:bg-[#CC785C]/90 text-white"
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
