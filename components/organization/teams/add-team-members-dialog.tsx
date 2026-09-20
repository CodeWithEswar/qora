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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users } from "lucide-react";

interface WorkspaceMemberCandidate {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roleName: string;
}

interface AddTeamMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: {
    id: string;
    name: string;
  } | null;
  candidates: WorkspaceMemberCandidate[];
  alreadyMemberIds: string[];
  onAddMembers: (teamId: string, memberIds: string[]) => Promise<void>;
}

export function AddTeamMembersDialog({
  isOpen,
  onClose,
  team,
  candidates,
  alreadyMemberIds,
  onAddMembers,
}: AddTeamMembersDialogProps) {
  const [search, setSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSelectedIds([]);
    setSearch("");
    setError(null);
  }, [isOpen]);

  if (!team) return null;

  // Filter candidates not already in team
  const availableCandidates = candidates.filter(
    (c) => !alreadyMemberIds.includes(c.id)
  );

  const filtered = availableCandidates.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const toggleCandidate = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    if (selectedIds.length === 0) return;
    setIsPending(true);
    setError(null);
    try {
      await onAddMembers(team.id, selectedIds);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to add members to team.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add members to {team.name}</DialogTitle>
          <DialogDescription>
            Select collaborators from this organization to join the team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search workspace members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {/* Members list */}
          <div className="max-h-56 overflow-y-auto space-y-1.5 border border-border/70 rounded-xl p-2 bg-surface/40">
            {availableCandidates.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 italic">
                All workspace members are already on this team.
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 italic">
                No members found matching &quot;{search}&quot;
              </p>
            ) : (
              filtered.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover/80 transition-colors cursor-pointer select-none border border-transparent hover:border-border/60"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleCandidate(c.id)}
                    />
                    <Avatar className="h-7 w-7 border border-border">
                      {c.avatarUrl && <AvatarImage src={c.avatarUrl} alt={c.name} />}
                      <AvatarFallback className="text-[11px] font-semibold">
                        {c.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{c.email}</p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60">
                      {c.roleName}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={isPending || selectedIds.length === 0}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isPending
                ? "Adding..."
                : `Add ${selectedIds.length > 0 ? selectedIds.length : ""} member${
                    selectedIds.length === 1 ? "" : "s"
                  }`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
