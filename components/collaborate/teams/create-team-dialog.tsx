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
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamMark } from "./team-mark";
import type { AdminMemberSummary } from "@/lib/supabase/types/members";
import { Users, UserPlus } from "lucide-react";

interface CreateTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  orgMembers: AdminMemberSummary[];
  onCreate: (payload: {
    name: string;
    description?: string;
    memberIds: string[];
  }) => Promise<any>;
}

export function CreateTeamDialog({
  isOpen,
  onClose,
  organizationName,
  orgMembers,
  onCreate,
}: CreateTeamDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);
  const [memberSearch, setMemberSearch] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setSelectedMemberIds([]);
      setMemberSearch("");
      setError(null);
    }
  }, [isOpen]);

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredMembers = React.useMemo(() => {
    if (!memberSearch.trim()) return orgMembers;
    const q = memberSearch.toLowerCase();
    return orgMembers.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [orgMembers, memberSearch]);

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
      await onCreate({
        name: cleanName,
        description: description.trim() || undefined,
        memberIds: selectedMemberIds,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg font-mono text-xs bg-background border-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-semibold">
              <span>COLLABORATE</span>
              <span>/</span>
              <span className="text-foreground">NEW TEAM</span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground font-sans">
              Create Team
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-sans">
              Group workspace members around shared responsibility and connected work.
            </DialogDescription>
          </DialogHeader>

          {/* Visual Identity Preview (Signature Pattern) */}
          <div className="p-3 rounded-lg border border-border/70 bg-surface/60 flex items-center gap-3">
            <TeamMark name={name || "Team"} id="preview" size={40} />
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                DETERMINISTIC TEAM MARK
              </span>
              <div className="text-xs font-bold text-foreground truncate">
                {name.trim() || "Enter team name..."}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3 font-sans">
            <div className="space-y-1">
              <Label htmlFor="team-name" className="text-xs font-mono font-medium">
                Team Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="team-name"
                placeholder="e.g. Product, QR Operations, Marketing..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-xs font-mono bg-surface"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="team-desc" className="text-xs font-mono font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="team-desc"
                placeholder="What responsibilities or operational workflows does this team own?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs font-mono bg-surface min-h-[60px] resize-none"
              />
            </div>

            {/* Optional initial members */}
            <div className="space-y-2 pt-1 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  INITIAL MEMBERS ({selectedMemberIds.length})
                </span>
                <span className="text-[10px] text-muted-foreground">Optional</span>
              </div>

              {orgMembers.length > 5 && (
                <Input
                  placeholder="Filter workspace members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="h-7 text-xs bg-surface"
                />
              )}

              <div className="border border-border/70 rounded-lg max-h-36 overflow-y-auto p-1 divide-y divide-border/40 bg-surface/40">
                {filteredMembers.map((m) => {
                  const isChecked = selectedMemberIds.includes(m.id);
                  const initials = m.displayName
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "MB";

                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMember(m.id)}
                      className="p-1.5 flex items-center justify-between hover:bg-surface transition-colors cursor-pointer select-none rounded"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Checkbox checked={isChecked} />
                        <Avatar className="h-5 w-5 border border-border text-[9px]">
                          {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.displayName} />}
                          <AvatarFallback className="bg-muted text-[9px] font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-foreground truncate font-sans">
                          {m.displayName}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                          {m.email}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                        {m.roleName}
                      </span>
                    </div>
                  );
                })}
              </div>
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
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              <span>{isSubmitting ? "Creating..." : "Create team"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
