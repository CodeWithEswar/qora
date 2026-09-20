"use client";

import * as React from "react";
import Link from "next/link";
import { UserPlus, Shield, MoreHorizontal, Settings, Activity, History, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrganizationHeaderProps {
  orgSlug: string;
  onInviteClick: () => void;
  onManageRolesClick: () => void;
  canInvite?: boolean;
  canManageRoles?: boolean;
}

export function OrganizationHeader({
  orgSlug,
  onInviteClick,
  onManageRolesClick,
  canInvite = true,
  canManageRoles = true,
}: OrganizationHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Breadcrumb & Eyebrow */}
      <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-muted-foreground">
        <Link
          href={`/${orgSlug}`}
          className="hover:text-foreground transition-colors"
        >
          Workspace
        </Link>
        <ChevronRight className="h-3 w-3 opacity-50" />
        <span className="text-primary font-medium">Access Control</span>
      </div>

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono uppercase tracking-widest mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            ORGANIZATION / ACCESS CONTROL
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-foreground font-serif leading-tight sm:leading-snug">
            People, permissions, and publishing authority.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Manage who can access this workspace, what they can change, and which actions require elevated authority across the edge routing infrastructure.
          </p>
        </div>

        {/* Header Action Buttons - responsive layout for mobile */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <Button
            size="sm"
            onClick={onInviteClick}
            disabled={!canInvite}
            className="flex-1 sm:flex-none gap-2 text-xs h-9 px-3.5 shadow-sm bg-primary hover:bg-primary/90 text-white justify-center"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Invite members</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onManageRolesClick}
            disabled={!canManageRoles}
            className="flex-1 sm:flex-none gap-2 text-xs h-9 px-3 border-border hover:bg-surface-hover justify-center"
          >
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Manage roles</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 shrink-0 border border-border/80 hover:bg-surface-hover"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link
                  href={`/${orgSlug}/settings`}
                  className="flex items-center gap-2 text-xs cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Organization settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/${orgSlug}/activity`}
                  className="flex items-center gap-2 text-xs cursor-pointer"
                >
                  <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>View activity</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/${orgSlug}/audit`}
                  className="flex items-center gap-2 text-xs cursor-pointer"
                >
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Security audit</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
