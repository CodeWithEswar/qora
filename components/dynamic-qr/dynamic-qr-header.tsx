"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface DynamicQrHeaderProps {
  orgSlug: string;
  qrId: string;
  qrName: string;
  slug: string;
  host: string;
  status: string;
  publishedRevision: number;
  hasUnpublishedChanges: boolean;
  onTestScan: () => void;
  onInspectResolver: () => void;
  onEditDestination: () => void;
  onPublishClick: () => void;
  onTogglePause: () => void;
  onDeleteClick: () => void;
  isPublishing?: boolean;
}

export function DynamicQrHeader({
  orgSlug,
  qrId,
  qrName,
  slug,
  host,
  status,
  publishedRevision,
  hasUnpublishedChanges,
  onTestScan,
  onInspectResolver,
  onEditDestination,
  onPublishClick,
  onTogglePause,
  onDeleteClick,
  isPublishing = false,
}: DynamicQrHeaderProps) {
  const isPaused = status === "PAUSED";
  const resolverScanUrl = `https://${host}/s/${slug}`;

  return (
    <div className="flex flex-col gap-3 pb-2">
      {/* 1. Breadcrumb row */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        <Link href={`/${orgSlug}`} className="hover:text-foreground transition-colors">
          Workspace
        </Link>
        <Icon icon="hugeicons:arrow-right-01" className="w-3 h-3 opacity-50" />
        <Link href={`/${orgSlug}/qr`} className="hover:text-foreground transition-colors">
          QR Codes
        </Link>
        <Icon icon="hugeicons:arrow-right-01" className="w-3 h-3 opacity-50" />
        <span className="text-foreground truncate max-w-[240px] font-medium">{qrName}</span>
      </nav>

      {/* 2. Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Eyebrow & Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-primary">
              Dynamic QR
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase font-mono px-2 py-0.5 h-4.5 flex items-center gap-1",
                isPaused
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isPaused ? "bg-amber-500" : "bg-emerald-500"
                )}
              />
              <span>{status}</span>
            </Badge>

            {hasUnpublishedChanges && (
              <Badge className="bg-primary/10 text-primary border border-primary/30 text-[10px] font-mono uppercase h-4.5 px-2">
                Draft Changes
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            {qrName}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            Change where this QR resolves without replacing the printed code. Edge routing updates deterministically upon publication.
          </p>
        </div>

        {/* 3. Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Test Scan (Simulation Sandbox) */}
          <Button
            variant="outline"
            size="sm"
            onClick={onTestScan}
            className="h-9 text-xs gap-1.5 bg-surface border-border hover:bg-muted font-medium"
          >
            <Icon icon="hugeicons:play" className="w-3.5 h-3.5 text-primary" />
            <span>Test Scan</span>
          </Button>

          {/* Live Preview / External Link */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5 bg-surface border-border hover:bg-muted font-medium"
          >
            <a href={resolverScanUrl} target="_blank" rel="noopener noreferrer">
              <Icon icon="hugeicons:arrow-up-right-01" className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Preview</span>
            </a>
          </Button>

          {/* More Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 bg-surface border-border hover:bg-muted"
                aria-label="More actions"
              >
                <Icon icon="hugeicons:more-horizontal" className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 text-xs">
              <DropdownMenuItem onClick={onInspectResolver} className="gap-2">
                <Icon icon="hugeicons:terminal" className="w-3.5 h-3.5 text-primary" />
                <span>Inspect Resolver</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${orgSlug}/qr/studio?id=${qrId}`} className="gap-2">
                  <Icon icon="hugeicons:paint-board" className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Customize in Studio</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${orgSlug}/qr/${qrId}/brain`} className="gap-2">
                  <Icon icon="hugeicons:route-01" className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Manage QR Brain</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${orgSlug}/analytics`} className="gap-2">
                  <Icon icon="hugeicons:analytics-01" className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>View Global Analytics</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onTogglePause} className="gap-2">
                {isPaused ? (
                  <>
                    <Icon icon="hugeicons:play" className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Resume QR</span>
                  </>
                ) : (
                  <>
                    <Icon icon="hugeicons:pause" className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pause QR</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDeleteClick}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Icon icon="hugeicons:archive" className="w-3.5 h-3.5" />
                <span>Archive QR</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary Action Button */}
          {hasUnpublishedChanges ? (
            <Button
              onClick={onPublishClick}
              disabled={isPublishing}
              className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-[#CC3A05] text-white gap-2 shadow-xs"
            >
              {isPublishing ? (
                <>
                  <Icon icon="hugeicons:reload" className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing…</span>
                </>
              ) : (
                <>
                  <Icon icon="hugeicons:rocket" className="w-3.5 h-3.5" />
                  <span>Publish Changes</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={onEditDestination}
              className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-[#CC3A05] text-white gap-2 shadow-xs"
            >
              <Icon icon="hugeicons:edit-02" className="w-3.5 h-3.5" />
              <span>Edit Destination</span>
            </Button>
          )}
        </div>
      </div>

      {/* Top Operational Status Subline */}
      <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/50">
        <span>Published Revision: <span className="font-semibold text-foreground">Rev {publishedRevision}</span></span>
        <span>·</span>
        <span>Resolver Target: <span className="font-semibold text-foreground">/s/{slug}</span></span>
        {hasUnpublishedChanges && (
          <>
            <span>·</span>
            <span className="text-primary font-medium">Unpublished draft pending deployment</span>
          </>
        )}
      </div>
    </div>
  );
}
