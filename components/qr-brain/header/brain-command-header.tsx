"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeSwitcher } from "@/components/shell/theme-switcher";

interface BrainCommandHeaderProps {
  orgSlug: string;
  qrId: string;
  qrName: string;
  publicUrl?: string;
  publishedRevision: number;
  hasUnpublishedChanges: boolean;
  saveStatus: "saved" | "saving" | "unsaved" | "error";
  conflictCount: number;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onOpenSignal: () => void;
  onOpenConflicts: () => void;
  onOpenSimulator: () => void;
  onOpenPublish: () => void;
  onResetDraft: () => void;
}

export function BrainCommandHeader({
  orgSlug,
  qrId,
  qrName,
  publicUrl,
  publishedRevision,
  hasUnpublishedChanges,
  saveStatus,
  conflictCount,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onOpenSignal,
  onOpenConflicts,
  onOpenSimulator,
  onOpenPublish,
  onResetDraft,
}: BrainCommandHeaderProps) {
  return (
    <header className="border-b border-border/80 bg-background/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2 sm:py-3 transition-all">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between max-w-[1600px] mx-auto">
        {/* Left: Breadcrumbs + Title + Metadata */}
        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          {/* Breadcrumb path */}
          <nav className="flex items-center gap-1 sm:gap-1.5 text-xs text-muted-foreground font-mono truncate">
            <Link
              href={`/${orgSlug}/qr`}
              className="hover:text-foreground transition-colors truncate max-w-[90px] sm:max-w-[120px]"
            >
              {orgSlug}
            </Link>
            <span>/</span>
            <Link
              href={`/${orgSlug}/qr`}
              className="hover:text-foreground transition-colors hidden sm:inline"
            >
              QR Codes
            </Link>
            <span className="hidden sm:inline">/</span>
            <Link
              href={`/${orgSlug}/qr/${qrId}`}
              className="hover:text-foreground transition-colors font-medium text-foreground truncate max-w-[120px] sm:max-w-[160px]"
            >
              {qrName}
            </Link>
            <span>/</span>
            <span className="text-primary font-semibold shrink-0">QR Brain</span>
          </nav>

          {/* Title & Metadata row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <h1 className="text-lg sm:text-2xl font-serif font-bold tracking-tight text-foreground flex items-center gap-1.5 sm:gap-2">
              <span>QR Brain</span>
              <span className="text-[10px] sm:text-xs font-mono font-medium tracking-normal text-muted-foreground uppercase px-1.5 sm:px-2 py-0.5 rounded-md border border-border bg-muted/40 shrink-0">
                Decision Studio
              </span>
            </h1>

            {/* Dynamic Status Badges */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <Badge variant="outline" className="hidden sm:inline-flex bg-primary/5 text-primary border-primary/20 text-[10px] gap-1">
                <Icon icon="solar:bolt-bold" className="w-3 h-3 text-primary" />
                Dynamic Routing
              </Badge>

              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border bg-card">
                Rev {publishedRevision}
              </Badge>

              {/* Save status badge */}
              {saveStatus === "saving" && (
                <Badge variant="outline" className="text-[10px] text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                  Saving…
                </Badge>
              )}

              {saveStatus === "saved" && !hasUnpublishedChanges && (
                <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  Saved
                </Badge>
              )}

              {(saveStatus === "unsaved" || hasUnpublishedChanges) && saveStatus !== "saving" && (
                <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-300 border-amber-500/40 bg-amber-500/10 gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                  Draft
                </Badge>
              )}

              {saveStatus === "error" && (
                <Badge variant="danger" className="text-[10px] gap-1">
                  <Icon icon="solar:danger-triangle-bold" className="w-3 h-3" />
                  Save Failed
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 justify-end shrink-0">
          {/* Undo / Redo controls (hidden on small screens, accessible in more menu) */}
          <TooltipProvider delayDuration={200}>
            <div className="hidden md:flex items-center border border-border/80 rounded-lg p-0.5 bg-muted/20 mr-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={!canUndo}
                    onClick={onUndo}
                    aria-label="Undo edit"
                  >
                    <Icon icon="solar:undo-left-round-linear" className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Undo change</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={!canRedo}
                    onClick={onRedo}
                    aria-label="Redo edit"
                  >
                    <Icon icon="solar:undo-right-round-linear" className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Redo change</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Routing Signal Button (hidden on mobile, visible on sm+) */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSignal}
            className="hidden sm:inline-flex h-8 text-xs font-mono gap-1.5 border-border hover:bg-card hover:text-primary transition-colors"
          >
            <Icon icon="solar:chart-2-bold" className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span className="hidden md:inline">Routing</span> Signal
          </Button>

          {/* Conflict Lens Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenConflicts}
            className={`h-8 text-xs font-mono gap-1.5 border-border transition-colors ${
              conflictCount > 0
                ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                : "hover:bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon icon="solar:shield-warning-bold" className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="hidden sm:inline">Conflicts</span>
            {conflictCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                {conflictCount}
              </span>
            )}
          </Button>

          {/* Simulate Scan Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSimulator}
            className="h-8 text-xs font-mono gap-1.5 border-border hover:border-primary/50 text-foreground transition-all"
          >
            <Icon icon="solar:play-bold" className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Simulate</span>
          </Button>

          {/* Review & Publish Primary CTA */}
          <Button
            size="sm"
            onClick={onOpenPublish}
            disabled={conflictCount > 0}
            className="h-8 text-xs font-mono gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all font-semibold shrink-0"
          >
            <Icon icon="solar:cloud-upload-bold" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Review & Publish</span>
            <span className="sm:hidden">Publish</span>
          </Button>

          {/* Theme switcher */}
          <ThemeSwitcher className="h-8 w-8 shrink-0" />

          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                aria-label="More options"
              >
                <Icon icon="solar:menu-dots-bold" className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 text-xs font-mono bg-white dark:bg-[#181818] border border-border shadow-2xl text-foreground">
              {/* On mobile, expose Routing Signal */}
              <DropdownMenuItem onClick={onOpenSignal} className="sm:hidden">
                <Icon icon="solar:chart-2-bold" className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                Routing Signal
              </DropdownMenuItem>
              {/* On mobile, expose Undo / Redo */}
              <DropdownMenuItem onClick={onUndo} disabled={!canUndo} className="md:hidden">
                <Icon icon="solar:undo-left-round-linear" className="w-3.5 h-3.5 mr-2" />
                Undo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRedo} disabled={!canRedo} className="md:hidden">
                <Icon icon="solar:undo-right-round-linear" className="w-3.5 h-3.5 mr-2" />
                Redo
              </DropdownMenuItem>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem asChild>
                <Link href={`/${orgSlug}/qr/${qrId}`}>
                  <Icon icon="solar:qr-code-bold" className="w-3.5 h-3.5 mr-2" />
                  QR Overview
                </Link>
              </DropdownMenuItem>
              {publicUrl && (
                <DropdownMenuItem asChild>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <Icon icon="solar:link-square-bold" className="w-3.5 h-3.5 mr-2" />
                    Open Public URL
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onResetDraft}
                className="text-destructive focus:text-destructive"
              >
                <Icon icon="solar:restart-bold" className="w-3.5 h-3.5 mr-2" />
                Reset to Published
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
