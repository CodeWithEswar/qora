"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/organization/shared/role-badge";
import type { TeamMemberItem } from "@/lib/supabase/types/teams";
import { formatDate } from "@/lib/utils";
import { UserMinus } from "lucide-react";

interface TeamMemberRowProps {
  member: TeamMemberItem;
  canManage?: boolean;
  onRemoveClick: (member: TeamMemberItem) => void;
}

export function TeamMemberRow({
  member,
  canManage = true,
  onRemoveClick,
}: TeamMemberRowProps) {
  const initials = member.displayName
    ? member.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "MB";

  return (
    <tr className="border-b border-border/50 hover:bg-surface-hover/80 transition-colors h-14 font-mono text-xs">
      {/* Column 1: Identity */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-border shrink-0">
            {member.avatarUrl && (
              <AvatarImage src={member.avatarUrl} alt={member.displayName} />
            )}
            <AvatarFallback className="text-[11px] font-bold bg-muted text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground font-sans truncate text-xs">
                {member.displayName}
              </span>
              {member.isCurrentUser && (
                <span className="text-[9px] text-primary font-bold">(You)</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground block truncate">
              {member.email}
            </span>
          </div>
        </div>
      </td>

      {/* Column 2: Organization Role */}
      <td className="px-4 py-2.5">
        <RoleBadge role={member.roleName} className="text-[10px]" />
      </td>

      {/* Column 3: Team Connection */}
      <td className="px-4 py-2.5 text-muted-foreground text-[11px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          <span>ASSIGNED MEMBER</span>
        </span>
      </td>

      {/* Column 4: Joined */}
      <td className="px-4 py-2.5 text-muted-foreground text-[11px] whitespace-nowrap">
        {formatDate(member.joinedAt)}
      </td>

      {/* Column 5: Actions */}
      <td className="px-4 py-2.5 text-right">
        {canManage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveClick(member)}
            className="h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer text-xs"
            title={`Remove ${member.displayName} from team`}
          >
            <UserMinus className="h-3.5 w-3.5 mr-1" />
            <span>Remove</span>
          </Button>
        )}
      </td>
    </tr>
  );
}
