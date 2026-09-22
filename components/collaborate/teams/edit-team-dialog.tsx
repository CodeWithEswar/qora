"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TeamMark } from "./team-mark";
import type { TeamSummary } from "@/lib/supabase/types/teams";
import { Edit3 } from "lucide-react";

interface EditTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamSummary | null;
  onUpdate: (
    teamId: string,
    payload: { name: string; description?: string }
  ) => Promise<void>;
}

export function EditTeamDialog({
  isOpen,
  onClose,
  team,
  onUpdate,
}: EditTeamDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (team && isOpen) {
      setName(team.name);
      setDescription(team.description || "");
      setError(null);
    }
  }, [team, isOpen]);

  if (!team) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setError("Team name must be at least 2 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onUpdate(team.id, {
        name: cleanName,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md font-mono text-xs bg-background border-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-semibold">
              <span>COLLABORATE</span>
              <span>/</span>
              <span className="text-foreground">EDIT TEAM</span>
            </div>
            <DialogTitle className="text-base font-bold text-foreground font-sans">
              Edit Team Details
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-sans">
              Update team identity and operational purpose.
            </DialogDescription>
          </DialogHeader>

          {/* Mark Preview */}
          <div className="p-3 rounded-lg border border-border/70 bg-surface/60 flex items-center gap-3">
            <TeamMark name={name || team.name} id={team.id} size={36} />
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                DETERMINISTIC TEAM MARK
              </span>
              <div className="text-xs font-bold text-foreground truncate">
                {name.trim() || team.name}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-3 font-sans">
            <div className="space-y-1">
              <Label htmlFor="edit-team-name" className="text-xs font-mono font-medium">
                Team Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="edit-team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-xs font-mono bg-surface"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-team-desc" className="text-xs font-mono font-medium">
                Description
              </Label>
              <Textarea
                id="edit-team-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs font-mono bg-surface min-h-[70px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-8 font-mono"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !name.trim()}
              className="text-xs h-8 bg-primary hover:bg-primary/90 text-white font-mono font-semibold"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1.5" />
              <span>{isSubmitting ? "Saving..." : "Save changes"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
