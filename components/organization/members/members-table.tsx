"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleBadge } from "../shared/role-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Search,
  MoreVertical,
  UserPlus,
  Shield,
  Building2,
  X,
  UserX,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { MemberDetailItem } from "./member-detail-sheet";
import { cn, formatDate } from "@/lib/utils";

interface RoleOption {
  id: string;
  name: string;
}

interface TeamOption {
  id: string;
  name: string;
}

interface MembersTableProps {
  members: MemberDetailItem[];
  roles: RoleOption[];
  teams: TeamOption[];
  onSelectMember: (member: MemberDetailItem) => void;
  onChangeRole: (member: MemberDetailItem) => void;
  onManageTeams: (member: MemberDetailItem) => void;
  onRemoveMember: (member: MemberDetailItem) => void;
  onInviteClick: () => void;
  canManageMembers?: boolean;
}

export function MembersTable({
  members,
  roles,
  teams,
  onSelectMember,
  onChangeRole,
  onManageTeams,
  onRemoveMember,
  onInviteClick,
  canManageMembers = true,
}: MembersTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string>("all");
  const [selectedTeam, setSelectedTeam] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);

  // Filtering
  const filteredMembers = React.useMemo(() => {
    return members.filter((m) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }

      // Role filter
      if (selectedRole !== "all") {
        if (m.roleId !== selectedRole && m.roleName.toLowerCase() !== selectedRole.toLowerCase()) {
          return false;
        }
      }

      // Team filter
      if (selectedTeam !== "all") {
        if (!m.teams.some((t) => t.id === selectedTeam)) return false;
      }

      // Status filter
      if (selectedStatus !== "all") {
        if (m.status !== selectedStatus) return false;
      }

      return true;
    });
  }, [members, searchQuery, selectedRole, selectedTeam, selectedStatus]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedRole !== "all" ||
    selectedTeam !== "all" ||
    selectedStatus !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRole("all");
    setSelectedTeam("all");
    setSelectedStatus("all");
  };

  // Multi-select helpers
  const allFilteredSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedMemberIds.includes(m.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map((m) => m.id));
    }
  };

  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-3">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Workspace Members
          </h2>
          <p className="text-xs text-muted-foreground">
            People with access to this workspace and the authority assigned to them.
          </p>
        </div>

        {canManageMembers && (
          <Button
            size="sm"
            onClick={onInviteClick}
            className="w-full sm:w-auto gap-1.5 text-xs h-8 bg-primary hover:bg-primary/90 text-white shrink-0 justify-center"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Invite members</span>
          </Button>
        )}
      </div>

      {/* Filter Toolbar - responsive on all screen sizes */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl border border-border/70 bg-surface/50">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-surface w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters - 3-column grid on mobile, inline on desktop */}
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {/* Role Filter */}
          <div className="w-full sm:w-32">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Filter */}
          <div className="w-full sm:w-32">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-28">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 shrink-0 self-center sm:self-auto"
          >
            <X className="h-3 w-3" />
            <span>Clear filters</span>
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="text-[11px] font-mono">Active filters:</span>
          {selectedRole !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-border text-[11px]">
              Role: {roles.find((r) => r.id === selectedRole)?.name || selectedRole}
              <button onClick={() => setSelectedRole("all")}>
                <X className="h-3 w-3 hover:text-foreground" />
              </button>
            </span>
          )}
          {selectedTeam !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-border text-[11px]">
              Team: {teams.find((t) => t.id === selectedTeam)?.name || selectedTeam}
              <button onClick={() => setSelectedTeam("all")}>
                <X className="h-3 w-3 hover:text-foreground" />
              </button>
            </span>
          )}
          {selectedStatus !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-border text-[11px]">
              Status: {selectedStatus}
              <button onClick={() => setSelectedStatus("all")}>
                <X className="h-3 w-3 hover:text-foreground" />
              </button>
            </span>
          )}
          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-border text-[11px]">
              Query: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery("")}>
                <X className="h-3 w-3 hover:text-foreground" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Multi-Select Floating Context Bar */}
      {selectedMemberIds.length > 0 && (
        <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-primary/10 border border-primary/20 text-xs shadow-sm animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">
              {selectedMemberIds.length} member{selectedMemberIds.length > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const first = members.find((m) => selectedMemberIds.includes(m.id));
                if (first) onChangeRole(first);
              }}
              className="h-7 text-xs bg-surface"
            >
              Change role
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const first = members.find((m) => selectedMemberIds.includes(m.id));
                if (first) onManageTeams(first);
              }}
              className="h-7 text-xs bg-surface"
            >
              Assign teams
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMemberIds([])}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Deselect all
            </Button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="rounded-xl border border-border/70 bg-surface/80 overflow-hidden shadow-xs">
        {members.length === 0 ? (
          <div className="p-8">
            <EmptyState
              preset="members"
              variant="table"
              onAction={onInviteClick}
              className="border-none bg-transparent"
            />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground">
                No members match these filters
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Try adjusting your search criteria or clear your active filters.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs h-8">
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allFilteredSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all members"
                      />
                    </TableHead>
                    <TableHead>MEMBER</TableHead>
                    <TableHead>ROLE</TableHead>
                    <TableHead>TEAMS</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead className="hidden lg:table-cell">JOINED</TableHead>
                    <TableHead className="w-12 text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((m) => {
                    const isSelected = selectedMemberIds.includes(m.id);
                    return (
                      <TableRow
                        key={m.id}
                        data-state={isSelected ? "selected" : undefined}
                        className="h-[68px] group cursor-pointer hover:bg-surface-hover/80 transition-colors"
                        onClick={(e) => {
                          // Prevent row click if clicking checkbox or button
                          const target = e.target as HTMLElement;
                          if (target.closest("button") || target.closest("[role=checkbox]")) return;
                          onSelectMember(m);
                        }}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectMember(m.id)}
                            aria-label={`Select ${m.name}`}
                          />
                        </TableCell>

                        {/* Member */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-border shrink-0">
                              {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.name} />}
                              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                {m.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {m.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <RoleBadge role={m.roleName} isSystem={m.isSystemRole} />
                        </TableCell>

                        {/* Teams */}
                        <TableCell>
                          {m.teams.length === 0 ? (
                            <span className="text-muted-foreground text-[11px] italic">—</span>
                          ) : (
                            <div className="flex items-center gap-1 max-w-[200px] truncate">
                              <span className="text-xs text-foreground font-medium truncate">
                                {m.teams[0].name}
                              </span>
                              {m.teams.length > 1 && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-muted text-muted-foreground shrink-0">
                                  +{m.teams.length - 1}
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize",
                              m.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                m.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                              )}
                            />
                            {m.status}
                          </span>
                        </TableCell>

                        {/* Joined - hidden on compact tablets, visible on lg+ */}
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-[11px]">
                          {formatDate(m.joinedAt, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 opacity-70 group-hover:opacity-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                onClick={() => onSelectMember(m)}
                                className="text-xs"
                              >
                                View details
                              </DropdownMenuItem>
                              {canManageMembers && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => onChangeRole(m)}
                                    className="text-xs"
                                  >
                                    Change role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => onManageTeams(m)}
                                    className="text-xs"
                                  >
                                    Manage teams
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onRemoveMember(m)}
                                    className="text-xs text-rose-600 focus:text-rose-600"
                                  >
                                    Remove member
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile & Small Device Cards List (< 768px) */}
            <div className="md:hidden divide-y divide-border/60">
              {filteredMembers.map((m) => {
                const isSelected = selectedMemberIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectMember(m)}
                    className={cn(
                      "p-3.5 space-y-2.5 transition-colors cursor-pointer",
                      isSelected ? "bg-primary/5" : "hover:bg-surface-hover/60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectMember(m.id)}
                            aria-label={`Select ${m.name}`}
                          />
                        </div>

                        <Avatar className="h-9 w-9 border border-border shrink-0">
                          {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.name} />}
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {m.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {m.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Member options">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => onSelectMember(m)} className="text-xs">
                              View details
                            </DropdownMenuItem>
                            {canManageMembers && (
                              <>
                                <DropdownMenuItem onClick={() => onChangeRole(m)} className="text-xs">
                                  Change role
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onManageTeams(m)} className="text-xs">
                                  Manage teams
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onRemoveMember(m)}
                                  className="text-xs text-rose-600 focus:text-rose-600"
                                >
                                  Remove member
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40 text-[11px]">
                      <div className="flex items-center gap-2">
                        <RoleBadge role={m.roleName} isSystem={m.isSystemRole} />
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize",
                            m.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1 h-1 rounded-full",
                              m.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                            )}
                          />
                          {m.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-mono">
                        <span>
                          {m.teams.length > 0 ? (
                            <span className="text-foreground font-medium">
                              {m.teams[0].name}
                              {m.teams.length > 1 ? ` +${m.teams.length - 1}` : ""}
                            </span>
                          ) : (
                            "No teams"
                          )}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDate(m.joinedAt, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
