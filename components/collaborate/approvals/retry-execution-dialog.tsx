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
import type { ApprovalDetail } from "@/lib/supabase/types/approvals";
import { RotateCw, AlertTriangle, Loader2 } from "lucide-react";

interface RetryExecutionDialogProps {
  approval: ApprovalDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function RetryExecutionDialog({
  approval,
  isOpen,
  onClose,
  onConfirm,
}: RetryExecutionDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!approval) return null;

  const handleRetry = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md font-mono text-xs">
        <DialogHeader>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>RETRY EXECUTION</span>
          </div>
          <DialogTitle className="text-base font-sans font-semibold text-foreground">
            Retry operation execution for {approval.publicId}?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            This request was already approved by {approval.decidedBy?.name || "an authorized reviewer"}. The executor will re-attempt applying the authorized domain change.
          </DialogDescription>
        </DialogHeader>

        {approval.executionError && (
          <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs">
            <span className="font-semibold block mb-0.5">Previous failure reason:</span>
            <span>{approval.executionError}</span>
          </div>
        )}

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
            onClick={handleRetry}
            disabled={isSubmitting}
            className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Re-executing...</span>
              </>
            ) : (
              <>
                <RotateCw className="w-3.5 h-3.5" />
                <span>Retry Operation</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
