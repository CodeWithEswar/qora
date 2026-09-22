"use client";

import * as React from "react";
import Link from "next/link";
import { TeamMark } from "@/components/collaborate/teams/team-mark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  UserPlus,
  Link2,
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  Archive,
  RefreshCw,
} from "lucide-react";

interface TeamIdentityBarProps {
  team: {
    id: string;
    publicId: string;
    name: string;
    description?: string | null;
    state: "active" | "archived";
    createdAt: string;
    memberCount: number;
    connectedWorkCount: number;
  };
  organizationSlug: string;
  canManage?: boolean;
  onAddMemberClick: () => void;
  onConnectWorkClick: () => void;
  onEditTeamClick: () => void;
  onArchiveToggleClick: () => void;
  onDeleteTeamClick: () => void;
  className?: string;
}

export function TeamIdentityBar({
  team,
  organizationSlug,
  canManage = true,
  onAddMemberClick,
  onConnectWorkClick,
  onEditTeamClick,
  onArchiveToggleClick,
  onDeleteTeamClick,
  className,
}: TeamIdentityBarProps) {
  const isArchived = team.state === "archived";

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Team link copied", {
        description: "Direct workspace route copied to clipboard.",
      });
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-surface/70 p-4 sm:p-5 font-mono space-y-3.5 shadow-xs",
        className
      )}
    >
      {/* Top Bar: Back Link & Status */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${organizationSlug}/teams`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="uppercase tracking-widest font-semibold text-[11px]">
            TEAMS DIRECTORY
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isArchived ? (
            <Badge variant="outline" className="text-[10px] rounded-md border-border bg-muted/60 text-muted-foreground font-mono">
              ARCHIVED TEAM
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] rounded-md border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-mono">
              ACTIVE TOPOLOGY
            </Badge>
          )}
        </div>
      </div>

      {/* Main Identity: Mark + Title + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-0.5">
        <div className="flex items-start gap-3.5 min-w-0">
          <TeamMark
            name={team.name}
            id={team.id}
            size={44}
            className="rounded-md border border-border/80 shrink-0 shadow-xs"
          />

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-sans text-foreground tracking-tight truncate">
                {team.name}
              </h1>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50 select-all">
                {team.publicId}
              </span>
            </div>

            <p className="text-xs text-muted-foreground font-sans max-w-xl line-clamp-2 leading-relaxed">
              {team.description || "Organizes shared responsibility and connected work across NXTQR."}
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {canManage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddMemberClick}
                className="h-8 text-xs gap-1.5 border-border/80 hover:bg-surface-hover cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add member</span>
                <span className="sm:hidden">Member</span>
              </Button>

              <Button
                size="sm"
                onClick={onConnectWorkClick}
                className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-xs"
              >
                <Link2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Connect work</span>
                <span className="sm:hidden">Work</span>
              </Button>
            </>
          )}

          {/* Action Overflow Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                aria-label="Team actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 font-mono text-xs p-1">
              {canManage && (
                <DropdownMenuItem onClick={onEditTeamClick} className="cursor-pointer">
                  <Edit3 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <span>Edit team details</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                <Copy className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <span>Copy team route</span>
              </DropdownMenuItem>

              {canManage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onArchiveToggleClick} className="cursor-pointer">
                    {isArchived ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                        <span>Restore active status</span>
                      </>
                    ) : (
                      <>
                        <Archive className="h-3.5 w-3.5 mr-2 text-amber-500" />
                        <span>Archive team</span>
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={onDeleteTeamClick}
                    className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    <span>Delete team...</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Factual Lower Identity Baseline */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 border-t border-border/60 text-xs text-muted-foreground">
        <div>
          <span className="text-[10px] uppercase tracking-wider block font-bold">MEMBERS</span>
          <span className="font-bold text-foreground font-mono text-sm">
            {team.memberCount}
          </span>
        </div>

        <span className="text-border/70">│</span>

        <div>
          <span className="text-[10px] uppercase tracking-wider block font-bold">CONNECTED WORK</span>
          <span className="font-bold text-foreground font-mono text-sm">
            {team.connectedWorkCount}
          </span>
        </div>

        <span className="text-border/70">│</span>

        <div>
          <span className="text-[10px] uppercase tracking-wider block font-bold">CREATED</span>
          <span className="text-foreground font-mono text-xs">
            {formatDate(team.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
