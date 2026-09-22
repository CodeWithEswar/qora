"use client";

import * as React from "react";
import Link from "next/link";
import { FolderResponseV1 } from "@nxtqr/contracts";
import { getFolderAccent } from "./folder-accents";
import { FolderFieldCornerModules } from "./folder-field-corner-modules";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";

export interface FolderTileProps {
  folder: FolderResponseV1;
  orgSlug: string;
  onEdit?: (folder: FolderResponseV1) => void;
  onDelete?: (folder: FolderResponseV1) => void;
  onArchiveToggle?: (folder: FolderResponseV1) => void;
  className?: string;
}

export function FolderTile({
  folder,
  orgSlug,
  onEdit,
  onDelete,
  onArchiveToggle,
  className,
}: FolderTileProps) {
  const accent = getFolderAccent(folder.accentKey);
  const href = `/${orgSlug}/folders/${folder.id}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl p-4 transition-all duration-200",
        "bg-white dark:bg-[#18181B] border border-border/80 dark:border-white/[0.08]",
        "hover:shadow-md hover:border-border-strong dark:hover:border-white/20",
        "hover:-translate-y-0.5",
        accent.borderHover,
        className
      )}
    >
      {/* Deterministic QR module containment geometry */}
      <FolderFieldCornerModules accentDotColor={accent.dotColor} />

      {/* Top Header: Identity & Actions */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <Link href={href} className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center text-lg shrink-0 transition-transform duration-150 group-hover:scale-105",
              accent.badgeBg
            )}
          >
            <span aria-hidden="true">{folder.emoji || "📁"}</span>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
              {folder.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: accent.dotColor }}
              />
              <span className="text-[11px] font-mono text-muted-foreground/80">
                {accent.label}
              </span>
              {folder.status === "archived" && (
                <Badge
                  variant="outline"
                  className="h-4 px-1 text-[9px] uppercase tracking-wider font-mono bg-muted/40 text-muted-foreground border-border/60"
                >
                  Archived
                </Badge>
              )}
            </div>
          </div>
        </Link>

        {/* Overflow Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0 rounded-md -mr-1"
            >
              <NxtqrIcon icon="solar:menu-dots-bold" size={15} />
              <span className="sr-only">Folder options for {folder.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-xs">
            <DropdownMenuItem asChild>
              <Link href={href} className="flex items-center gap-2">
                <NxtqrIcon icon="solar:folder-open-linear" size={14} />
                <span>Open Space</span>
              </Link>
            </DropdownMenuItem>

            {onEdit && (
              <DropdownMenuItem
                onClick={() => onEdit(folder)}
                className="flex items-center gap-2"
              >
                <NxtqrIcon icon="solar:pen-linear" size={14} />
                <span>Edit Folder</span>
              </DropdownMenuItem>
            )}

            {onArchiveToggle && (
              <DropdownMenuItem
                onClick={() => onArchiveToggle(folder)}
                className="flex items-center gap-2"
              >
                <NxtqrIcon icon="solar:archive-linear" size={14} />
                <span>
                  {folder.status === "archived" ? "Unarchive Folder" : "Archive Folder"}
                </span>
              </DropdownMenuItem>
            )}

            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(folder)}
                  className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <NxtqrIcon icon="solar:trash-bin-trash-linear" size={14} />
                  <span>Delete Folder</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      {folder.description ? (
        <p className="relative z-10 text-xs text-muted-foreground/90 line-clamp-2 mt-2 min-h-[32px]">
          {folder.description}
        </p>
      ) : (
        <div className="min-h-[32px]" />
      )}

      {/* Bottom Footer: Real Counts & Visual QR Micro-Rail */}
      <Link href={href} className="relative z-10 pt-3 border-t border-border/40 dark:border-white/[0.05] flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "font-mono text-[11px] font-medium h-5 px-1.5 transition-colors",
              folder.qrCount > 0
                ? "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15"
                : "bg-muted/40 text-muted-foreground border-border/40"
            )}
          >
            {folder.qrCount} {folder.qrCount === 1 ? "QR asset" : "QR assets"}
          </Badge>

          {/* Micro QR Glyphs Preview */}
          {folder.qrCount > 0 && (
            <div className="flex items-center gap-0.5 text-muted-foreground/60 dark:text-muted-foreground/40 font-mono text-[10px]">
              <span className="text-[11px]">▦</span>
              {folder.qrCount > 1 && <span className="text-[11px]">▦</span>}
              {folder.qrCount > 2 && <span className="text-[11px]">▦</span>}
              {folder.qrCount > 3 && (
                <span className="text-[9px] font-medium ml-0.5">+{folder.qrCount - 3}</span>
              )}
            </div>
          )}
        </div>

        <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0" suppressHydrationWarning>
          Updated {formatRelativeTime(folder.updatedAt)}
        </span>
      </Link>
    </div>
  );
}
