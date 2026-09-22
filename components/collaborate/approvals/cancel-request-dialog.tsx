"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { ApprovalDetail } from "@/lib/supabase/types/approvals";
import { AlertCircle, Loader2 } from "lucide-react";

interface CancelRequestDialogProps {
  approval: ApprovalDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function CancelRequestDialog({
  approval,
  isOpen,
  onClose,
  onConfirm,
}: CancelRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!approval) return null;

  const handleCancel = async () => {
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
      <AlertDialogContent className="max-w-md font-mono text-xs">
        <AlertDialogHeader>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>CANCEL APPROVAL REQUEST</span>
          </div>
          <AlertDialogTitle className="text-base font-sans font-semibold text-foreground">
            Cancel request {approval.publicId}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            This pending request for &quot;{approval.title}&quot; will be removed from the active decision queue. You can submit a new request later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
          <AlertDialogCancel disabled={isSubmitting} className="text-xs">
            Keep Request
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            disabled={isSubmitting}
            className="text-xs bg-muted-foreground hover:bg-muted-foreground/90 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Cancelling...</span>
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
