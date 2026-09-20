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
import { AlertTriangle } from "lucide-react";

interface DeleteQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrName: string;
  slug: string;
  onConfirm: () => Promise<void>;
}

export function DeleteQrDialog({
  open,
  onOpenChange,
  qrName,
  slug,
  onConfirm,
}: DeleteQrDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleAction = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Handled by caller toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <span>Archive Dynamic QR?</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 space-y-1 font-mono text-destructive">
              <div className="font-semibold">{qrName}</div>
              <div>Identity: /{slug}</div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              <strong>Warning for Printed Media</strong>: Archiving this QR will deactivate its edge resolver snapshot. Future physical scans of the printed QR code will fail to resolve (returning HTTP 410 Gone).
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Archiving..." : "Archive QR"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
