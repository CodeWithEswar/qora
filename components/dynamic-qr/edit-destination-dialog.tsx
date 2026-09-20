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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import { isValidDestinationUrl } from "@nxtqr/routing-engine";

export interface EditDestinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDestination: string;
  onSaveDraft: (newDestination: string) => Promise<void>;
  resolverUrl?: string;
}

interface EditDestinationFormContentProps {
  currentDestination: string;
  onSaveDraft: (newDestination: string) => Promise<void>;
  onClose: () => void;
  resolverUrl?: string;
}

function EditDestinationFormContent({
  currentDestination,
  onSaveDraft,
  onClose,
  resolverUrl,
}: EditDestinationFormContentProps) {
  const [newUrl, setNewUrl] = React.useState(currentDestination);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Real URL validation
  const validation = React.useMemo(() => {
    const trimmed = newUrl.trim();
    if (!trimmed) {
      return { valid: false, error: "Destination URL cannot be empty" };
    }
    if (!isValidDestinationUrl(trimmed)) {
      return {
        valid: false,
        error: "URL must begin with https:// or http:// and cannot contain scripts or unsafe schemes.",
      };
    }
    if (resolverUrl && trimmed.toLowerCase() === resolverUrl.toLowerCase()) {
      return {
        valid: false,
        error: "Destination cannot be the QR resolver URL itself (circular loop).",
      };
    }
    return { valid: true };
  }, [newUrl, resolverUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.valid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSaveDraft(newUrl.trim());
      onClose();
    } catch {
      // Handled by caller toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Current Published Destination Info */}
      <div className="p-3 rounded-xl bg-surface-elevated/60 border border-border/80 text-xs">
        <div className="font-mono uppercase tracking-wider text-[10px] text-muted-foreground font-semibold">
          Currently Published
        </div>
        <div className="font-mono text-foreground break-all mt-0.5" title={currentDestination}>
          {currentDestination || "None configured"}
        </div>
      </div>

      {/* New Destination Input */}
      <div className="space-y-2">
        <Label htmlFor="destination-url" className="text-xs font-semibold">
          New Destination URL
        </Label>
        <div className="relative">
          <Input
            id="destination-url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com/new-landing-page"
            className="font-mono text-xs pr-8 bg-surface border-border"
            autoFocus
          />
          {validation.valid ? (
            <Icon
              icon="hugeicons:tick-02"
              className="w-4 h-4 text-emerald-500 absolute right-2.5 top-2.5 pointer-events-none"
            />
          ) : null}
        </div>

        {!validation.valid && (
          <p className="text-[11px] text-destructive flex items-center gap-1">
            <Icon icon="hugeicons:alert-circle" className="w-3.5 h-3.5 shrink-0" />
            <span>{validation.error}</span>
          </p>
        )}
      </div>

      {/* Educational Note */}
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-start gap-2.5">
        <Icon icon="hugeicons:sparkles" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Save draft ≠ Publish</strong>. Saving will commit your working draft. The change will only route live scans once you click <em>Publish Changes</em>.
        </p>
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!validation.valid || isSubmitting}
          className="bg-primary hover:bg-[#CC3A05] text-white text-xs font-semibold"
        >
          {isSubmitting ? "Saving Draft…" : "Save Draft"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditDestinationDialog({
  open,
  onOpenChange,
  currentDestination,
  onSaveDraft,
  resolverUrl,
}: EditDestinationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Icon icon="hugeicons:link-square-02" className="w-5 h-5 text-primary" />
            <span>Change Destination</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update where this Dynamic QR redirects without altering the printed physical code.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <EditDestinationFormContent
            key={`${open}-${currentDestination}`}
            currentDestination={currentDestination}
            onSaveDraft={onSaveDraft}
            onClose={() => onOpenChange(false)}
            resolverUrl={resolverUrl}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
