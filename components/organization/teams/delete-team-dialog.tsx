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

interface DeleteTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: {
    id: string;
    name: string;
    membersCount: number;
  } | null;
  onConfirm: (teamId: string) => Promise<void>;
}

export function DeleteTeamDialog({
  isOpen,
  onClose,
  team,
  onConfirm,
}: DeleteTeamDialogProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!team) return null;

  const handleDelete = async () => {
    setIsPending(true);
    setError(null);
    try {
      await onConfirm(team.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to delete team.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {team.name} team?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will disband the team unit. All {team.membersCount} member(s) will remain in the workspace, but any team-scoped access rules will be affected.
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
            onClick={handleDelete}
            disabled={isPending}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isPending ? "Deleting..." : "Delete team"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
