"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { AlertCircle } from "lucide-react";

interface TeamOption {
  id: string;
  name: string;
  description?: string;
  membersCount?: number;
}

interface ManageTeamsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    displayName: string;
    teams: Array<{ id: string; name: string }>;
  } | null;
  teams: TeamOption[];
  onConfirm: (memberId: string, teamIds: string[]) => Promise<void>;
}

export function ManageTeamsDialog({
  isOpen,
  onClose,
  member,
  teams,
  onConfirm,
}: ManageTeamsDialogProps) {
  const [selectedTeamIds, setSelectedTeamIds] = React.useState<string[]>([]);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (member) {
      setSelectedTeamIds(member.teams.map((t) => t.id));
      setError(null);
    }
  }, [member]);

  if (!member) return null;

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const handleSave = async () => {
    setIsPending(true);
    setError(null);
    try {
      await onConfirm(member.id, selectedTeamIds);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update member teams.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background text-foreground border border-border/80">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <span>MEMBER ACCESS</span>
            <span>/</span>
            <span className="text-foreground font-semibold">TEAM ASSIGNMENTS</span>
          </div>
          <DialogTitle className="text-base font-semibold text-foreground pt-1">
            Configure Team Memberships
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Assign <span className="font-semibold text-foreground">{member.displayName}</span> to functional teams.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2 max-h-64 overflow-y-auto pr-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {teams.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-6 text-center">
              No teams configured in this workspace yet.
            </p>
          ) : (
            teams.map((t) => {
              const isChecked = selectedTeamIds.includes(t.id);
              return (
                <label
                  key={t.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border/70 bg-surface/50 hover:bg-surface-hover/70 transition-colors cursor-pointer select-none"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleTeam(t.id)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{t.name}</span>
                      <NxtqrIcon name="team" size={13} className="text-muted-foreground/60" />
                    </div>
                    {t.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {t.description}
                      </p>
                    )}
                  </div>
                </label>
              );
            })
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-8">
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={isPending}
            onClick={handleSave}
            className="text-xs h-8 bg-primary hover:bg-primary/90 text-white"
          >
            {isPending ? "Saving..." : "Save Team Assignments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
