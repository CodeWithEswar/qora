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

interface ArchiveDomainAlertProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  domain: CustomDomainSummaryV1 | null;
  onConfirm: (domain: CustomDomainSummaryV1) => Promise<void>;
}

export function ArchiveDomainAlert({
  isOpen,
  onOpenChange,
  domain,
  onConfirm,
}: ArchiveDomainAlertProps) {
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
          <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground border border-border flex items-center justify-center">
            <Icon icon="solar:archive-bold" className="w-5 h-5" />
          </div>
          <AlertDialogTitle className="text-base sm:text-lg font-bold text-foreground">
            Archive Domain?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Archiving <span className="font-mono text-foreground font-semibold">{domain.hostname}</span> pauses new QR code assignments to this hostname.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="p-3.5 rounded-lg border border-border/70 bg-surface/40 text-xs text-muted-foreground space-y-1">
          <p>
            Existing links already deployed will continue resolving until this domain is disconnected or deleted. You can restore an archived domain at any time.
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
            className="bg-muted-foreground hover:bg-foreground text-background text-xs h-9"
          >
            {isSubmitting ? "Archiving..." : "Archive Domain"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
