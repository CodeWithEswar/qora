"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface DuplicateQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalName: string;
  onConfirm: (newName: string) => Promise<void>;
}

export function DuplicateQrDialog({
  open,
  onOpenChange,
  originalName,
  onConfirm,
}: DuplicateQrDialogProps) {
  const [name, setName] = React.useState(`Copy of ${originalName}`);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setName(`Copy of ${originalName}`);
  }, [originalName, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onConfirm(name.trim());
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#161616] border border-border/80">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-lg tracking-tight">
              Duplicate QR Code
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create an exact clone of this QR code's destination and visual configuration with a unique public slug.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <Label htmlFor="duplicate-qr-name" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              New QR Name
            </Label>
            <Input
              id="duplicate-qr-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter QR name..."
              className="h-9 text-xs"
              required
              autoFocus
            />
          </div>

          <DialogFooter className="gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !name.trim()}
              className="bg-primary hover:bg-[#cc3a05] text-white text-xs h-8"
            >
              {isSubmitting ? "Duplicating..." : "Duplicate QR"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
