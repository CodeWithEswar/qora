"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "../shared/role-badge";
import { MemberAccessMap } from "./member-access-map";
import { PermissionExplorerDialog } from "./permission-explorer-dialog";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import type { AdminMemberSummary, MemberActivityEvent } from "@/lib/supabase/types/members";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { UserCheck, ShieldAlert, KeyRound, Clock, UserMinus, ShieldCheck } from "lucide-react";

export type MemberDetailItem = AdminMemberSummary;

interface MemberDetailSheetProps {
  member: AdminMemberSummary | null;
  organizationName: string;
  isOpen: boolean;
  onClose: () => void;
  onChangeRoleClick: (member: AdminMemberSummary) => void;
  onManageTeamsClick: (member: AdminMemberSummary) => void;
  onSuspendClick: (member: AdminMemberSummary) => void;
  onRestoreClick: (member: AdminMemberSummary) => void;
  onRemoveClick: (member: AdminMemberSummary) => void;
  canManageMembers?: boolean;
}

export function MemberDetailSheet({
  member,
  organizationName,
  isOpen,
  onClose,
  onChangeRoleClick,
  onManageTeamsClick,
  onSuspendClick,
  onRestoreClick,
  onRemoveClick,
  canManageMembers = true,
}: MemberDetailSheetProps) {
  const [recentActivity, setRecentActivity] = React.useState<MemberActivityEvent[]>([]);
  const [loadingActivity, setLoadingActivity] = React.useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = React.useState(false);

  // Load recent Supabase activity when sheet opens
  React.useEffect(() => {
    if (!member || !isOpen) return;

    let isMounted = true;
    setLoadingActivity(true);

    fetch(`/api/v1/organizations/${organizationName}/members/${member.id}?includeActivity=true`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (isMounted && body?.data?.recentActivity) {
          setRecentActivity(body.data.recentActivity);
        } else if (isMounted) {
          setRecentActivity([]);
        }
      })
      .catch(() => {
        if (isMounted) setRecentActivity([]);
      })
      .finally(() => {
        if (isMounted) setLoadingActivity(false);
      });

    return () => {
      isMounted = false;
    };
  }, [member, isOpen, organizationName]);

  if (!member) return null;

  const initials = member.displayName
    ? member.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "MB";

  const isOwner = member.roleCode.toUpperCase() === "OWNER";
  const isSuspended = member.status === "suspended";

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[580px] p-0 flex flex-col bg-background text-foreground border-l border-border/80 shadow-xl"
        >
          {/* Kicker & Breadcrumb Bar */}
          <div className="px-6 py-4 border-b border-border/70 bg-surface/40 flex items-center justify-between select-none">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <span>COLLABORATE</span>
              <span>/</span>
              <span className="text-foreground font-semibold">MEMBER INSPECTOR</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground bg-surface px-2 py-0.5 rounded border border-border">
                {member.publicRef || `MBR-${member.id.substring(0, 4).toUpperCase()}`}
              </span>
              {member.isCurrentUser && (
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
                  YOU
                </Badge>
              )}
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Identity Header */}
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 border border-border shrink-0 shadow-xs">
                {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.displayName} />}
                <AvatarFallback className="text-base font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground tracking-tight truncate">
                    {member.displayName}
                  </h3>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold",
                      member.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : member.status === "suspended"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    )}
                  >
                    {member.status === "invited" ? "○ INVITED" : member.status === "suspended" ? "⊘ SUSPENDED" : "● ACTIVE"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">{member.email}</p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  Member since {formatDate(member.joinedAt, { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Signature Interaction #2: Member Access Map */}
            <MemberAccessMap
              organizationName={organizationName}
              memberName={member.displayName}
              roleName={member.roleName}
              roleCode={member.roleCode}
              teams={member.teams}
              capabilities={member.capabilities}
              status={member.status}
              onViewPermissions={() => setPermissionsDialogOpen(true)}
            />

            {/* Editorial Section 1: ACCESS */}
            <div className="space-y-2 rounded-xl border border-border/70 bg-surface/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  ASSIGNED ROLE & PERMISSIONS
                </span>
                <div className="flex items-center gap-2">
                  <RoleBadge role={member.roleName} isSystem={member.isSystemRole} />
                  {canManageMembers && !member.isCurrentUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onChangeRoleClick(member)}
                      className="h-6 text-[11px] font-mono text-primary hover:text-primary/90 px-2 cursor-pointer"
                    >
                      Edit access →
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {member.roleDescription ||
                  "Holds standard operational authority assigned to this workspace role tier."}
              </p>
              {member.capabilities && member.capabilities.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1">
                  {member.capabilities.slice(0, 4).map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface border border-border text-foreground/80 truncate max-w-[220px]"
                    >
                      • {c}
                    </span>
                  ))}
                  {member.capabilities.length > 4 && (
                    <button
                      onClick={() => setPermissionsDialogOpen(true)}
                      className="text-[10px] font-mono text-primary hover:underline px-1 py-0.5 cursor-pointer"
                    >
                      +{member.capabilities.length - 4} more
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Editorial Section 2: TEAMS */}
            <div className="space-y-2 rounded-xl border border-border/70 bg-surface/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  COLLABORATION TEAMS ({member.teams.length})
                </span>
                {canManageMembers && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onManageTeamsClick(member)}
                    className="h-6 text-[11px] font-mono text-primary hover:text-primary/90 px-2 cursor-pointer"
                  >
                    Manage teams →
                  </Button>
                )}
              </div>

              {member.teams.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No operational teams assigned. Member holds direct organization authority.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {member.teams.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 text-xs font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Editorial Section 3: SECURITY & LIFECYCLE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Security Credentials */}
              <div className="p-3.5 rounded-xl border border-border/70 bg-surface/40 space-y-2 font-mono text-xs">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
                  SECURITY SIGNALS
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground text-[11px]">
                      EMAIL VERIFIED
                    </span>
                  </div>
                  {member.security.isGoogleConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-muted-foreground text-[11px]">
                        GOOGLE SSO CONNECTED
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      <span className="text-[11px]">PASSWORD AUTH</span>
                    </div>
                  )}
                  {member.security.isMobileVerified ? (
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground text-[11px]">
                        MOBILE VERIFIED
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      <span className="text-[11px]">MOBILE UNLINKED</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Membership Lifecycle */}
              <div className="p-3.5 rounded-xl border border-border/70 bg-surface/40 space-y-2 font-mono text-xs">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
                  MEMBERSHIP
                </span>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">
                      JOINED WORKSPACE
                    </span>
                    <span className="font-medium text-foreground text-[11px]">
                      {formatDate(member.joinedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">
                      LAST DETECTED USE
                    </span>
                    <span className="font-medium text-foreground text-[11px]">
                      {formatDate(member.lastActiveAt || member.joinedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Section 4: RECENT SUPABASE ACTIVITY */}
            <div className="space-y-2.5 rounded-xl border border-border/70 bg-surface/40 p-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  RECENT AUDIT ACTIVITY
                </span>
                <span className="text-[10px] text-muted-foreground">
                  SUPABASE AUDIT LOG
                </span>
              </div>

              {loadingActivity ? (
                <div className="py-4 text-center text-muted-foreground text-xs">
                  Loading activity trail...
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No recorded operations detected for this member.
                </p>
              ) : (
                <div className="space-y-2 pt-1">
                  {recentActivity.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-lg border border-border/60 bg-surface/70 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-foreground uppercase tracking-tight">
                          {evt.action}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDate(evt.createdAt, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Target: {evt.resourceType} ({evt.resourceId.substring(0, 8)}...)
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Editorial Section 5: DANGER / ACCESS CONTROL */}
            {canManageMembers && !member.isCurrentUser && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                  <ShieldAlert className="h-4 w-4" />
                  <span>DANGER / ACCESS CONTROL</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Consequential membership actions. Modifying these states revokes or limits operational capabilities across NXTQR.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {isSuspended ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestoreClick(member)}
                      className="h-8 text-xs font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Restore access</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isOwner}
                      onClick={() => onSuspendClick(member)}
                      className="h-8 text-xs font-medium border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 gap-1.5 cursor-pointer"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Suspend access</span>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isOwner}
                    onClick={() => onRemoveClick(member)}
                    className="h-8 text-xs font-medium border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 gap-1.5 cursor-pointer"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    <span>Remove member</span>
                  </Button>
                </div>

                {isOwner && (
                  <p className="text-[10px] text-muted-foreground italic">
                    Sole Workspace Owner is protected from suspension and removal. Transfer ownership first.
                  </p>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Granular Permission Explorer Dialog */}
      <PermissionExplorerDialog
        isOpen={permissionsDialogOpen}
        onClose={() => setPermissionsDialogOpen(false)}
        roleName={member.roleName}
        capabilities={member.capabilities || []}
      />
    </>
  );
}
