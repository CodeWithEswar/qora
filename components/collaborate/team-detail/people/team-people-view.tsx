"use client";

import * as React from "react";
import { TeamMemberRow } from "./team-member-row";
import { AddTeamMembersDialog } from "./add-team-members-dialog";
import { RemoveTeamMemberAlert } from "./remove-team-member-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeamMemberItem } from "@/lib/supabase/types/teams";
import { Search, UserPlus, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamPeopleViewProps {
  teamName: string;
  teamId: string;
  organizationSlug: string;
  members: TeamMemberItem[];
  canManage?: boolean;
  onAddMembers: (membershipIds: string[]) => Promise<void>;
  onRemoveMember: (member: TeamMemberItem) => Promise<void>;
}

export function TeamPeopleView({
  teamName,
  teamId,
  organizationSlug,
  members,
  canManage = true,
  onAddMembers,
  onRemoveMember,
}: TeamPeopleViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("recent_joined");
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [removingMember, setRemovingMember] = React.useState<TeamMemberItem | null>(null);
  const [isRemoving, setIsRemoving] = React.useState(false);

  // Derive unique roles
  const uniqueRoles = React.useMemo(() => {
    return Array.from(new Set(members.map((m) => m.roleName)));
  }, [members]);

  // Filter & sort members
  const filteredMembers = React.useMemo(() => {
    let result = members.filter((m) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.displayName.toLowerCase().includes(q);
        const matchEmail = m.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }

      if (roleFilter !== "all" && m.roleName.toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }

      return true;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.displayName.localeCompare(b.displayName));
    } else if (sortBy === "recent_joined") {
      result.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
    } else if (sortBy === "role") {
      result.sort((a, b) => a.roleName.localeCompare(b.roleName));
    }

    return result;
  }, [members, searchQuery, roleFilter, sortBy]);

  const handleConfirmRemove = async (member: TeamMemberItem) => {
    setIsRemoving(true);
    try {
      await onRemoveMember(member);
      setRemovingMember(null);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-4 font-mono">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>TEAM</span>
            <span>/</span>
            <span>{teamName}</span>
            <span>/</span>
            <span className="text-primary font-bold">PEOPLE</span>
          </div>
          <h2 className="text-lg font-bold font-sans text-foreground pt-0.5">
            People
          </h2>
          <p className="text-xs text-muted-foreground font-sans">
            Manage workspace members connected to this team.
          </p>
        </div>

        {canManage && (
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-xs self-start sm:self-auto font-sans"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add members</span>
          </Button>
        )}
      </div>

      {/* Filter & Command Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team members by name or email..."
              className="pl-8 text-xs h-8 bg-surface/90 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-8 text-xs w-[130px] bg-surface font-mono">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs font-mono">All Roles</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem key={role} value={role} className="text-xs font-mono">
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Selector */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 text-xs w-[140px] bg-surface font-mono">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent_joined" className="text-xs font-mono">Recent Joined</SelectItem>
              <SelectItem value="name" className="text-xs font-mono">Name (A-Z)</SelectItem>
              <SelectItem value="role" className="text-xs font-mono">Role Tier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Members Directory Table */}
      <div className="rounded-lg border border-border/80 bg-surface/70 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface/90 border-b border-border/70 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">IDENTITY</th>
                <th className="px-4 py-3">ORGANIZATION ACCESS</th>
                <th className="px-4 py-3">TEAM CONNECTION</th>
                <th className="px-4 py-3">JOINED</th>
                <th className="px-4 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground font-sans">
                    {members.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs">No members have been added to this team yet.</p>
                        {canManage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAddOpen(true)}
                            className="h-7 text-xs font-mono gap-1"
                          >
                            <UserPlus className="h-3 w-3 text-blue-500" />
                            <span>Add first member</span>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs">No team members match the search query.</p>
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setRoleFilter("all");
                          }}
                          className="text-primary hover:underline text-xs"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <TeamMemberRow
                    key={member.membershipId}
                    member={member}
                    canManage={canManage}
                    onRemoveClick={(m) => setRemovingMember(m)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Members Dialog */}
      <AddTeamMembersDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        teamName={teamName}
        teamId={teamId}
        organizationSlug={organizationSlug}
        existingMembers={members}
        onAddMembers={onAddMembers}
      />

      {/* Remove Member Alert Dialog */}
      <RemoveTeamMemberAlert
        isOpen={Boolean(removingMember)}
        member={removingMember}
        teamName={teamName}
        isSubmitting={isRemoving}
        onClose={() => setRemovingMember(null)}
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}
