"use client";

import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

interface DuplicateTemplateDialogProps {
  template: QrTemplateSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onDuplicated: (newTemplate: QrTemplateSummary) => void;
}

export function DuplicateTemplateDialog({
  template,
  isOpen,
  onClose,
  onDuplicated,
}: DuplicateTemplateDialogProps) {
  const [customName, setCustomName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!template) return null;

  const displayName = customName !== null ? customName : `${template.name} (Copy)`;

  const handleDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = displayName.trim();
    if (!finalName) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/v1/templates/${template.id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: finalName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to duplicate template");

      toast.success(`Template duplicated as "${finalName}"`);
      onDuplicated(data.data);
      setCustomName(null);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleDuplicate}>
          <DialogHeader>
            <DialogTitle className="font-serif">Duplicate Template</DialogTitle>
            <DialogDescription className="text-xs">
              Clone this design configuration into a new editable template in your library.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="dup-name" className="text-xs">New Template Name</Label>
              <Input
                id="dup-name"
                value={displayName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Ember Campaign Variant"
                required
                maxLength={100}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !displayName.trim()} size="sm" className="gap-1.5">
              {isSubmitting ? (
                <Icon icon="tabler:loader" className="h-4 w-4 animate-spin" />
              ) : (
                <Icon icon="tabler:copy" className="h-4 w-4" />
              )}
              Duplicate Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
