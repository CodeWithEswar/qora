"use client";

import * as React from "react";
import Link from "next/link";
import { FolderResponseV1 } from "@nxtqr/contracts";
import { getFolderAccent } from "../folder-accents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/utils";

export interface FolderDetailHeaderProps {
  folder: FolderResponseV1;
  orgSlug: string;
  isUnfiled: boolean;
  onAddQr: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchiveToggle?: () => void;
}

export function FolderDetailHeader({
  folder,
  orgSlug,
  isUnfiled,
  onAddQr,
  onEdit,
  onDelete,
  onArchiveToggle,
}: FolderDetailHeaderProps) {
  const accent = getFolderAccent(folder.accentKey);

  return (
    <div className="flex flex-col gap-3 sm:gap-4 pb-4 border-b border-border/80 dark:border-white/[0.08]">
      {/* Breadcrumb */}
      <Breadcrumb className="overflow-x-auto no-scrollbar py-0.5">
        <BreadcrumbList className="text-xs font-mono flex-nowrap whitespace-nowrap">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${orgSlug}`}>Workspace</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${orgSlug}/folders`}>Folders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-none">
              {folder.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title, Identity & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-xs"
            style={{ backgroundColor: `${accent.dotColor}1F` }}
          >
            <span aria-hidden="true">{folder.emoji || (isUnfiled ? "📂" : "📁")}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {isUnfiled ? "System Space" : "Folder Space"}
              </span>
              {!isUnfiled && (
                <div className="flex items-center gap-1">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: accent.dotColor }}
                  />
                  <span className="text-[10px] font-mono text-muted-foreground/90">
                    {accent.label}
                  </span>
                </div>
              )}
              {folder.status === "archived" && (
                <Badge
                  variant="outline"
                  className="h-4 px-1 text-[9px] uppercase tracking-wider font-mono bg-muted/40 text-muted-foreground border-border/60"
                >
                  Archived
                </Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-serif mt-0.5 truncate">
              {folder.name}
            </h1>

            {folder.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl line-clamp-2">
                {folder.description}
              </p>
            )}

            <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-xs font-mono text-muted-foreground">
              <span>
                <strong className="text-foreground font-semibold">{folder.qrCount}</strong>{" "}
                {folder.qrCount === 1 ? "QR asset" : "QR assets"}
              </span>
              <span>•</span>
              <span suppressHydrationWarning>Updated {formatRelativeTime(folder.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <Button
            onClick={onAddQr}
            className="flex-1 sm:flex-initial h-9 gap-1.5 font-medium shadow-sm cursor-pointer text-xs sm:text-sm px-3 sm:px-4"
          >
            <NxtqrIcon icon="solar:add-circle-bold" size={16} />
            <span>Add QR Codes</span>
          </Button>

          {!isUnfiled && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-9 text-xs gap-1.5 font-medium border-border/80 dark:border-white/[0.08] bg-white dark:bg-[#18181B] px-2.5 sm:px-3 cursor-pointer shrink-0"
            >
              <NxtqrIcon icon="solar:pen-linear" size={14} />
              <span>
                Edit<span className="hidden xs:inline sm:inline"> Folder</span>
              </span>
            </Button>
          )}

          {!isUnfiled && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 shrink-0 border-border/80 dark:border-white/[0.08] bg-white dark:bg-[#18181B]"
                >
                  <NxtqrIcon icon="solar:menu-dots-bold" size={16} />
                  <span className="sr-only">More folder options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                {onArchiveToggle && (
                  <DropdownMenuItem
                    onClick={onArchiveToggle}
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
                      onClick={onDelete}
                      className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <NxtqrIcon icon="solar:trash-bin-trash-linear" size={14} />
                      <span>Delete Folder</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
