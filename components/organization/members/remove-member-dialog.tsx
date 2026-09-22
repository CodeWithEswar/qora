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
import { AlertCircle, ShieldAlert } from "lucide-react";
import type { AdminMemberSummary } from "@/lib/supabase/types/members";

interface RemoveMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: AdminMemberSummary | null;
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

  React.useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  if (!member) return null;

  const isOwner = member.roleCode.toUpperCase() === "OWNER";

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
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
      <AlertDialogContent className="max-w-md bg-background text-foreground border border-border/80">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <span>GOVERNANCE</span>
            <span>/</span>
            <span className="text-foreground font-semibold">REMOVE MEMBER</span>
          </div>
          <AlertDialogTitle className="text-base font-semibold text-foreground pt-1 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            Remove {member.displayName} from workspace?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            This member will immediately forfeit all administrative access to this organization. Historical audit events, published assets, and previous changes will remain intact for governance accountability.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isOwner && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 font-mono">
            <span className="font-semibold block mb-0.5">OWNER SAFEGUARD</span>
            Server-side verification will reject this operation if this is the final Owner in the organization.
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AlertDialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
          <AlertDialogCancel onClick={onClose} disabled={isPending} className="text-xs h-8">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={isPending}
            className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isPending ? "Removing..." : "Confirm Removal"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
