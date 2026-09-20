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
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { SaaSTier } from "@nxtqr/contracts";

interface DowngradePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: SaaSTier;
  targetTier: SaaSTier;
  onConfirm: () => Promise<void>;
}

export function DowngradePreviewDialog({
  open,
  onOpenChange,
  currentTier,
  targetTier,
  onConfirm,
}: DowngradePreviewDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Downgrade Impact Preview
            </span>
          </div>
          <DialogTitle className="text-lg">
            Switch from {currentTier} to {targetTier}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground mt-1">
            Review how your workspace capabilities and assets will be affected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3 text-xs">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">
                Non-Destructive Policy
              </p>
              <p className="text-muted-foreground leading-relaxed">
                NXTQR never deletes your QR codes, campaigns, or scan data. All
                existing published QRs will continue resolving normally at the edge.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-card p-3 space-y-2">
            <h4 className="font-medium text-foreground">What happens next:</h4>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Existing dynamic QRs remain active and readable.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  If you exceed {targetTier} quotas, new QR creation will pause.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  Advanced features (e.g. multi-step approvals) become view-only.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : `Confirm Downgrade to ${targetTier}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
