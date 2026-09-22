"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/organization/shared/role-badge";
import type { TeamMemberItem } from "@/lib/supabase/types/teams";
import { ArrowRight, Users, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamPeoplePreviewProps {
  members: TeamMemberItem[];
  memberCount: number;
  canManage?: boolean;
  onManagePeopleClick: () => void;
  onAddMemberClick: () => void;
  className?: string;
}

export function TeamPeoplePreview({
  members,
  memberCount,
  canManage = true,
  onManagePeopleClick,
  onAddMemberClick,
  className,
}: TeamPeoplePreviewProps) {
  const displayMembers = members.slice(0, 4);

  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-surface/60 p-4 sm:p-5 font-mono flex flex-col justify-between space-y-4 shadow-xs",
        className
      )}
    >
      <div className="space-y-3">
        {/* Module Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              PEOPLE · {memberCount}
            </span>
          </div>
          <button
            type="button"
            onClick={onManagePeopleClick}
            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 cursor-pointer font-sans font-semibold"
          >
            <span>Manage people</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Member Preview Items */}
        {members.length === 0 ? (
          <div className="py-6 text-center space-y-2 text-muted-foreground font-sans">
            <p className="text-xs">No workspace members assigned yet.</p>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddMemberClick}
                className="h-7 text-xs gap-1 cursor-pointer font-mono"
              >
                <UserPlus className="h-3 w-3 text-blue-500" />
                <span>Add first member</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {displayMembers.map((member) => {
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
                  key={member.membershipId}
                  className="flex items-center justify-between p-2 rounded-md bg-surface/80 border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-7 w-7 border border-border shrink-0">
                      {member.avatarUrl && (
                        <AvatarImage src={member.avatarUrl} alt={member.displayName} />
                      )}
                      <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground font-sans truncate">
                          {member.displayName}
                        </span>
                        {member.isCurrentUser && (
                          <span className="text-[9px] text-primary font-bold">
                            (You)
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground block truncate">
                        {member.email}
                      </span>
                    </div>
                  </div>

                  <RoleBadge role={member.roleName} className="text-[10px] py-0 shrink-0" />
                </div>
              );
            })}

            {memberCount > displayMembers.length && (
              <div className="text-[10px] text-muted-foreground text-center pt-1 font-sans">
                +{memberCount - displayMembers.length} more members assigned to this team
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Signal */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>RELATIONSHIP: EXPLICIT TENANCY</span>
        <span className="text-foreground font-bold">100% AUDITABLE</span>
      </div>
    </div>
  );
}
