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
import type { ApprovalDetail, ApprovalSummary } from "@/lib/supabase/types/approvals";
import { RotateCcw, Loader2, AlertCircle } from "lucide-react";

interface RequestChangesDialogProps {
  approval: ApprovalDetail | ApprovalSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void>;
}

export function RequestChangesDialog({
  approval,
  isOpen,
  onClose,
  onConfirm,
}: RequestChangesDialogProps) {
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!approval) return null;

  const targetRev = approval.targetRevisionNumber || 1;

  const handleSubmit = async () => {
    if (!note.trim()) {
      setError("Please describe what revisions or modifications are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(note.trim());
      setNote("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to send change request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-lg font-mono text-xs">
        <DialogHeader>
          <div className="text-[10px] text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
            <RotateCcw className="w-3 h-3" />
            GOVERNANCE / REQUEST CHANGES
          </div>
          <DialogTitle className="text-base font-sans font-semibold text-foreground">
            Request changes on Revision {targetRev}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            This decision will return the request to {approval.requestedBy.name}. The resource will remain in its current published state until a new revision is submitted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="p-3 rounded-lg bg-muted/40 border border-border/70 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resource</span>
              <span className="font-semibold text-foreground">{approval.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Revision</span>
              <span className="font-bold text-foreground">REV {targetRev}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="change-note" className="text-[11px] text-foreground font-semibold flex items-center gap-1">
              Feedback & Required Changes <span className="text-primary">*</span>
            </label>
            <Textarea
              id="change-note"
              placeholder="Detail what needs modification before this revision can be approved..."
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              className="text-xs h-28 resize-none font-mono"
            />
            {error && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-mono"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !note.trim()}
            className="text-xs font-mono bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Send change request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
