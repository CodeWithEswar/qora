"use client";

import * as React from "react";
import { AlertTriangle, ArrowRight, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SlugChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSlug: string;
  newSlug: string;
  onConfirm: () => Promise<void>;
  isSaving: boolean;
}

export function SlugChangeDialog({
  open,
  onOpenChange,
  currentSlug,
  newSlug,
  onConfirm,
  isSaving,
}: SlugChangeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/80 p-6 shadow-xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <DialogTitle className="text-base font-bold font-display text-foreground">
              Change Workspace URL Slug?
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Modifying your organization slug changes the direct URL path used to access your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* URL Comparison Card */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-surface/50 space-y-2 font-mono text-[11px]">
            <div>
              <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">
                Current Workspace URL
              </span>
              <span className="text-muted-foreground line-through">
                https://nxtqr.vercel.app/{currentSlug}
              </span>
            </div>

            <div className="pt-1 border-t border-border/40">
              <span className="text-primary block text-[9px] uppercase tracking-wider font-semibold">
                New Workspace URL
              </span>
              <span className="text-foreground font-bold">
                https://nxtqr.vercel.app/{newSlug}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-muted-foreground leading-relaxed text-[11px]">
            <p>
              • <strong>Dashboard Navigation:</strong> Team members will immediately need to use the new slug to access workspace views.
            </p>
            <p>
              • <strong>Printed QR Stability:</strong> Existing dynamic QR codes that resolve through vanity domains or short paths are preserved.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isSaving}
            className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            <span>{isSaving ? "Updating URL..." : "Confirm & Update URL"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
