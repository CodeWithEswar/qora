"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
import type { TeamSummary } from "@/lib/supabase/types/teams";
import { Trash2, Link2, X, ShieldAlert, ShieldCheck } from "lucide-react";

interface BulkTeamCommandBarProps {
  selectedTeams: TeamSummary[];
  onClearSelection: () => void;
  onBulkConnectWork: (teams: TeamSummary[]) => void;
  onBulkDelete: (teamIds: string[]) => Promise<void>;
  canManage?: boolean;
}

export function BulkTeamCommandBar({
  selectedTeams,
  onClearSelection,
  onBulkConnectWork,
  onBulkDelete,
  canManage = true,
}: BulkTeamCommandBarProps) {
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (selectedTeams.length === 0) return null;

  const totalMemberships = selectedTeams.reduce((acc, t) => acc + t.memberCount, 0);
  const totalWork = selectedTeams.reduce(
    (acc, t) => acc + (t.connectedWork?.totalCount || 0),
    0
  );

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onBulkDelete(selectedTeams.map((t) => t.id));
      setIsAlertOpen(false);
      onClearSelection();
    } catch {
      // Handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Floating Contextual Command Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl font-mono text-xs">
          <div className="flex items-center gap-2 pl-2">
            <span className="font-bold text-foreground">
              {selectedTeams.length} {selectedTeams.length === 1 ? "TEAM" : "TEAMS"}
            </span>
            <span className="text-border">|</span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              {totalMemberships} memberships · {totalWork} work links
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBulkConnectWork(selectedTeams)}
                  className="h-8 text-xs font-mono gap-1.5 cursor-pointer bg-surface"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Connect work</span>
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setIsAlertOpen(true)}
                  className="h-8 text-xs font-mono gap-1.5 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>
              </>
            )}

            <button
              type="button"
              onClick={onClearSelection}
              aria-label="Clear selection"
              className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Delete AlertDialog with Relationship Breakdown */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="sm:max-w-md font-mono text-xs bg-background border-border">
          <AlertDialogHeader className="space-y-2">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-[10px] tracking-widest uppercase font-bold">
                SAFEGUARD / BULK REMOVAL
              </span>
            </div>

            <AlertDialogTitle className="text-base font-bold text-foreground font-sans">
              Delete {selectedTeams.length} Teams?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-xs text-muted-foreground font-sans leading-relaxed">
              This action will remove {selectedTeams.length} teams and dissolve their team-membership relationships.
              Individual workspace members and connected resources will be completely preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="p-3 rounded-lg border border-border/70 bg-surface/60 space-y-2 text-[11px]">
            <div className="text-muted-foreground">
              ├── <span className="text-foreground font-semibold">{totalMemberships}</span> team-membership joins
            </div>
            <div className="text-muted-foreground">
              ├── <span className="text-foreground font-semibold">{totalWork}</span> resource assignments
            </div>
            <div className="text-muted-foreground">
              └── <span className="text-foreground font-semibold">{selectedTeams.length}</span> team records
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>ORGANIZATION MEMBERS & WORKSPACE ASSETS REMAIN SAFE</span>
            </div>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isDeleting} className="text-xs h-8">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {isDeleting ? "Deleting teams..." : `Delete ${selectedTeams.length} teams`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
