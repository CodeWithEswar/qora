"use client";

import * as React from "react";
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
import { OrganizationInvitationRecord } from "@nxtqr/db";

interface RevokeInvitationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: OrganizationInvitationRecord | null;
  onConfirm: (invitationId: string) => Promise<void>;
}

export function RevokeInvitationDialog({
  isOpen,
  onClose,
  invitation,
  onConfirm,
}: RevokeInvitationDialogProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!invitation) return null;

  const handleRevoke = async () => {
    setIsPending(true);
    setError(null);
    try {
      await onConfirm(invitation.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to revoke invitation.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
          <AlertDialogDescription>
            The invitation sent to <span className="font-semibold text-foreground">{invitation.email}</span> will be immediately invalidated. They will no longer be able to use the link to join this workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={isPending}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isPending ? "Revoking..." : "Revoke invitation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
