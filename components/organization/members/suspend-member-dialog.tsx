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

interface SuspendMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: AdminMemberSummary | null;
  mode: "suspend" | "restore";
  onConfirm: (memberId: string) => Promise<void>;
}

export function SuspendMemberDialog({
  isOpen,
  onClose,
  member,
  mode,
  onConfirm,
}: SuspendMemberDialogProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  if (!member) return null;

  const isSuspend = mode === "suspend";

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      await onConfirm(member.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || `Failed to ${mode} member access.`);
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
            <span className="text-foreground font-semibold">
              {isSuspend ? "SUSPEND ACCESS" : "RESTORE ACCESS"}
            </span>
          </div>
          <AlertDialogTitle className="text-base font-semibold text-foreground pt-1 flex items-center gap-2">
            {isSuspend ? (
              <>
                <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                Suspend Workspace Access?
              </>
            ) : (
              <>Restore Workspace Access?</>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {isSuspend ? (
              <>
                <span className="font-semibold text-foreground">{member.displayName}</span> ({member.email}) will no longer be able to access NXTQR administrative operations until restored by an administrator. Their team memberships and activity history will be safely preserved.
              </>
            ) : (
              <>
                Restore active administrative access for <span className="font-semibold text-foreground">{member.displayName}</span> ({member.email}). The member will regain operational privileges assigned to the <span className="font-semibold text-foreground">{member.roleName}</span> role.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

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
            onClick={handleAction}
            disabled={isPending}
            className={
              isSuspend
                ? "text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white"
                : "text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
            }
          >
            {isPending
              ? isSuspend
                ? "Suspending..."
                : "Restoring..."
              : isSuspend
              ? "Confirm Suspension"
              : "Confirm Restoration"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
