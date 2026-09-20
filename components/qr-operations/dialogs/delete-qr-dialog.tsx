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

export interface DeleteQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrName: string;
  isActive: boolean;
  onConfirm: () => Promise<void>;
}

export function DeleteQrDialog({
  open,
  onOpenChange,
  qrName,
  isActive,
  onConfirm,
}: DeleteQrDialogProps) {
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
          <AlertDialogTitle className="font-serif text-lg tracking-tight text-red-600 dark:text-red-500">
            Permanently delete QR code?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            You are deleting <strong className="text-foreground">{qrName}</strong>.
            {isActive && (
              <span className="block mt-1.5 text-amber-600 dark:text-amber-500 font-medium">
                This QR is currently published. Any printed materials or public links pointing to
                this QR will immediately return a 404 error.
              </span>
            )}
            <span className="block mt-1">
              This action permanently purges this QR asset, draft records, and destination configurations.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isSubmitting} className="text-xs h-8">
            Cancel
          </AlertDialogCancel>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleAction}
            disabled={isSubmitting}
            className="text-xs h-8 bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
