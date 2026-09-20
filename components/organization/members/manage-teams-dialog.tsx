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
import { Building2 } from "lucide-react";

interface TeamOption {
  id: string;
  name: string;
  description?: string;
  membersCount: number;
}

interface ManageTeamsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    name: string;
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage team assignments</DialogTitle>
          <DialogDescription>
            Assign <span className="font-semibold text-foreground">{member.name}</span> to functional teams.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2 max-h-64 overflow-y-auto pr-1">
          {teams.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-4 text-center">
              No teams configured in this workspace yet.
            </p>
          ) : (
            teams.map((t) => {
              const isChecked = selectedTeamIds.includes(t.id);
              return (
                <label
                  key={t.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface hover:bg-surface-hover/60 transition-colors cursor-pointer select-none"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleTeam(t.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="text-xs font-semibold text-foreground truncate">
                        {t.name}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {t.membersCount} members
                  </span>
                </label>
              );
            })
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isPending ? "Saving..." : "Save team assignments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
