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
import { TeamMark } from "./team-mark";
import type { TeamSummary } from "@/lib/supabase/types/teams";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface DeleteTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamSummary | null;
  onConfirmDelete: (teamId: string) => Promise<void>;
}

export function DeleteTeamDialog({
  isOpen,
  onClose,
  team,
  onConfirmDelete,
}: DeleteTeamDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!team) return null;

  const work = team.connectedWork || {
    qrCount: 0,
    campaignCount: 0,
    brandKitCount: 0,
    templateCount: 0,
    domainCount: 0,
    folderCount: 0,
    totalCount: 0,
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete(team.id);
      onClose();
    } catch {
      // Handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md font-mono text-xs bg-background border-border">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-[10px] tracking-widest uppercase font-bold">
              SAFEGUARD / DESTRUCTIVE ACTION
            </span>
          </div>

          <AlertDialogTitle className="text-base font-bold text-foreground font-sans">
            Delete Team: &quot;{team.name}&quot;?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-xs text-muted-foreground font-sans leading-relaxed">
            Deleting this team removes its operational collaboration boundary and team-membership joins.
            Workspace members remain active, and connected NXTQR resources will not be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* DELETE TEAM IMPACT MAP (Signature Pattern) */}
        <div className="p-3.5 rounded-lg border border-border/70 bg-surface/60 space-y-2.5">
          <div className="flex items-center gap-2">
            <TeamMark name={team.name} id={team.id} size={24} />
            <span className="font-bold text-foreground text-xs uppercase">{team.name}</span>
          </div>

          <div className="space-y-1 pl-4 border-l border-border/80 text-[11px]">
            <div className="text-muted-foreground">
              ├── <span className="text-foreground font-semibold">{team.memberCount}</span> membership links (will be dissolved)
            </div>
            {work.campaignCount > 0 && (
              <div className="text-muted-foreground">
                ├── <span className="text-foreground font-semibold">{work.campaignCount}</span> campaign assignments
              </div>
            )}
            {work.qrCount > 0 && (
              <div className="text-muted-foreground">
                ├── <span className="text-foreground font-semibold">{work.qrCount}</span> QR resource assignments
              </div>
            )}
            {work.brandKitCount > 0 && (
              <div className="text-muted-foreground">
                ├── <span className="text-foreground font-semibold">{work.brandKitCount}</span> brand kit assignments
              </div>
            )}
            <div className="text-muted-foreground">
              └── <span className="text-foreground font-semibold">{work.totalCount}</span> total connected assignments
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>RELATIONSHIPS REMOVED · ALL RESOURCES PRESERVED</span>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isDeleting} className="text-xs h-8">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
          >
            {isDeleting ? "Deleting team..." : "Delete team"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
