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
import { AlertTriangle, PauseCircle, PlayCircle } from "lucide-react";

interface PauseQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrName: string;
  slug: string;
  isPaused: boolean;
  onConfirm: () => Promise<void>;
}

export function PauseQrDialog({
  open,
  onOpenChange,
  qrName,
  slug,
  isPaused,
  onConfirm,
}: PauseQrDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleAction = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Handled by toast
    } finally {
      setLoading(false);
    }
  };

  const actionText = isPaused ? "Resume" : "Pause";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isPaused ? (
              <PlayCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <PauseCircle className="w-5 h-5 text-amber-500" />
            )}
            <span>{actionText} Dynamic QR?</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1 font-mono">
              <div className="text-foreground font-semibold">{qrName}</div>
              <div className="text-muted-foreground">Identity: /{slug}</div>
              <div className="text-muted-foreground">Current State: {isPaused ? "PAUSED" : "ACTIVE"}</div>
            </div>

            <p>
              {isPaused ? (
                <span>
                  Resuming this QR code will restore active destination redirects at the edge immediately.
                </span>
              ) : (
                <span>
                  Future scans will return the configured paused response until this QR is resumed. The printed QR will remain permanently valid.
                </span>
              )}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={loading}
            className={isPaused ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"}
          >
            {loading ? "Updating Edge..." : `${actionText} QR`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
