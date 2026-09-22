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
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/organization/shared/role-badge";
import type { TeamMemberItem } from "@/lib/supabase/types/teams";
import type { AdminMemberSummary } from "@/lib/supabase/types/members";
import { Search, UserPlus, Check } from "lucide-react";

interface AddTeamMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  teamId: string;
  organizationSlug: string;
  existingMembers: TeamMemberItem[];
  onAddMembers: (selectedMembershipIds: string[]) => Promise<void>;
}

export function AddTeamMembersDialog({
  isOpen,
  onClose,
  teamName,
  teamId,
  organizationSlug,
  existingMembers,
  onAddMembers,
}: AddTeamMembersDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [candidates, setCandidates] = React.useState<AdminMemberSummary[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const existingIds = React.useMemo(() => {
    return new Set(existingMembers.map((m) => m.membershipId));
  }, [existingMembers]);

  // Fetch eligible workspace members
  React.useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setSelectedIds([]);
    setSearchQuery("");

    fetch(`/api/v1/organizations/${organizationSlug}/members`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.data && Array.isArray(data.data)) {
          setCandidates(data.data);
        }
      })
      .catch((err) => console.error("Failed to load workspace members:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, organizationSlug]);

  const filteredCandidates = React.useMemo(() => {
    return candidates
      .filter((m) => !existingIds.has(m.id) && m.status === "active")
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.displayName?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.roleName?.toLowerCase().includes(q)
        );
      });
  }, [candidates, existingIds, searchQuery]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await onAddMembers(selectedIds);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-background text-foreground border border-border/80 font-mono text-xs">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <UserPlus className="h-3.5 w-3.5 text-primary" />
            <span>WORKSPACE COLLABORATION</span>
          </div>
          <DialogTitle className="text-base font-bold font-sans text-foreground pt-1">
            Add Members to {teamName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-sans">
            Select active workspace members to connect to this operational team.
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workspace members by name, email or role..."
            className="pl-8 text-xs h-9 bg-surface font-mono"
          />
        </div>

        {/* Candidate List Container */}
        <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1 my-2">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground text-xs font-sans">
              Loading workspace directory...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs font-sans">
              {candidates.length === 0
                ? "No eligible workspace members found."
                : "All eligible workspace members are already assigned to this team."}
            </div>
          ) : (
            filteredCandidates.map((member) => {
              const isSelected = selectedIds.includes(member.id);
              const initials = member.displayName
                ? member.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "MB";

              return (
                <div
                  key={member.id}
                  onClick={() => handleToggle(member.id)}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface/70 border border-border/60 hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(member.id)}
                      className="accent-primary"
                    />
                    <Avatar className="h-7 w-7 border border-border shrink-0">
                      {member.avatarUrl && (
                        <AvatarImage src={member.avatarUrl} alt={member.displayName} />
                      )}
                      <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <span className="font-semibold text-foreground font-sans block truncate text-xs">
                        {member.displayName}
                      </span>
                      <span className="text-[10px] text-muted-foreground block truncate">
                        {member.email}
                      </span>
                    </div>
                  </div>

                  <RoleBadge role={member.roleName} className="text-[10px] shrink-0" />
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border/60 pt-3">
          <div className="text-[11px] text-muted-foreground font-mono">
            {selectedIds.length} of {filteredCandidates.length} selected
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs font-sans">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={selectedIds.length === 0 || isSubmitting}
              onClick={handleSubmit}
              className="h-8 text-xs bg-primary hover:bg-primary/90 text-white font-sans"
            >
              {isSubmitting ? "Adding..." : `Add ${selectedIds.length || ""} to team`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
