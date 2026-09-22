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
import { DecisionLens } from "./decision-lens";
import type { ApprovalDetail } from "@/lib/supabase/types/approvals";
import { ShieldCheck, Loader2 } from "lucide-react";

interface ApproveReviewDialogProps {
  approval: ApprovalDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => Promise<void>;
}

export function ApproveReviewDialog({
  approval,
  isOpen,
  onClose,
  onConfirm,
}: ApproveReviewDialogProps) {
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!approval) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(note.trim() || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-xl font-mono text-xs">
        <DialogHeader>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            DECISION / APPROVE
          </div>
          <DialogTitle className="text-base font-sans font-semibold text-foreground">
            Approve {approval.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Reference: {approval.publicId} · This will authorize the server to execute the requested consequential operation.
          </DialogDescription>
        </DialogHeader>

        {/* Structured Decision Lens */}
        <div className="py-2">
          <DecisionLens
            requestTitle={approval.title}
            requesterName={approval.requestedBy.name}
            changesSummary={`${approval.changeDiff.beforeValue} ➔ ${approval.changeDiff.proposedValue}`}
            affectedSummary={approval.affectedEntityRef}
            nextSteps="The registered domain operation will be applied immediately by server runners."
          />
        </div>

        {/* Decision Note */}
        <div className="space-y-1.5">
          <label htmlFor="decision-note" className="text-[10px] text-muted-foreground uppercase font-medium">
            Decision Note (Optional)
          </label>
          <Textarea
            id="decision-note"
            placeholder="Record any administrative or governance remarks for the immutable audit trail..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isSubmitting}
            className="text-xs h-20 resize-none font-mono"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApprove}
            disabled={isSubmitting}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Committing Decision...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Confirm &amp; Authorize</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
