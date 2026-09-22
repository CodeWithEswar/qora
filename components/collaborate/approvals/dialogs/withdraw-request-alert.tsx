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
import type { ApprovalDetail, ApprovalSummary } from "@/lib/supabase/types/approvals";
import { Ban, Loader2 } from "lucide-react";

interface WithdrawRequestAlertProps {
  approval: ApprovalDetail | ApprovalSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function WithdrawRequestAlert({
  approval,
  isOpen,
  onClose,
  onConfirm,
}: WithdrawRequestAlertProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!approval) return null;

  const handleWithdraw = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <AlertDialogContent className="font-mono text-xs max-w-md">
        <AlertDialogHeader>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 font-semibold">
            <Ban className="w-3 h-3 text-rose-500" />
            GOVERNANCE / WITHDRAW REQUEST
          </div>
          <AlertDialogTitle className="text-base font-sans font-semibold text-foreground">
            Withdraw approval request {approval.publicId}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground space-y-2">
            <p>
              This action will withdraw the review request for Revision {approval.targetRevisionNumber} of <span className="font-semibold text-foreground">{approval.title}</span>.
            </p>
            <p className="p-2.5 rounded bg-muted/60 border border-border/70 text-[11px] text-foreground/80">
              The pending review will close, but the revision history remains intact as immutable audit evidence. The published live resource will not be affected.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/50">
          <AlertDialogCancel disabled={isSubmitting} className="text-xs font-mono">
            Keep in review
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleWithdraw}
            disabled={isSubmitting}
            className="text-xs font-mono bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Withdrawing...
              </>
            ) : (
              "Withdraw request"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
