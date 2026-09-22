"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TeamMark } from "./team-mark";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import type { TeamSummary } from "@/lib/supabase/types/teams";
import { cn } from "@/lib/utils";
import { ArrowRight, MoreVertical, Archive, UserCheck, Trash2, Edit3, Link2, Users } from "lucide-react";

interface TeamCapsuleProps {
  team: TeamSummary;
  isSelected?: boolean;
  onSelectToggle?: (team: TeamSummary) => void;
  onOpenTeam: (team: TeamSummary) => void;
  onManageMembers: (team: TeamSummary) => void;
  onConnectWork: (team: TeamSummary) => void;
  onEditTeam: (team: TeamSummary) => void;
  onArchiveTeam?: (team: TeamSummary) => void;
  onRestoreTeam?: (team: TeamSummary) => void;
  onDeleteTeam: (team: TeamSummary) => void;
  canManage?: boolean;
}

export function TeamCapsule({
  team,
  isSelected = false,
  onSelectToggle,
  onOpenTeam,
  onManageMembers,
  onConnectWork,
  onEditTeam,
  onArchiveTeam,
  onRestoreTeam,
  onDeleteTeam,
  canManage = true,
}: TeamCapsuleProps) {
  const isArchived = team.state === "archived";
  const previewMembers = team.memberPreview || [];
  const remainingCount = Math.max(0, team.memberCount - previewMembers.length);

  const work = team.connectedWork || {
    qrCount: 0,
    campaignCount: 0,
    brandKitCount: 0,
    templateCount: 0,
    domainCount: 0,
    folderCount: 0,
    totalCount: 0,
  };

  const workLabels: string[] = [];
  if (work.campaignCount > 0) workLabels.push(`${work.campaignCount} ${work.campaignCount === 1 ? "Campaign" : "Campaigns"}`);
  if (work.qrCount > 0) workLabels.push(`${work.qrCount} ${work.qrCount === 1 ? "QR Code" : "QR Codes"}`);
  if (work.brandKitCount > 0) workLabels.push(`${work.brandKitCount} ${work.brandKitCount === 1 ? "Brand Kit" : "Brand Kits"}`);
  if (work.domainCount > 0) workLabels.push(`${work.domainCount} ${work.domainCount === 1 ? "Domain" : "Domains"}`);
  if (work.templateCount > 0) workLabels.push(`${work.templateCount} ${work.templateCount === 1 ? "Template" : "Templates"}`);

  return (
    <article
      aria-label={`Team Capsule: ${team.name}`}
      className={cn(
        "rounded-xl border transition-all duration-200 bg-surface/70 hover:bg-surface text-foreground shadow-2xs font-mono",
        isSelected
          ? "border-primary/80 ring-1 ring-primary/40 bg-surface"
          : "border-border/80 hover:border-border"
      )}
    >
      <div className="p-4 sm:p-5 space-y-4">
        {/* Top Header: Mark, Identity & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {onSelectToggle && (
              <input
                type="checkbox"
                aria-label={`Select team ${team.name}`}
                checked={isSelected}
                onChange={() => onSelectToggle(team)}
                className="mt-1.5 h-4 w-4 rounded border-border accent-primary cursor-pointer"
              />
            )}

            <TeamMark name={team.name} id={team.id} size={36} />

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onOpenTeam(team)}
                  className="text-base font-bold text-foreground hover:text-primary transition-colors text-left cursor-pointer truncate font-sans tracking-tight"
                >
                  {team.name}
                </button>
                <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
                  {team.publicId}
                </span>
                {isArchived && (
                  <Badge variant="outline" className="text-[10px] text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/10">
                    ARCHIVED
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground font-sans line-clamp-2">
                {team.description || "Organizes shared responsibility and connected work across NXTQR."}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs font-mono">
              <DropdownMenuItem onClick={() => onOpenTeam(team)}>
                <NxtqrIcon name="team" size={13} className="mr-2" />
                Open team operations
              </DropdownMenuItem>

              {canManage && (
                <>
                  <DropdownMenuItem onClick={() => onManageMembers(team)}>
                    <Users className="h-3.5 w-3.5 mr-2" />
                    Manage members
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onConnectWork(team)}>
                    <Link2 className="h-3.5 w-3.5 mr-2" />
                    Connect work
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onEditTeam(team)}>
                    <Edit3 className="h-3.5 w-3.5 mr-2" />
                    Edit team details
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {isArchived ? (
                    onRestoreTeam && (
                      <DropdownMenuItem onClick={() => onRestoreTeam(team)}>
                        <UserCheck className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                        Restore team
                      </DropdownMenuItem>
                    )
                  ) : (
                    onArchiveTeam && (
                      <DropdownMenuItem onClick={() => onArchiveTeam(team)}>
                        <Archive className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        Archive team
                      </DropdownMenuItem>
                    )
                  )}

                  <DropdownMenuItem
                    onClick={() => onDeleteTeam(team)}
                    className="text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete team
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Middle Section: People & Connected Work Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50 text-xs">
          {/* People Column */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
              PEOPLE · {team.memberCount}
            </span>
            {previewMembers.length === 0 ? (
              <div className="text-[11px] text-muted-foreground italic font-sans">
                No members assigned yet.
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                {previewMembers.slice(0, 4).map((m) => {
                  const initials = m.displayName
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "MB";

                  return (
                    <div
                      key={m.membershipId}
                      className="flex items-center gap-1 bg-surface border border-border/60 rounded-full pl-0.5 pr-2 py-0.5"
                      title={`${m.displayName} (${m.roleName})`}
                    >
                      <Avatar className="h-5 w-5 border border-border/80 text-[9px]">
                        {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.displayName} />}
                        <AvatarFallback className="bg-muted text-foreground text-[9px]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] truncate max-w-[90px] font-sans">
                        {m.displayName}
                      </span>
                    </div>
                  );
                })}

                {remainingCount > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/60 cursor-pointer"
                      >
                        +{remainingCount}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-56 p-2 text-xs font-mono">
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1.5 pb-1 border-b border-border/60">
                        Remaining Team Members
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {previewMembers.slice(4).map((m) => (
                          <div key={m.membershipId} className="flex items-center gap-2 py-1">
                            <span className="text-foreground truncate">{m.displayName}</span>
                            <span className="text-[10px] text-muted-foreground ml-auto">{m.roleName}</span>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}
          </div>

          {/* Connected Work Column */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
              CONNECTED WORK · {work.totalCount}
            </span>
            {workLabels.length === 0 ? (
              <div className="text-[11px] text-muted-foreground italic font-sans">
                No resources connected yet.
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                {workLabels.slice(0, 3).map((lbl, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-border/70 text-[10px] text-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {lbl}
                  </span>
                ))}
                {workLabels.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{workLabels.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Structural Relationship Signal: MEMBERS ─── TEAM ─── CONNECTED WORK */}
        <div className="py-2 px-3 rounded-lg bg-surface/50 border border-border/60 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
            <span className="text-foreground font-semibold">{team.memberCount}</span>
            <span>MEMBERS</span>
          </div>

          <div className="flex items-center gap-1 text-border/90 select-none">
            <span>───</span>
            <span className="text-foreground font-bold text-[9px] uppercase px-1 py-0.5 rounded bg-muted/60 border border-border/50">
              {team.name.slice(0, 8)}
            </span>
            <span>───</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="text-foreground font-semibold">{work.totalCount}</span>
            <span>CONNECTED WORK</span>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-muted-foreground">
            Created {new Date(team.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenTeam(team)}
            className="h-7 px-2.5 text-xs text-primary hover:text-primary/90 hover:bg-primary/10 gap-1.5 cursor-pointer font-mono font-semibold"
          >
            <span>Open team</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </article>
  );
}
