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
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RoleBadge } from "../shared/role-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { AccessSignalRail } from "./access-signal-rail";
import { AccessAtlas } from "./access-atlas";
import type { AdminMemberSummary } from "@/lib/supabase/types/members";
import { cn, formatDate } from "@/lib/utils";
import { X, Search, UserPlus, ArrowRight, ShieldCheck, ShieldAlert, UserX, UserCheck, Network } from "lucide-react";

interface RoleOption {
  id: string;
  code?: string;
  name: string;
  capabilities?: string[];
}

interface TeamOption {
  id: string;
  name: string;
}

interface MembersTableProps {
  organizationName: string;
  members: AdminMemberSummary[];
  roles: RoleOption[];
  teams: TeamOption[];
  pendingInvitationsCount?: number;
  onSelectMember: (member: AdminMemberSummary) => void;
  onTraceAccess?: (member: AdminMemberSummary) => void;
  onChangeRole: (member: AdminMemberSummary) => void;
  onManageTeams: (member: AdminMemberSummary) => void;
  onSuspendMember: (member: AdminMemberSummary) => void;
  onRestoreMember: (member: AdminMemberSummary) => void;
  onRemoveMember: (member: AdminMemberSummary) => void;
  onInviteClick: () => void;
  canManageMembers?: boolean;
}

export function MembersTable({
  organizationName,
  members,
  roles,
  teams,
  pendingInvitationsCount = 0,
  onSelectMember,
  onTraceAccess,
  onChangeRole,
  onManageTeams,
  onSuspendMember,
  onRestoreMember,
  onRemoveMember,
  onInviteClick,
  canManageMembers = true,
}: MembersTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string>("all");
  const [selectedTeam, setSelectedTeam] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("recent_active");
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);

  // Ref to role select for Atlas shortcut
  const roleSelectTriggerRef = React.useRef<HTMLButtonElement>(null);
  const teamSelectTriggerRef = React.useRef<HTMLButtonElement>(null);

  // Factual signal counts
  const activeCount = React.useMemo(() => members.filter((m) => m.status === "active").length, [members]);
  const suspendedCount = React.useMemo(() => members.filter((m) => m.status === "suspended").length, [members]);
  const invitedCount = pendingInvitationsCount;

  // Filter and Sort Engine
  const filteredMembers = React.useMemo(() => {
    let result = members.filter((m) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.displayName.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesRef = m.publicRef?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRef) return false;
      }

      if (selectedRole !== "all") {
        if (
          m.roleId !== selectedRole &&
          m.roleName.toLowerCase() !== selectedRole.toLowerCase() &&
          m.roleCode.toLowerCase() !== selectedRole.toLowerCase()
        ) {
          return false;
        }
      }

      if (selectedTeam !== "all") {
        if (!m.teams.some((t) => t.id === selectedTeam)) return false;
      }

      if (selectedStatus !== "all") {
        if (m.status !== selectedStatus) return false;
      }

      return true;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.displayName.localeCompare(b.displayName));
    } else if (sortBy === "recent_active") {
      result.sort((a, b) => {
        const tA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
        const tB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
        return tB - tA;
      });
    } else if (sortBy === "recent_joined") {
      result.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
    } else if (sortBy === "role") {
      result.sort((a, b) => a.roleName.localeCompare(b.roleName));
    }

    return result;
  }, [members, searchQuery, selectedRole, selectedTeam, selectedStatus, sortBy]);

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
    setSortBy("recent_active");
  };

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
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        {/* Directory Command Bar & SelectionCommandRail */}
        {selectedMemberIds.length > 0 ? (
          /* SelectionCommandRail when 1+ rows are selected */
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 px-4 rounded-xl bg-primary/10 border border-primary/25 text-xs shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-bold text-primary uppercase tracking-wide">
                {selectedMemberIds.length} {selectedMemberIds.length === 1 ? "MEMBER" : "MEMBERS"} SELECTED
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = members.find((m) => selectedMemberIds.includes(m.id));
                  if (target) onChangeRole(target);
                }}
                className="h-7 text-xs bg-surface font-mono cursor-pointer"
              >
                Change role
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = members.find((m) => selectedMemberIds.includes(m.id));
                  if (target) onManageTeams(target);
                }}
                className="h-7 text-xs bg-surface font-mono cursor-pointer"
              >
                Assign teams
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = members.find((m) => selectedMemberIds.includes(m.id));
                  if (target) onSuspendMember(target);
                }}
                className="h-7 text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 bg-surface font-mono cursor-pointer"
              >
                Suspend
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMemberIds([])}
                className="h-7 text-xs text-muted-foreground hover:text-foreground font-mono cursor-pointer"
              >
                Deselect all
              </Button>
            </div>
          </div>
        ) : (
          /* Normal Command Bar */
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl border border-border/80 bg-surface/60">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search members by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-surface w-full font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Popover/Select Filters */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              {/* Role Select */}
              <div className="w-full sm:w-32">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger ref={roleSelectTriggerRef} className="h-8 text-xs w-full bg-surface font-mono">
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

              {/* Team Select */}
              <div className="w-full sm:w-32">
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger ref={teamSelectTriggerRef} className="h-8 text-xs w-full bg-surface font-mono">
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

              {/* State Select */}
              <div className="w-full sm:w-28">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-8 text-xs w-full bg-surface font-mono">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Select */}
              <div className="w-full sm:w-36">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 text-xs w-full bg-surface font-mono">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent_active">Recently active</SelectItem>
                    <SelectItem value="recent_joined">Recently joined</SelectItem>
                    <SelectItem value="name">Name (A–Z)</SelectItem>
                    <SelectItem value="role">Role authority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 shrink-0 self-center sm:self-auto cursor-pointer font-mono"
              >
                <X className="h-3 w-3" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        )}

        {/* Active Filter Rail */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <span className="text-[10px] tracking-wider uppercase font-semibold">FILTERS:</span>
            {selectedRole !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-[11px]">
                ROLE / {roles.find((r) => r.id === selectedRole)?.name || selectedRole}
                <button onClick={() => setSelectedRole("all")} className="hover:text-foreground cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedTeam !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-[11px]">
                TEAM / {teams.find((t) => t.id === selectedTeam)?.name || selectedTeam}
                <button onClick={() => setSelectedTeam("all")} className="hover:text-foreground cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedStatus !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-[11px]">
                STATE / {selectedStatus.toUpperCase()}
                <button onClick={() => setSelectedStatus("all")} className="hover:text-foreground cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border text-[11px]">
                QUERY / &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")} className="hover:text-foreground cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-[11px] text-primary hover:underline ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Region 05: Member Registry Container */}
        <div className="rounded-xl border border-border/80 bg-surface/70 overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-border/60 bg-surface/50 flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[11px] tracking-widest text-muted-foreground uppercase font-semibold">
                MEMBER REGISTRY
              </span>
              <span className="text-border/80">|</span>
              <span className="text-[11px] text-muted-foreground">
                {filteredMembers.length} {filteredMembers.length === 1 ? "IDENTITY" : "IDENTITIES"}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              CLICK ROW TO INSPECT ACCESS
            </span>
          </div>

          {members.length === 0 ? (
            <EmptyState
              preset="members"
              variant="table"
              title="You're the only member with administrative access"
              description="Invite another member when operational access needs to be shared across teams."
              action={
                canManageMembers
                  ? {
                      label: "Invite member",
                      onClick: onInviteClick,
                    }
                  : undefined
              }
              className="py-10"
            />
          ) : filteredMembers.length === 0 ? (
            <EmptyState
              preset="members"
              variant="filtered"
              title="No organization members match this view"
              description="No organization members match the specified filter combination."
              action={{
                label: "Clear all filters",
                onClick: clearFilters,
              }}
              className="py-10"
            />
          ) : (
            <>
              {/* Desktop Table: 6 Columns */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent font-mono text-[11px]">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allFilteredSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all members"
                        />
                      </TableHead>
                      <TableHead>MEMBER IDENTITY</TableHead>
                      <TableHead>ACCESS RELATIONSHIP</TableHead>
                      <TableHead>STATE</TableHead>
                      <TableHead>SECURITY</TableHead>
                      <TableHead>LAST ACTIVE</TableHead>
                      <TableHead className="w-24 text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((m) => {
                      const isSelected = selectedMemberIds.includes(m.id);
                      const isInvited = m.status === "invited";
                      const isSuspended = m.status === "suspended";

                      const initials = m.displayName
                        ? m.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        : "MB";

                      return (
                        <TableRow
                          key={m.id}
                          data-state={isSelected ? "selected" : undefined}
                          className="h-[68px] group cursor-pointer hover:bg-surface-hover/80 transition-colors border-border/50"
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest("button") || target.closest("[role=checkbox]")) return;
                            onSelectMember(m);
                          }}
                        >
                          {/* Checkbox */}
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelectMember(m.id)}
                              aria-label={`Select ${m.displayName}`}
                            />
                          </TableCell>

                          {/* Column 1: MEMBER IDENTITY */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {/* Node indicator: hollow for invited, filled for active */}
                              <div
                                className={cn(
                                  "w-2.5 h-2.5 rounded-full shrink-0",
                                  isInvited
                                    ? "border-2 border-amber-500 bg-transparent"
                                    : isSuspended
                                    ? "border-2 border-rose-500 bg-transparent"
                                    : "bg-emerald-500"
                                )}
                              />

                              <Avatar className="h-8 w-8 border border-border shrink-0">
                                {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.displayName} />}
                                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                                    {m.displayName}
                                  </p>
                                  {m.isCurrentUser && (
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] font-mono px-1 py-0 h-4 border-primary/30 text-primary bg-primary/5"
                                    >
                                      YOU
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                                  <span className="truncate">{m.email}</span>
                                  <span className="text-border/80">·</span>
                                  <span className="text-[10px] text-muted-foreground/80 shrink-0">
                                    {m.publicRef || `MBR-${m.id.substring(0, 4).toUpperCase()}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Column 2: ACCESS RELATIONSHIP (Tree Geometry) */}
                          <TableCell>
                            <div className="font-mono text-xs space-y-0.5">
                              <div className="flex items-center gap-1.5 font-bold uppercase tracking-tight text-foreground">
                                <span className="text-primary text-[10px]">●</span>
                                <span>{m.roleName}</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground pl-3 border-l border-border/70 ml-1 truncate max-w-[200px]">
                                {m.teams.length === 0 ? (
                                  <span className="italic text-muted-foreground/70">
                                    Direct workspace authority
                                  </span>
                                ) : (
                                  <span>
                                    └── {m.teams.map((t) => t.name).join(" · ")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Column 3: STATE */}
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase",
                                m.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : m.status === "suspended"
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1 h-1 rounded-full",
                                  m.status === "active"
                                    ? "bg-emerald-500"
                                    : m.status === "suspended"
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                                )}
                              />
                              {m.status}
                            </span>
                          </TableCell>

                          {/* Column 4: SECURITY */}
                          <TableCell>
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              {m.security.isGoogleConnected ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                      <span className="w-1 h-1 rounded-full bg-blue-500" />
                                      GOOGLE SSO
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Authenticated via verified Google SSO account.
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface border border-border text-muted-foreground">
                                      EMAIL AUTH
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Standard verified email authentication.
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>

                          {/* Column 5: LAST ACTIVE */}
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {formatDate(m.lastActiveAt || m.joinedAt, {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Last recorded: {formatDate(m.lastActiveAt || m.joinedAt)}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* Column 6: ACTIONS + Contextual Hover Affordance */}
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Hover Reveal Button: VIEW ACCESS → */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onSelectMember(m)}
                                className="hidden group-hover:inline-flex h-7 px-2 text-[10px] font-mono text-primary hover:bg-primary/10 gap-1 transition-opacity cursor-pointer"
                              >
                                <span>VIEW ACCESS</span>
                                <ArrowRight className="h-3 w-3" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 opacity-70 group-hover:opacity-100 cursor-pointer"
                                  >
                                    <NxtqrIcon name="more" size={14} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 text-xs font-medium font-mono">
                                  <DropdownMenuItem onClick={() => onSelectMember(m)}>
                                    <NxtqrIcon name="member" size={13} className="mr-2" />
                                    View access detail
                                  </DropdownMenuItem>

                                  {onTraceAccess && (
                                    <DropdownMenuItem onClick={() => onTraceAccess(m)}>
                                      <Network className="mr-2 h-3.5 w-3.5 text-primary" />
                                      Trace access on map
                                    </DropdownMenuItem>
                                  )}

                                  {canManageMembers && (
                                    <>
                                      <DropdownMenuItem onClick={() => onChangeRole(m)} disabled={m.isCurrentUser}>
                                        <NxtqrIcon name="permission" size={13} className="mr-2 text-primary" />
                                        Edit access role
                                      </DropdownMenuItem>

                                      <DropdownMenuItem onClick={() => onManageTeams(m)}>
                                        <NxtqrIcon name="team" size={13} className="mr-2 text-teal-500" />
                                        Manage teams
                                      </DropdownMenuItem>

                                      <DropdownMenuSeparator />

                                      {m.status === "suspended" ? (
                                        <DropdownMenuItem onClick={() => onRestoreMember(m)}>
                                          <UserCheck className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                          Restore access
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem
                                          onClick={() => onSuspendMember(m)}
                                          disabled={m.isCurrentUser || m.roleCode === "OWNER"}
                                          className="text-amber-600 dark:text-amber-400"
                                        >
                                          <ShieldAlert className="h-3.5 w-3.5 mr-2" />
                                          Suspend member
                                        </DropdownMenuItem>
                                      )}

                                      <DropdownMenuItem
                                        onClick={() => onRemoveMember(m)}
                                        disabled={m.isCurrentUser || m.roleCode === "OWNER"}
                                        className="text-rose-600 dark:text-rose-400"
                                      >
                                        <UserX className="h-3.5 w-3.5 mr-2" />
                                        Remove member
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-border/60">
                {filteredMembers.map((m) => {
                  const isSelected = selectedMemberIds.includes(m.id);
                  const isInvited = m.status === "invited";
                  const isSuspended = m.status === "suspended";

                  const initials = m.displayName
                    ? m.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "MB";

                  return (
                    <div
                      key={m.id}
                      onClick={() => onSelectMember(m)}
                      className={cn(
                        "p-4 space-y-3 cursor-pointer hover:bg-surface-hover/70 transition-colors",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="h-9 w-9 border border-border shrink-0">
                            {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.displayName} />}
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-xs text-foreground truncate">
                                {m.displayName}
                              </p>
                              {m.isCurrentUser && (
                                <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 h-4 border-primary/30 text-primary bg-primary/5">
                                  YOU
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">
                              {m.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded-full border",
                              isInvited
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : isSuspended
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            )}
                          >
                            {isInvited ? "○ INVITED" : isSuspended ? "⊘ SUSPENDED" : "● ACTIVE"}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground/70" />
                        </div>
                      </div>

                      {/* Mobile Access Relationship Tree */}
                      <div className="p-2 rounded bg-surface/80 border border-border/70 font-mono text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground uppercase">{m.roleName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(m.lastActiveAt || m.joinedAt, { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <div className="text-muted-foreground pl-2 border-l border-border/70 truncate">
                          {m.teams.length === 0 ? (
                            <span className="italic text-[10px]">Direct workspace authority</span>
                          ) : (
                            <span className="text-[10px]">
                              └── {m.teams.map((t) => t.name).join(" · ")}
                            </span>
                          )}
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
    </TooltipProvider>
  );
}
