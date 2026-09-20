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

export interface PublishChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publishedDestination: string;
  draftDestination: string;
  publishedRevision: number;
  onConfirmPublish: (changeSummary: string) => Promise<void>;
}

interface PublishFormProps {
  publishedDestination: string;
  draftDestination: string;
  publishedRevision: number;
  onConfirmPublish: (changeSummary: string) => Promise<void>;
  onClose: () => void;
}

function PublishForm({
  publishedDestination,
  draftDestination,
  publishedRevision,
  onConfirmPublish,
  onClose,
}: PublishFormProps) {
  const [changeSummary, setChangeSummary] = React.useState("Updated destination URL");
  const [isPublishing, setIsPublishing] = React.useState(false);

  const handlePublish = async () => {
    if (isPublishing) return;
    try {
      setIsPublishing(true);
      await onConfirmPublish(changeSummary.trim() || `Published revision ${publishedRevision + 1}`);
      onClose();
    } catch {
      // Error handled by caller toast
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-4 pt-2 text-xs">
      {/* Structured Diff Comparison */}
      <div className="rounded-xl border border-border/80 bg-surface-elevated/40 overflow-hidden">
        <div className="p-3 border-b border-border/60 bg-surface-elevated/80 font-mono text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center justify-between">
          <span>Destination Resolution Diff</span>
          <span className="text-primary">
            Rev {publishedRevision} → Rev {publishedRevision + 1}
          </span>
        </div>

        <div className="p-4 space-y-3 font-mono">
          <div>
            <div className="text-[10px] uppercase text-muted-foreground mb-1">
              Before (Live Published)
            </div>
            <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive line-through break-all">
              {publishedDestination || "No previous destination"}
            </div>
          </div>

          <div className="flex justify-center my-1 text-muted-foreground">
            <Icon icon="hugeicons:arrow-down-01" className="w-4 h-4" />
          </div>

          <div>
            <div className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
              After (New Published)
            </div>
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold break-all">
              {draftDestination}
            </div>
          </div>
        </div>
      </div>

      {/* Target Infrastructure Confirmation */}
      <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <Icon icon="hugeicons:server-03" className="w-4 h-4 text-amber-500" />
          <span className="font-mono text-muted-foreground">Target Resolver:</span>
          <span className="font-semibold text-foreground">Global Edge Resolvers</span>
        </div>
        <Icon icon="hugeicons:shield-tick" className="w-4 h-4 text-emerald-500" />
      </div>

      {/* Change Log Summary Input */}
      <div className="space-y-1.5 pt-1">
        <Label htmlFor="change-summary" className="text-xs font-semibold">
          Revision Changelog Note
        </Label>
        <Input
          id="change-summary"
          value={changeSummary}
          onChange={(e) => setChangeSummary(e.target.value)}
          placeholder="e.g. Switched destination to autumn campaign"
          className="text-xs bg-surface border-border"
          maxLength={120}
        />
        <p className="text-[10px] text-muted-foreground">
          This creates an immutable checkpoint in version history.
        </p>
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPublishing}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          className="bg-primary hover:bg-[#CC3A05] text-white text-xs font-semibold gap-1.5 shadow-xs"
        >
          {isPublishing ? (
            <>
              <Icon icon="hugeicons:reload" className="w-3.5 h-3.5 animate-spin" />
              <span>Publishing to Edge…</span>
            </>
          ) : (
            <>
              <Icon icon="hugeicons:rocket" className="w-3.5 h-3.5" />
              <span>Confirm & Publish</span>
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function PublishChangesDialog({
  open,
  onOpenChange,
  publishedDestination,
  draftDestination,
  publishedRevision,
  onConfirmPublish,
}: PublishChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Icon icon="hugeicons:rocket" className="w-5 h-5 text-primary" />
            <span>Publish Revision to Edge</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review the changes below. Publishing commits changes and synchronizes the global edge resolver snapshot.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <PublishForm
            key={`${open}-${publishedRevision}`}
            publishedDestination={publishedDestination}
            draftDestination={draftDestination}
            publishedRevision={publishedRevision}
            onConfirmPublish={onConfirmPublish}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
