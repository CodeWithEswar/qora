"use client";

import * as React from "react";
import { BrandKitSummaryV1 } from "@nxtqr/contracts";
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
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface DuplicateBrandKitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kit: BrandKitSummaryV1 | null;
  onDuplicate: (kitId: string, newName: string) => Promise<void>;
}

export function DuplicateBrandKitDialog({
  open,
  onOpenChange,
  kit,
  onDuplicate,
}: DuplicateBrandKitDialogProps) {
  const [name, setName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (kit && open) {
      setName(`Copy of ${kit.name}`);
    }
  }, [kit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kit) return;
    if (!name.trim()) {
      toast.error("Please enter a name for the duplicated kit");
      return;
    }

    setIsSubmitting(true);
    try {
      await onDuplicate(kit.id, name.trim());
      toast.success("Brand Kit duplicated successfully.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate Brand Kit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 space-y-4">
        <DialogHeader className="text-left space-y-1 pr-10 sm:pr-12">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FA520F] uppercase tracking-wider">
            <Copy className="w-3.5 h-3.5" />
            <span>CLONE IDENTITY SYSTEM</span>
          </div>
          <DialogTitle className="text-lg font-bold font-display text-foreground">
            Duplicate Brand Kit
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Clones all color tokens, typography settings, approved logos, and QR presets into a new independent Brand Kit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">New Kit Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs bg-surface border-border"
              placeholder="e.g. Copy of NXTQR Production"
              autoFocus
            />
          </div>

          <div className="p-3 rounded-lg border border-border/70 bg-surface/50 text-[11px] text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground">What is copied:</div>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Semantic color token registry</li>
              <li>Typography configuration</li>
              <li>Approved logos & center marks</li>
              <li>Branded QR style presets & guidelines</li>
            </ul>
            <p className="pt-1 text-[10px] text-muted-foreground">
              Audit history, comments, and resource links are not duplicated.
            </p>
          </div>

          <DialogFooter className="pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="text-xs h-8 bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium cursor-pointer"
            >
              {isSubmitting ? "Cloning..." : "Duplicate Kit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
