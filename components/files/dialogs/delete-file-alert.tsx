"use client";

import React, { useState } from "react";
import type { FileSummaryV1 } from "@nxtqr/contracts";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DeleteFileAlertProps {
  file: FileSummaryV1 | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  onSuccess: (deletedFileId: string) => void;
  onViewUsage: (file: FileSummaryV1) => void;
  onArchive: (file: FileSummaryV1) => void;
}

export function DeleteFileAlert({
  file,
  open,
  onOpenChange,
  orgSlug,
  onSuccess,
  onViewUsage,
  onArchive,
}: DeleteFileAlertProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!file) return null;

  const inUse = file.usageCount > 0;

  const handleDelete = async (force: boolean = false) => {
    setIsDeleting(true);
    try {
      const url = `/api/v1/organizations/${orgSlug}/files/${file.id}${force ? "?force=true" : ""}`;
      const res = await fetch(url, { method: "DELETE" });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to delete asset");
      }

      toast.success(`Asset "${file.name}" deleted`);
      onSuccess(file.id);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Could not delete asset");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md rounded-2xl border-border bg-surface p-6 shadow-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <NxtqrIcon icon="solar:trash-bin-trash-bold" size={16} />
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              {inUse ? "Active Dependencies Detected" : "Delete Asset Permanently"}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {inUse
              ? `"${file.name}" is currently participating in ${file.usageCount} active QR experience${file.usageCount === 1 ? "" : "s"}.`
              : `Are you sure you want to delete "${file.name}"? This removes the asset from Supabase Storage and PostgreSQL metadata.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {inUse && (
          <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
            <NxtqrIcon icon="solar:danger-triangle-bold" size={16} className="text-amber-500" />
            <AlertTitle className="text-xs font-semibold">Dependency Guard</AlertTitle>
            <AlertDescription className="text-[11px] mt-1">
              Deleting this asset may cause missing images or broken links in attached landing pages, QR codes, or campaigns. Archiving is recommended to preserve existing references while preventing new ones.
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter className="gap-2 pt-2 flex-col-reverse sm:flex-row sm:justify-end">
          <AlertDialogCancel
            disabled={isDeleting}
            className="text-xs border-border/80 hover:bg-muted cursor-pointer h-8 px-3"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </AlertDialogCancel>

          {inUse ? (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="text-xs cursor-pointer h-8"
                onClick={() => {
                  onOpenChange(false);
                  onViewUsage(file);
                }}
              >
                View Dependencies
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-xs cursor-pointer h-8"
                onClick={() => {
                  onOpenChange(false);
                  onArchive(file);
                }}
              >
                Archive Asset
              </Button>
              <Button
                size="sm"
                disabled={isDeleting}
                className="text-xs bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium cursor-pointer shadow-xs gap-1.5 h-8 px-3.5"
                onClick={() => handleDelete(true)}
              >
                <NxtqrIcon icon="solar:trash-bin-trash-bold" size={13} />
                <span>{isDeleting ? "Deleting..." : "Force Delete"}</span>
              </Button>
            </div>
          ) : (
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => handleDelete(false)}
              className="text-xs bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium cursor-pointer shadow-xs gap-1.5 h-8 px-3.5"
            >
              <NxtqrIcon icon="solar:trash-bin-trash-bold" size={13} />
              <span>{isDeleting ? "Deleting..." : "Delete Asset"}</span>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
