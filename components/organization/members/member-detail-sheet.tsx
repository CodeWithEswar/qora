"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "../shared/role-badge";
import {
  Shield,
  Building2,
  Calendar,
  KeyRound,
  CheckCircle2,
  Lock,
  UserX,
  ExternalLink,
  QrCode,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getEffectivePermissions, PERMISSION_GROUPS } from "@nxtqr/permissions";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface MemberDetailItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roleId: string;
  roleName: string;
  isSystemRole: boolean;
  status: "active" | "invited" | "suspended";
  joinedAt: number;
  teams: Array<{ id: string; name: string }>;
}

interface MemberDetailSheetProps {
  member: MemberDetailItem | null;
  isOpen: boolean;
  onClose: () => void;
  onChangeRoleClick: (member: MemberDetailItem) => void;
  onManageTeamsClick: (member: MemberDetailItem) => void;
  onRemoveClick: (member: MemberDetailItem) => void;
  canManageMembers?: boolean;
}

export function MemberDetailSheet({
  member,
  isOpen,
  onClose,
  onChangeRoleClick,
  onManageTeamsClick,
  onRemoveClick,
  canManageMembers = true,
}: MemberDetailSheetProps) {
  const [showAllPermissions, setShowAllPermissions] = React.useState(false);

  if (!member) return null;

  const effective = getEffectivePermissions(member.roleName);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="sm:max-w-md w-full">
        {/* Header with Avatar & Identity */}
        <div className="pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-12 w-12 border border-border">
              {member.avatarUrl && (
                <AvatarImage src={member.avatarUrl} alt={member.name} />
              )}
              <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                {member.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground truncate">
                  {member.name}
                </h3>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-medium uppercase tracking-wider",
                    member.status === "active"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  )}
                >
                  {member.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 py-4 flex-1 overflow-y-auto pr-1">
          {/* Section 1: ACCESS */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              ACCESS & TENANCY
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground block">Assigned Role</span>
                <RoleBadge role={member.roleName} isSystem={member.isSystemRole} />
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground block">Joined Workspace</span>
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{formatDate(member.joinedAt)}</span>
                </div>
              </div>
            </div>

            {/* Teams */}
            <div className="p-3 rounded-lg bg-surface border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Assigned Teams</span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {member.teams.length}
                </span>
              </div>
              {member.teams.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No team assignments</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {member.teams.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-medium"
                    >
                      <Building2 className="h-3 w-3" />
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: EFFECTIVE PERMISSIONS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                EFFECTIVE CAPABILITY MATRIX
              </h4>
              <button
                onClick={() => setShowAllPermissions(!showAllPermissions)}
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                <span>{showAllPermissions ? "Compact view" : "View all"}</span>
                {showAllPermissions ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            </div>

            <div className="space-y-2">
              {effective.groups.map((group) => {
                const isFullyEnabled = group.enabledCount === group.totalCount;
                const isPartiallyEnabled =
                  group.enabledCount > 0 && group.enabledCount < group.totalCount;

                if (!showAllPermissions && group.enabledCount === 0) return null;

                return (
                  <div
                    key={group.id}
                    className="p-3 rounded-lg bg-surface border border-border/70 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Shield
                          className={cn(
                            "h-3.5 w-3.5",
                            group.enabledCount > 0 ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <span>{group.category}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {group.enabledCount} / {group.totalCount}
                      </span>
                    </div>

                    {showAllPermissions && (
                      <div className="pt-2 divide-y divide-border/40 space-y-1.5">
                        {group.permissions.map((p) => {
                          const has = effective.allEnabledCodes.includes(p.code);
                          return (
                            <div
                              key={p.code}
                              className="pt-1.5 flex items-center justify-between text-[11px]"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 text-white",
                                    has ? "bg-primary" : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {has ? (
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                  ) : (
                                    <span className="text-[8px] font-mono">×</span>
                                  )}
                                </div>
                                <span className={has ? "text-foreground" : "text-muted-foreground"}>
                                  {p.label}
                                </span>
                              </div>
                              <code className="text-[9px] font-mono text-muted-foreground">
                                {p.code}
                              </code>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: ACTIONS */}
          {canManageMembers && (
            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                MEMBER ACTIONS
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onChangeRoleClick(member)}
                  className="text-xs justify-start gap-2"
                >
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Change role</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onManageTeamsClick(member)}
                  className="text-xs justify-start gap-2"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Manage teams</span>
                </Button>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveClick(member)}
                  className="text-xs w-full text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 justify-start gap-2"
                >
                  <UserX className="h-3.5 w-3.5" />
                  <span>Remove member from workspace</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
