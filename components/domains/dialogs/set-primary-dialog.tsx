"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
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
import { CustomDomainSummaryV1 } from "@nxtqr/contracts";

interface SetPrimaryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  domain: CustomDomainSummaryV1 | null;
  onConfirm: (domain: CustomDomainSummaryV1) => Promise<void>;
}

export function SetPrimaryDialog({
  isOpen,
  onOpenChange,
  domain,
  onConfirm,
}: SetPrimaryDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!domain) return null;

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(domain);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full sm:max-w-md bg-surface border-border">
        <AlertDialogHeader className="text-left space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Icon icon="solar:star-bold" className="w-5 h-5" />
          </div>
          <AlertDialogTitle className="text-base sm:text-lg font-bold text-foreground">
            Set as Primary Domain?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Make <span className="font-mono text-foreground font-semibold">{domain.hostname}</span> the default host for newly generated dynamic QR links.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="p-3.5 rounded-lg border border-border/70 bg-surface/40 text-xs text-muted-foreground space-y-1.5">
          <span className="font-semibold text-foreground block">QR Stability Guarantee:</span>
          <p>
            Changing the primary domain will <strong className="text-foreground">never invalidate or break already-printed QR codes</strong>. Existing links will continue resolving through their originally assigned hostnames.
          </p>
        </div>

        <AlertDialogFooter className="flex-row items-center justify-end gap-2 pt-2">
          <AlertDialogCancel disabled={isSubmitting} className="text-xs h-9 border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleAction();
            }}
            disabled={isSubmitting}
            className="bg-[#FA520F] hover:bg-[#E0480C] text-white text-xs h-9 gap-1.5 cursor-pointer shadow-xs"
          >
            {isSubmitting ? "Updating..." : "Confirm Primary"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
