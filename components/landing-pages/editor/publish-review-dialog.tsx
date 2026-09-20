"use client";

import React, { useState } from "react";
import type { LandingPageDocumentV1 } from "@nxtqr/contracts";
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
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";

interface PublishReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: LandingPageDocumentV1;
  pageId: string;
  pageName: string;
  pageSlug: string;
  draftVersion: number;
  qrCount: number;
  onPublishSuccess: (result: { versionNumber: number; publishedVersionId: string }) => void;
}

export function PublishReviewDialog({
  open,
  onOpenChange,
  document,
  pageId,
  pageName,
  pageSlug,
  draftVersion,
  qrCount,
  onPublishSuccess,
}: PublishReviewDialogProps) {
  const [changeSummary, setChangeSummary] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Pre-flight checks
  const blocks = document.blocks || [];
  const hasBlocks = blocks.length > 0;
  const hasTitle = Boolean(pageName.trim());
  const publicUrl = `https://nxtqr.vercel.app/p/${pageSlug}`;

  const handlePublish = async () => {
    if (!hasBlocks) {
      toast.error("Cannot publish an empty page. Add at least one section.");
      return;
    }

    setIsPublishing(true);
    try {
      toast.loading("Publishing immutable version...", { id: "publish-lp" });

      const res = await fetch(`/api/v1/landing-pages/${pageId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changeSummary: changeSummary.trim() || `Published revision ${draftVersion}`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || "Failed to publish landing page");
      }

      const { data } = await res.json();
      toast.success("Landing page published", {
        id: "publish-lp",
        description: `Version ${data.versionNumber} is now live!`,
      });

      onPublishSuccess(data);
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Publishing failed", {
        id: "publish-lp",
        description: err.message,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NxtqrIcon icon="solar:upload-track-bold" size={20} className="text-[#FA520F]" />
            <span>Review &amp; Publish Destination</span>
          </DialogTitle>
          <DialogDescription>
            Commits your working draft into a tamper-evident immutable version snapshot and points live QR traffic to it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Pre-Flight Checklist */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block font-semibold">
              Pre-flight Checklist
            </span>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <NxtqrIcon
                  icon={hasTitle ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                  size={15}
                  className={hasTitle ? "text-emerald-500" : "text-destructive"}
                />
                <span>Destination Identity</span>
              </span>
              <span className="font-mono text-muted-foreground font-medium">{pageName}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <NxtqrIcon
                  icon={hasBlocks ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                  size={15}
                  className={hasBlocks ? "text-emerald-500" : "text-destructive"}
                />
                <span>Content Composition</span>
              </span>
              <span className="font-mono text-muted-foreground font-medium">{blocks.length} sections</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <NxtqrIcon icon="solar:qr-code-bold" size={15} className="text-primary" />
                <span>Connected QR Impact</span>
              </span>
              <span className="font-mono text-foreground font-bold">
                {qrCount} active QR code{qrCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <NxtqrIcon icon="solar:global-bold" size={15} className="text-blue-500" />
                <span>Live Public Route</span>
              </span>
              <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[200px]">
                /p/{pageSlug}
              </span>
            </div>
          </div>

          {/* Release Notes Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Release Notes / Change Summary <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="e.g. Added contact card & updated autumn promo links"
              className="text-xs h-9"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPublishing}>
            Cancel
          </Button>

          <Button
            onClick={handlePublish}
            disabled={isPublishing || !hasBlocks}
            className="bg-[#FA520F] hover:bg-[#FA520F]/90 text-white font-semibold gap-1.5"
          >
            {isPublishing ? (
              <>
                <NxtqrIcon icon="solar:refresh-linear" size={15} className="animate-spin" />
                <span>Publishing Snapshot...</span>
              </>
            ) : (
              <>
                <NxtqrIcon icon="solar:check-circle-bold" size={15} />
                <span>Publish Live Version</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
