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
import { TeamMembershipDiff } from "./team-membership-diff";
import type { TeamDetail, TeamMemberItem } from "@/lib/supabase/types/teams";
import type { AdminMemberSummary } from "@/lib/supabase/types/members";
import { Search, AlertCircle } from "lucide-react";

interface ManageTeamMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamDetail | null;
  orgMembers: AdminMemberSummary[];
  onSave: (teamId: string, membershipIds: string[]) => Promise<void>;
}

export function ManageTeamMembersDialog({
  isOpen,
  onClose,
  team,
  orgMembers,
  onSave,
}: ManageTeamMembersDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (team && isOpen) {
      setSelectedIds(team.members.map((m) => m.membershipId));
      setError(null);
      setSearchQuery("");
    }
  }, [team, isOpen]);

  if (!team) return null;

  const filteredOrgMembers = orgMembers.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return m.displayName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const toggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const proposedMembers = orgMembers
    .filter((m) => selectedIds.includes(m.id))
    .map((m) => ({
      membershipId: m.id,
      displayName: m.displayName,
      roleName: m.roleName,
    }));

  const handleConfirm = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(team.id, selectedIds);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update team members.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-background text-foreground border border-border/80 p-6 font-mono text-xs max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 pb-2 border-b border-border/60">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            TEAM COLLABORATION / MEMBERSHIP
          </div>
          <DialogTitle className="text-base font-bold text-foreground font-sans">
            Manage {team.name} Members
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-sans">
            Assign or remove organization members from this collaboration lane.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Member Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search eligible members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-surface font-mono"
            />
          </div>

          {/* Member Selection List */}
          <div className="max-h-[200px] overflow-y-auto space-y-1 rounded-lg border border-border/70 p-2 bg-surface/50">
            {filteredOrgMembers.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground italic">
                No matching organization members found.
              </p>
            ) : (
              filteredOrgMembers.map((m) => {
                const isSelected = selectedIds.includes(m.id);
                const initials = m.displayName
                  ? m.displayName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                  : "MB";

                return (
                  <label
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-surface-hover cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMember(m.id)}
                        id={`mem-${m.id}`}
                      />
                      <Avatar className="h-7 w-7 border border-border shrink-0">
                        {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.displayName} />}
                        <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-foreground truncate font-sans">
                          {m.displayName}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{m.email}</p>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold text-primary bg-primary/5 border border-primary/20 px-1.5 py-0.2 rounded shrink-0 ml-2">
                      {m.roleName}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {/* Signature Concept #6: Team Membership Diff */}
          <TeamMembershipDiff
            teamName={team.name}
            currentMembers={team.members}
            proposedMembers={proposedMembers}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-8">
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={isSaving}
            onClick={handleConfirm}
            className="text-xs h-8 bg-primary hover:bg-primary/90 text-white font-mono"
          >
            {isSaving ? "Updating Members..." : "Confirm Membership"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
