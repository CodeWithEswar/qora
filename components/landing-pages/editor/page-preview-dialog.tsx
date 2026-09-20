"use client";

import React, { useState } from "react";
import type { LandingPageDocumentV1 } from "@nxtqr/contracts";
import { LandingPageRenderer } from "../renderer/landing-page-renderer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: LandingPageDocumentV1;
  pageSlug: string;
}

export function PagePreviewDialog({
  open,
  onOpenChange,
  document,
  pageSlug,
}: PagePreviewDialogProps) {
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">("phone");

  const publicUrl = `https://nxtqr.vercel.app/p/${pageSlug}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col bg-background border-border/80 rounded-2xl shadow-2xl">
        {/* Preview Chrome Bar */}
        <div className="h-12 border-b border-border/60 bg-muted/40 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-[#FA520F]" />
            <span>DESTINATION PREVIEW</span>
            <span>•</span>
            <span className="text-foreground font-semibold">/p/{pageSlug}</span>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center border rounded-lg p-0.5 bg-background text-xs">
            <button
              type="button"
              onClick={() => setDevice("phone")}
              className={cn(
                "px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer",
                device === "phone" ? "bg-muted text-foreground font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <NxtqrIcon icon="solar:smartphone-linear" size={13} />
              <span>Mobile</span>
            </button>

            <button
              type="button"
              onClick={() => setDevice("tablet")}
              className={cn(
                "px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer",
                device === "tablet" ? "bg-muted text-foreground font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <NxtqrIcon icon="solar:tablet-linear" size={13} />
              <span>Tablet</span>
            </button>

            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={cn(
                "px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer",
                device === "desktop" ? "bg-muted text-foreground font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <NxtqrIcon icon="solar:laptop-linear" size={13} />
              <span>Desktop</span>
            </button>
          </div>

          {/* Close Action */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <NxtqrIcon icon="solar:close-circle-linear" size={18} />
          </Button>
        </div>

        {/* Viewport Canvas Container */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-6 flex flex-col items-center justify-start">
          <div
            className={cn(
              "w-full transition-all duration-200 shadow-xl overflow-hidden rounded-2xl bg-card border border-border/60",
              device === "phone" && "max-w-[390px] min-h-[700px]",
              device === "tablet" && "max-w-[768px] min-h-[700px]",
              device === "desktop" && "max-w-4xl min-h-[700px]"
            )}
          >
            <LandingPageRenderer
              document={document}
              device={device}
              mode="preview"
              onActionClick={(actionId, actionType) => {
                toast.info(`Interactive action simulated: ${actionType} (${actionId})`);
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
