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
import { Textarea } from "@/components/ui/textarea";
import { TeamMark } from "@/components/collaborate/teams/team-mark";
import type { TeamDetail } from "@/lib/supabase/types/teams";

interface EditTeamDialogProps {
  isOpen: boolean;
  team: TeamDetail;
  orgSlug: string;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditTeamDialog({
  isOpen,
  team,
  orgSlug,
  onClose,
  onUpdated,
}: EditTeamDialogProps) {
  const [name, setName] = React.useState(team.name);
  const [description, setDescription] = React.useState(team.description || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setName(team.name);
    setDescription(team.description || "");
    setError(null);
  }, [team, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Team name cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/teams/${team.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error?.message || "Failed to update team.");
      }

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md font-sans">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <TeamMark name={name || team.name} id={team.id} size={36} className="shrink-0" />
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Edit Team Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update the display name and operational purpose of this team.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase text-muted-foreground">
              Team Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product, Marketing, Security"
              className="text-xs h-9"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase text-muted-foreground">
              Purpose & Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain this team's scope of responsibility..."
              rows={3}
              className="text-xs resize-none"
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-sans cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !name.trim()}
              className="text-xs font-sans cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
