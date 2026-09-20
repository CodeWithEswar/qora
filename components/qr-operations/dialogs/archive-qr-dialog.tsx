"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface ArchiveQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrName: string;
  onConfirm: () => Promise<void>;
}

export function ArchiveQrDialog({
  open,
  onOpenChange,
  qrName,
  onConfirm,
}: ArchiveQrDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md bg-white dark:bg-[#161616] border border-border/80">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-lg tracking-tight">
            Archive QR code?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Archiving <strong className="text-foreground">{qrName}</strong> removes it from your
            active operations list while preserving historical scan analytics and draft revisions.
            Archived QRs cease live resolution until unarchived.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isSubmitting} className="text-xs h-8">
            Cancel
          </AlertDialogCancel>
          <Button
            size="sm"
            onClick={handleAction}
            disabled={isSubmitting}
            className="bg-neutral-800 hover:bg-neutral-900 text-white dark:bg-neutral-700 dark:hover:bg-neutral-600 text-xs h-8"
          >
            {isSubmitting ? "Archiving..." : "Archive QR"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
