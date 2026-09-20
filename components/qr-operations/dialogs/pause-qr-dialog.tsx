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
import { Button } from "@/components/ui/button";

export interface PauseQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrName: string;
  isPaused: boolean;
  onConfirm: () => Promise<void>;
}

export function PauseQrDialog({
  open,
  onOpenChange,
  qrName,
  isPaused,
  onConfirm,
}: PauseQrDialogProps) {
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
            {isPaused ? "Resume QR routing?" : "Pause this QR code?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {isPaused ? (
              <>
                Resuming <strong className="text-foreground">{qrName}</strong> will reactivate its
                routing logic and allow inbound scans to reach their designated destinations.
              </>
            ) : (
              <>
                Pausing <strong className="text-foreground">{qrName}</strong> will temporarily suspend
                its destination resolver. Scanners will see a safe maintenance screen until resumed.
              </>
            )}
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
            className={
              isPaused
                ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                : "bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
            }
          >
            {isSubmitting ? "Updating..." : isPaused ? "Resume QR" : "Pause QR"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
