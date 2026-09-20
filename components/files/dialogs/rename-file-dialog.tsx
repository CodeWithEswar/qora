"use client";

import React, { useState, useEffect } from "react";
import type { FileSummaryV1 } from "@nxtqr/contracts";
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
import { toast } from "sonner";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";

interface RenameFileDialogProps {
  file: FileSummaryV1 | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  onSuccess: (updatedFile: FileSummaryV1) => void;
}

export function RenameFileDialog({
  file,
  open,
  onOpenChange,
  orgSlug,
  onSuccess,
}: RenameFileDialogProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (file) {
      setName(file.name);
    }
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/files/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to rename file");
      }

      const json = await res.json();
      toast.success("File renamed successfully");
      onSuccess(json.data);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Could not rename file");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border bg-surface p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FA520F]/15 flex items-center justify-center text-[#FA520F]">
              <NxtqrIcon icon="solar:pen-bold" size={16} />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">Rename Asset</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Update the asset display name. Underlying storage paths and existing references remain intact.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="fileName" className="text-xs font-semibold text-foreground">
              Display Name
            </Label>
            <Input
              id="fileName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hero Logo Dark"
              className="h-9 text-xs"
              autoFocus
              required
            />
            <p className="text-[11px] font-mono text-muted-foreground truncate">
              Original: {file.originalName}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !name.trim() || name.trim() === file.name}
              className="text-xs bg-[#FA520F] hover:bg-[#FA520F]/90 text-white font-medium"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
