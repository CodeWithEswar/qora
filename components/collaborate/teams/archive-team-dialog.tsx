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
import type { TeamSummary } from "@/lib/supabase/types/teams";
import { ShieldAlert } from "lucide-react";

interface ArchiveTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamSummary | null;
  onConfirmArchive: (teamId: string) => Promise<void>;
}

export function ArchiveTeamDialog({
  isOpen,
  onClose,
  team,
  onConfirmArchive,
}: ArchiveTeamDialogProps) {
  const [isPending, setIsPending] = React.useState(false);

  if (!team) return null;

  const handleArchive = async () => {
    setIsPending(true);
    try {
      await onConfirmArchive(team.id);
      onClose();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md bg-background text-foreground border border-border/80 p-6 font-mono text-xs">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs tracking-wider uppercase">
            <ShieldAlert className="h-4 w-4" />
            <span>ARCHIVE TEAM ACCESS LANE</span>
          </div>
          <AlertDialogTitle className="text-base font-bold text-foreground font-sans">
            Archive {team.name}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed font-sans">
            Archiving removes this team from active collaboration assignment and revokes any team-derived access footprint from its{" "}
            <span className="font-semibold text-foreground">{team.memberCount} assigned members</span>. Historical activity and audit records will remain preserved.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Relationship Transformation Preview */}
        <div className="p-3 rounded-lg border border-border/70 bg-surface/60 space-y-1.5 my-2">
          <span className="text-[10px] uppercase text-muted-foreground font-semibold block">
            TRANSFORMATION PREVIEW
          </span>
          <div className="text-[11px] space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>CURRENT:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● ACTIVE</span>
              <span>({team.memberCount} members connected)</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-bold">
              <span>PROPOSED:</span>
              <span className="text-muted-foreground/80">○ ARCHIVED</span>
              <span className="text-rose-600 dark:text-rose-400 font-normal">(Access revoked)</span>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
          <AlertDialogCancel onClick={onClose} className="text-xs h-8">
            Keep Team Active
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleArchive}
            disabled={isPending}
            className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white font-mono"
          >
            {isPending ? "Archiving..." : "Archive Team"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
