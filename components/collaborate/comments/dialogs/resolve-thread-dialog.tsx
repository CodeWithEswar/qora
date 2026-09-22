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
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import type { ThreadDetail } from "@/lib/supabase/types/comments";

interface ResolveThreadDialogProps {
  thread: ThreadDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (threadPublicId: string, note?: string) => Promise<boolean>;
}

export function ResolveThreadDialog({
  thread,
  open,
  onOpenChange,
  onResolve,
}: ResolveThreadDialogProps) {
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!thread) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await onResolve(thread.publicId, note.trim() || undefined);
      if (success) {
        setNote("");
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
            <CheckCircle2 className="w-4 h-4 text-[#5DB872]" />
            <span>Resolve Discussion</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-sans space-y-1 pt-1">
            <span className="font-semibold text-foreground block font-mono">
              {thread.title}
            </span>
            <span>
              Resolving closes this discussion to indicate that no further action is currently required.
              Existing comments remain available and searchable.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-mono text-muted-foreground uppercase">
              Resolution Note (optional)
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Replacement verified and order approved."
              rows={3}
              className="text-xs font-sans resize-none"
            />
          </div>

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
              disabled={isSubmitting}
              className="h-8 text-xs font-mono bg-[#5DB872] hover:bg-[#5DB872]/90 text-white gap-1.5"
            >
              {isSubmitting ? "Resolving…" : "Resolve Discussion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
