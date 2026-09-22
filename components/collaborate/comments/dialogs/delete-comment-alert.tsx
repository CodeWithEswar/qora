"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CommentDTO } from "@/lib/supabase/types/comments";

interface DeleteCommentAlertProps {
  comment: CommentDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (commentPublicId: string) => Promise<boolean>;
}

export function DeleteCommentAlert({
  comment,
  open,
  onOpenChange,
  onConfirmDelete,
}: DeleteCommentAlertProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!comment) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await onConfirmDelete(comment.publicId);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-background border-border text-xs font-mono">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm font-bold text-foreground">
            Delete Comment?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground font-sans space-y-1 pt-1">
            <span>
              This comment will no longer appear in the discussion. The historical thread record retains a tombstone for operational audit integrity.
            </span>
            <span className="block italic p-2 bg-muted/30 rounded border border-border/40 text-[11px] font-sans truncate">
              &ldquo;{comment.body}&rdquo;
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 pt-2">
          <AlertDialogCancel className="h-8 text-xs font-mono">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="h-8 text-xs font-mono bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting…" : "Delete Comment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
