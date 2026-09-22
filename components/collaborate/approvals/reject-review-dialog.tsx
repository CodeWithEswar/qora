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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STANDARDIZED_REJECTION_REASONS } from "@/lib/supabase/types/approvals";
import type { ApprovalDetail } from "@/lib/supabase/types/approvals";
import { XCircle, Loader2 } from "lucide-react";

interface RejectReviewDialogProps {
  approval: ApprovalDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reasonCode: string, note?: string) => Promise<void>;
}

export function RejectReviewDialog({
  approval,
  isOpen,
  onClose,
  onConfirm,
}: RejectReviewDialogProps) {
  const [reasonCode, setReasonCode] = React.useState<string>("INSUFFICIENT_EVIDENCE");
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!approval) return null;

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(reasonCode, note.trim() || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md font-mono text-xs">
        <DialogHeader>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            DECISION / REJECT
          </div>
          <DialogTitle className="text-base font-sans font-semibold text-foreground">
            Reject Request {approval.publicId}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            The requester will be notified of this rejection and the reason will be committed to the immutable audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Reason code selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase font-medium">
              Standardized Rejection Reason
            </label>
            <Select value={reasonCode} onValueChange={setReasonCode} disabled={isSubmitting}>
              <SelectTrigger className="text-xs font-mono">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                {STANDARDIZED_REJECTION_REASONS.map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rejection Note */}
          <div className="space-y-1.5">
            <label htmlFor="rejection-note" className="text-[10px] text-muted-foreground uppercase font-medium">
              Operational Explanation Note
            </label>
            <Textarea
              id="rejection-note"
              placeholder="State why this consequential request could not be authorized..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
              className="text-xs h-20 resize-none font-mono"
            />
          </div>
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
            onClick={handleReject}
            disabled={isSubmitting}
            className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Rejecting...</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject Request</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
