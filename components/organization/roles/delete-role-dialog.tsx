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
import { AlertTriangle } from "lucide-react";

interface DeleteRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: {
    id: string;
    name: string;
    isSystem: boolean;
    memberCount: number;
  } | null;
  onConfirm: (roleId: string) => Promise<void>;
}

export function DeleteRoleDialog({
  isOpen,
  onClose,
  role,
  onConfirm,
}: DeleteRoleDialogProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!role) return null;

  const isAssigned = role.memberCount > 0;

  const handleDelete = async () => {
    if (isAssigned || role.isSystem) return;
    setIsPending(true);
    setError(null);
    try {
      await onConfirm(role.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to delete role.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete custom role &quot;{role.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete this role definition and remove its configured capability matrix.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {role.isSystem ? (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">System Role Protected</span>
              Built-in system roles cannot be deleted.
            </div>
          </div>
        ) : isAssigned ? (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Role is currently in use</span>
              This role is assigned to {role.memberCount} workspace member(s). Please reassign their roles before deleting this definition.
            </div>
          </div>
        ) : null}

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
            disabled={isPending || isAssigned || role.isSystem}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isPending ? "Deleting..." : "Delete role"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
