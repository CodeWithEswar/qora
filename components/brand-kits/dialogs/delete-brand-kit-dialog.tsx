"use client";

import * as React from "react";
import { BrandKitSummaryV1 } from "@nxtqr/contracts";
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
import { AlertTriangle, Trash2, ShieldCheck } from "lucide-react";

interface DeleteBrandKitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kit: BrandKitSummaryV1 | null;
  onConfirmDelete: (kitId: string) => Promise<void>;
}

export function DeleteBrandKitDialog({
  isOpen,
  onClose,
  kit,
  onConfirmDelete,
}: DeleteBrandKitDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!kit) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete(kit.id);
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <AlertDialogTitle className="text-base font-bold font-display">
            DELETE BRAND KIT PERMANENTLY?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs space-y-2">
            <div>
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">{kit.name}</strong>?
            </div>

            {/* Strict Cascade Safety Explanation */}
            <div className="p-3 rounded-lg border border-border/80 bg-surface/80 space-y-1 text-left mt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero Data Loss Protection</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your <strong className="text-foreground">{kit.qrCount} QR codes</strong> and destination experiences will <strong className="text-foreground">NEVER</strong> be deleted. Their brand identity link will safely default to workspace baseline.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-0 mt-2">
          <AlertDialogCancel
            disabled={isDeleting}
            className="text-xs h-8 cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isDeleting}
            className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white font-medium cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>{isDeleting ? "Deleting..." : "Delete Brand Kit"}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
