"use client";

import React, { useState } from "react";
import { QrTemplateSummary } from "@/lib/domains/templates/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

interface DeleteTemplateDialogProps {
  template: QrTemplateSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (templateId: string) => void;
}

export function DeleteTemplateDialog({
  template,
  isOpen,
  onClose,
  onDeleted,
}: DeleteTemplateDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!template) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/v1/templates/${template.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to delete template");

      toast.success(`Template "${template.name}" removed from design library`);
      onDeleted(template.id);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete template");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <Icon icon="tabler:alert-triangle" className="h-5 w-5" />
            <AlertDialogTitle className="font-serif">Delete Template?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs space-y-2">
            <p>
              <strong className="text-foreground">{template.name}</strong> will be permanently removed from your organization&apos;s template library.
            </p>
            <p className="bg-muted/40 p-2.5 rounded border border-border/60 text-muted-foreground">
              <strong>Cascade Safety Notice:</strong> Existing published QR codes, drafts, and historical revisions previously created with this template will <strong>not</strong> be affected or deleted.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="text-xs">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs gap-1.5"
          >
            {isDeleting ? (
              <Icon icon="tabler:loader" className="h-4 w-4 animate-spin" />
            ) : (
              <Icon icon="tabler:trash" className="h-4 w-4" />
            )}
            Delete Template
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
