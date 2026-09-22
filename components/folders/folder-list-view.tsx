"use client";

import * as React from "react";
import Link from "next/link";
import { FolderResponseV1 } from "@nxtqr/contracts";
import { getFolderAccent } from "./folder-accents";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeTime } from "@/lib/utils";

export interface FolderListViewProps {
  folders: FolderResponseV1[];
  orgSlug: string;
  onEdit?: (folder: FolderResponseV1) => void;
  onDelete?: (folder: FolderResponseV1) => void;
  onArchiveToggle?: (folder: FolderResponseV1) => void;
}

export function FolderListView({
  folders,
  orgSlug,
  onEdit,
  onDelete,
  onArchiveToggle,
}: FolderListViewProps) {
  return (
    <div className="rounded-xl border border-border/80 dark:border-white/[0.08] bg-white dark:bg-[#18181B] overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40 dark:bg-white/[0.02]">
          <TableRow className="border-border/60 dark:border-white/[0.06] hover:bg-transparent">
            <TableHead className="w-[340px] text-xs font-mono uppercase">Folder Workspace</TableHead>
            <TableHead className="text-xs font-mono uppercase text-center">QR Assets</TableHead>
            <TableHead className="text-xs font-mono uppercase hidden md:table-cell">Visual Accent</TableHead>
            <TableHead className="text-xs font-mono uppercase hidden sm:table-cell">Status</TableHead>
            <TableHead className="text-xs font-mono uppercase hidden lg:table-cell">Last Updated</TableHead>
            <TableHead className="w-[80px] text-right text-xs font-mono uppercase">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {folders.map((folder) => {
            const accent = getFolderAccent(folder.accentKey);
            const href = `/${orgSlug}/folders/${folder.id}`;

            return (
              <TableRow
                key={folder.id}
                className="group border-border/60 dark:border-white/[0.06] hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Folder Identity */}
                <TableCell className="py-3">
                  <Link href={href} className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-md flex items-center justify-center text-base shrink-0 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${accent.dotColor}1A` }}
                    >
                      <span aria-hidden="true">{folder.emoji || "📁"}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {folder.name}
                      </div>
                      {folder.description && (
                        <div className="text-[11px] text-muted-foreground truncate max-w-[260px]">
                          {folder.description}
                        </div>
                      )}
                    </div>
                  </Link>
                </TableCell>

                {/* QR Assets Count */}
                <TableCell className="py-3 text-center">
                  <Link href={href}>
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs font-medium px-2 py-0.5"
                    >
                      {folder.qrCount}
                    </Badge>
                  </Link>
                </TableCell>

                {/* Accent */}
                <TableCell className="py-3 hidden md:table-cell">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: accent.dotColor }}
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {accent.label}
                    </span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-3 hidden sm:table-cell">
                  <Badge
                    variant={folder.status === "active" ? "outline" : "secondary"}
                    className="text-[10px] font-mono uppercase tracking-wider"
                  >
                    {folder.status}
                  </Badge>
                </TableCell>

                {/* Updated At */}
                <TableCell className="py-3 text-xs text-muted-foreground font-mono hidden lg:table-cell" suppressHydrationWarning>
                  {formatRelativeTime(folder.updatedAt)}
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <NxtqrIcon icon="solar:menu-dots-bold" size={15} />
                        <span className="sr-only">Folder menu</span>
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
                            {folder.status === "archived" ? "Unarchive" : "Archive"}
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
