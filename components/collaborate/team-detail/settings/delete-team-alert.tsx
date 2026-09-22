"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { AlertTriangle, Trash2, ShieldCheck, Check } from "lucide-react";
import type { TeamDetail } from "@/lib/supabase/types/teams";

interface DeleteTeamAlertProps {
  isOpen: boolean;
  team: TeamDetail;
  orgSlug: string;
  onClose: () => void;
}

export function DeleteTeamAlert({
  isOpen,
  team,
  orgSlug,
  onClose,
}: DeleteTeamAlertProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const memberCount = team.members?.length || 0;
  const workCount = team.connectedWork?.assignments?.length ?? team.connectedWork?.totalCount ?? 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${team.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error?.message || "Failed to delete team.");
      }

      onClose();
      router.push(`/${orgSlug}/collaborate/teams`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete team.");
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="font-sans max-w-md bg-background border border-border/80">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-rose-500 font-mono text-[10px] uppercase font-bold tracking-wider">
            <Trash2 className="h-4 w-4" />
            <span>DESTRUCTIVE ACTION</span>
          </div>
          <AlertDialogTitle className="text-base font-bold text-foreground">
            Delete {team.name}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Deleting this team removes the operational collaboration unit and its relationship links.
            No workspace members or connected assets will be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Delete Impact Visual */}
        <div className="p-3.5 rounded-lg bg-surface border border-border/70 space-y-2.5 font-mono text-xs">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">
            SYSTEM CASCADE ANALYSIS:
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{team.name} Operational Entity:</span>
              <span className="text-rose-500 font-bold">DELETED</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Team Memberships ({memberCount}):</span>
              <span className="text-rose-500 font-bold">UNLINKED</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Connected Work Links ({workCount}):</span>
              <span className="text-rose-500 font-bold">UNLINKED</span>
            </div>
            <div className="flex items-center justify-between text-emerald-500 font-semibold border-t border-border/40 pt-1.5">
              <span>Underlying Workspace Assets:</span>
              <span>PRESERVED</span>
            </div>
            <div className="flex items-center justify-between text-emerald-500 font-semibold">
              <span>Workspace Member Accounts:</span>
              <span>PRESERVED</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
            {error}
          </div>
        )}

        <AlertDialogFooter className="gap-2 pt-2">
          <AlertDialogCancel
            disabled={isDeleting}
            className="h-8 text-xs cursor-pointer font-sans"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={handleDelete}
            className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer font-sans"
          >
            {isDeleting ? "Deleting..." : "Delete team"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
