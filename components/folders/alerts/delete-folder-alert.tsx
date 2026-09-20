"use client";

import * as React from "react";
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
import { FolderResponseV1 } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";

export interface DeleteFolderAlertProps {
  folder: FolderResponseV1 | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug?: string;
  onDeleted?: () => void;
}

export function DeleteFolderAlert({
  folder,
  open,
  onOpenChange,
  orgSlug,
  onDeleted,
}: DeleteFolderAlertProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!folder) return null;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/v1/folders/${folder.id}`, {
        method: "DELETE",
        headers: {
          ...(orgSlug ? { "x-organization-slug": orgSlug } : {}),
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to delete folder.");
      }

      toast.success(
        `Folder "${folder.name}" deleted. ${folder.qrCount} QR assets moved to Unfiled.`
      );
      onOpenChange(false);
      onDeleted?.();
    } catch (err: any) {
      toast.error(err.message || "Could not delete folder.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-white dark:bg-[#18181B] border-border/80">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-lg text-foreground">
            Delete &quot;{folder.name}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground space-y-2 pt-1 text-left">
            <p>
              This deletes the folder container only.{" "}
              <strong className="text-foreground font-semibold">
                {folder.qrCount === 0
                  ? "No QR codes are currently assigned."
                  : `${folder.qrCount} ${folder.qrCount === 1 ? "QR code" : "QR codes"} will move to Unfiled.`}
              </strong>
            </p>
            <p className="p-2.5 rounded-md bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-700 dark:text-amber-300">
              The QR codes, their public URLs, printed scans, destination routing rules, and analytics will NOT be deleted or disrupted.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:space-x-0">
          <AlertDialogCancel
            disabled={isDeleting}
            className="text-xs h-8 cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium cursor-pointer"
          >
            {isDeleting ? (
              <>
                <NxtqrIcon icon="solar:restart-linear" size={13} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Folder</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
