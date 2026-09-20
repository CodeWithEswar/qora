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

interface RemoveMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    name: string;
    email: string;
    roleName: string;
  } | null;
  onConfirm: (memberId: string) => Promise<void>;
}

export function RemoveMemberDialog({
  isOpen,
  onClose,
  member,
  onConfirm,
}: RemoveMemberDialogProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!member) return null;

  const isOwner = member.roleName.toLowerCase().includes("owner");

  const handleRemove = async () => {
    setIsPending(true);
    setError(null);
    try {
      await onConfirm(member.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to remove member.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remove {member.name} from this workspace?
          </AlertDialogTitle>
          <AlertDialogDescription>
            They will immediately lose all access to this organization, its QR assets, campaigns, routing rules, and intelligence reports.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isOwner && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
            <span className="font-semibold block mb-0.5">Workspace Owner Protection</span>
            This user is designated as an Owner. The server will reject removal if this is the final remaining Owner in the organization.
          </div>
        )}

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
            onClick={handleRemove}
            disabled={isPending}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isPending ? "Removing..." : "Remove member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
