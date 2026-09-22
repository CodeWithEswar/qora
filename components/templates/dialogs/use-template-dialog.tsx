"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { QrTemplateSummary } from "@/lib/domains/templates/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

interface UseTemplateDialogProps {
  template: QrTemplateSummary | null;
  orgSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UseTemplateDialog({
  template,
  orgSlug,
  isOpen,
  onClose,
}: UseTemplateDialogProps) {
  const router = useRouter();
  const [destination, setDestination] = useState<"studio" | "bulk">("studio");

  if (!template) return null;

  const handleContinue = () => {
    onClose();
    if (destination === "studio") {
      router.push(`/${orgSlug}/qr/studio?templateId=${template.id}`);
    } else {
      router.push(`/${orgSlug}/qr/bulk?templateId=${template.id}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Apply Template Design</DialogTitle>
          <DialogDescription className="text-xs">
            Apply <span className="font-semibold text-foreground">{template.name}</span> to generate recognizable, on-brand QR codes.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-3">
          <div
            onClick={() => setDestination("studio")}
            className={`flex items-start justify-between rounded-lg border p-3.5 transition-all cursor-pointer ${
              destination === "studio"
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border/80 hover:bg-muted/30"
            }`}
          >
            <div className="space-y-1 pr-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                <Icon icon="tabler:qrcode" className="h-4 w-4 text-primary" />
                Launch in QR Studio
              </div>
              <p className="text-xs text-muted-foreground font-normal">
                Create an individual high-precision QR code with content, routing rules, and live telemetry.
              </p>
            </div>
            {destination === "studio" ? (
              <Icon icon="tabler:circle-check-filled" className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            ) : (
              <Icon icon="tabler:circle" className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            )}
          </div>

          <div
            onClick={() => setDestination("bulk")}
            className={`flex items-start justify-between rounded-lg border p-3.5 transition-all cursor-pointer ${
              destination === "bulk"
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border/80 hover:bg-muted/30"
            }`}
          >
            <div className="space-y-1 pr-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                <Icon icon="tabler:files" className="h-4 w-4 text-primary" />
                Apply to Bulk Create Batch
              </div>
              <p className="text-xs text-muted-foreground font-normal">
                Generate batches of hundreds of QR assets simultaneously sharing this governed design.
              </p>
            </div>
            {destination === "bulk" ? (
              <Icon icon="tabler:circle-check-filled" className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            ) : (
              <Icon icon="tabler:circle" className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button onClick={handleContinue} size="sm" className="gap-1.5">
            <Icon icon="tabler:arrow-right" className="h-4 w-4" />
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
