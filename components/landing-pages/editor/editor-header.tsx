"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { ThemeSwitcher } from "@/components/shell/theme-switcher";
import { cn } from "@/lib/utils";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error" | "conflict";

interface EditorHeaderProps {
  pageName: string;
  pageSlug: string;
  pageStatus: "draft" | "published" | "archived";
  orgSlug: string;
  saveStatus: SaveStatus;
  device: "phone" | "tablet" | "desktop";
  onDeviceChange: (device: "phone" | "tablet" | "desktop") => void;
  onOpenPublish: () => void;
  onOpenPreview: () => void;
  onManualSave: () => void;
  onOpenSettings: () => void;
  isLeftPanelOpen?: boolean;
  isRightPanelOpen?: boolean;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
}

export function EditorHeader({
  pageName,
  pageSlug,
  pageStatus,
  orgSlug,
  saveStatus,
  device,
  onDeviceChange,
  onOpenPublish,
  onOpenPreview,
  onManualSave,
  onOpenSettings,
  isLeftPanelOpen = true,
  isRightPanelOpen = true,
  onToggleLeftPanel,
  onToggleRightPanel,
}: EditorHeaderProps) {
  const isPublished = pageStatus === "published";

  return (
    <header className="sticky top-0 z-30 h-14 w-full border-b border-border bg-surface/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0 transition-colors">
      {/* Left: Mobile Drawer Trigger, Back Link & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("nxtqr:open-mobile-sidebar"))}
          className="inline-flex md:hidden h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer select-none shrink-0"
          aria-label="Open sidebar menu"
        >
          <NxtqrIcon icon="solar:hamburger-menu-linear" size={16} />
        </button>

        <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
          <Link href={`/${orgSlug}/landing-pages`}>
            <NxtqrIcon icon="solar:arrow-left-linear" size={16} className="mr-1" />
            <span className="hidden sm:inline">Landing Pages</span>
          </Link>
        </Button>

        <div className="h-4 w-px bg-border/80 hidden sm:block" />

        {onToggleLeftPanel && (
          <button
            type="button"
            onClick={onToggleLeftPanel}
            title={isLeftPanelOpen ? "Collapse Blocks Panel" : "Expand Blocks Panel"}
            className={cn(
              "hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer shrink-0",
              !isLeftPanelOpen && "bg-muted/80 text-foreground"
            )}
          >
            <NxtqrIcon icon="solar:sidebar-minimalistic-linear" size={16} />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-sm text-foreground truncate max-w-[140px] sm:max-w-[220px]">
            {pageName}
          </span>

          <Badge
            variant={isPublished ? "default" : "secondary"}
            className={cn(
              "text-[10px] uppercase font-mono px-1.5 py-0 shrink-0",
              isPublished && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            )}
          >
            {pageStatus}
          </Badge>

          <a
            href={`/p/${pageSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary font-mono hidden md:inline truncate transition-colors"
            title="Open published destination in new tab"
          >
            /p/{pageSlug}
          </a>
        </div>
      </div>

      {/* Center: Save State Indicator & Device Switcher */}
      <div className="flex items-center gap-4">
        {/* Device Switcher (Tablet & Desktop only) */}
        <div className="hidden sm:flex items-center border rounded-lg p-0.5 bg-muted/40 text-xs">
          <button
            type="button"
            onClick={() => onDeviceChange("phone")}
            title="Phone (390×844)"
            className={cn(
              "px-2 py-1 rounded-md flex items-center gap-1 transition-colors",
              device === "phone" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <NxtqrIcon icon="solar:smartphone-linear" size={14} />
            <span className="hidden lg:inline text-[11px]">Phone</span>
          </button>

          <button
            type="button"
            onClick={() => onDeviceChange("tablet")}
            title="Tablet (768px)"
            className={cn(
              "px-2 py-1 rounded-md flex items-center gap-1 transition-colors",
              device === "tablet" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <NxtqrIcon icon="solar:tablet-linear" size={14} />
            <span className="hidden lg:inline text-[11px]">Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => onDeviceChange("desktop")}
            title="Desktop"
            className={cn(
              "px-2 py-1 rounded-md flex items-center gap-1 transition-colors",
              device === "desktop" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <NxtqrIcon icon="solar:laptop-linear" size={14} />
            <span className="hidden lg:inline text-[11px]">Desktop</span>
          </button>
        </div>

        {/* Server Autosave State Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5 text-amber-500">
              <NxtqrIcon icon="solar:refresh-linear" size={13} className="animate-spin" />
              <span>Saving…</span>
            </span>
          )}

          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-emerald-500">
              <NxtqrIcon icon="solar:check-circle-bold" size={13} />
              <span>Saved</span>
            </span>
          )}

          {saveStatus === "unsaved" && (
            <button
              type="button"
              onClick={onManualSave}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer underline underline-offset-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Unsaved</span>
            </button>
          )}

          {saveStatus === "error" && (
            <button
              type="button"
              onClick={onManualSave}
              className="flex items-center gap-1.5 text-destructive font-semibold hover:underline"
            >
              <NxtqrIcon icon="solar:danger-triangle-bold" size={13} />
              <span>Save failed (Retry)</span>
            </button>
          )}

          {saveStatus === "conflict" && (
            <span className="flex items-center gap-1.5 text-destructive font-semibold">
              <NxtqrIcon icon="solar:shield-warning-bold" size={13} />
              <span>Conflict (Reload)</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions (ThemeSwitcher, Settings, Inspector Toggle, Preview, Review & Publish) */}
      <div className="flex items-center gap-2">
        <ThemeSwitcher className="h-8 w-8 hidden sm:inline-flex" />

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSettings}
          className="h-8 px-2.5 text-xs gap-1.5 hidden md:inline-flex"
        >
          <NxtqrIcon icon="solar:settings-linear" size={14} />
          <span>Settings</span>
        </Button>

        {onToggleRightPanel && (
          <button
            type="button"
            onClick={onToggleRightPanel}
            title={isRightPanelOpen ? "Collapse Inspector" : "Expand Inspector"}
            className={cn(
              "hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer shrink-0",
              !isRightPanelOpen && "bg-muted/80 text-foreground"
            )}
          >
            <NxtqrIcon icon="solar:slider-vertical-linear" size={16} />
          </button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenPreview}
          className="h-8 px-2.5 text-xs gap-1.5"
        >
          <NxtqrIcon icon="solar:eye-linear" size={14} />
          <span className="hidden sm:inline">Preview</span>
        </Button>

        <Button
          size="sm"
          onClick={onOpenPublish}
          className="h-8 px-3 text-xs font-semibold gap-1.5 bg-[#FA520F] hover:bg-[#FA520F]/90 text-white shadow-xs cursor-pointer"
        >
          <NxtqrIcon icon="solar:upload-track-bold" size={14} />
          <span>Review &amp; Publish</span>
        </Button>
      </div>
    </header>
  );
}
