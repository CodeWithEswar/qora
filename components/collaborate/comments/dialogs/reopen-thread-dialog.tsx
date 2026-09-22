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
import { RotateCcw } from "lucide-react";
import type { ThreadDetail } from "@/lib/supabase/types/comments";

interface ReopenThreadDialogProps {
  thread: ThreadDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReopen: (threadPublicId: string) => Promise<boolean>;
}

export function ReopenThreadDialog({
  thread,
  open,
  onOpenChange,
  onReopen,
}: ReopenThreadDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!thread) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await onReopen(thread.publicId);
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
            <RotateCcw className="w-4 h-4 text-[#CC785C]" />
            <span>Reopen Discussion</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-sans space-y-1 pt-1">
            <span className="font-semibold text-foreground block font-mono">
              {thread.title}
            </span>
            <span>
              This discussion will return to Open status, allowing participants to add new operational comments.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="pt-3">
          <DialogFooter className="gap-2">
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
              disabled={isSubmitting}
              className="h-8 text-xs font-mono bg-[#CC785C] hover:bg-[#CC785C]/90 text-white"
            >
              {isSubmitting ? "Reopening…" : "Reopen Discussion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
