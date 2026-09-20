"use client";

import * as React from "react";
import Link from "next/link";
import { QrResponseV1 } from "@nxtqr/contracts";
import { QrThumbnail } from "./qr-thumbnail";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cleanDomainFromUrl, QrTypeIcon } from "@/components/icons/qr-type-icon";
import {
  MoreHorizontal,
  ExternalLink,
  Edit,
  Download,
  Copy,
  PauseCircle,
  PlayCircle,
  Archive,
  Trash2,
  FolderInput,
  BarChart2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface QrGridProps {
  items: QrResponseV1[];
  orgSlug: string;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onInspect: (qr: QrResponseV1) => void;
  onDuplicate: (qr: QrResponseV1) => void;
  onMove: (qr: QrResponseV1) => void;
  onDownload: (qr: QrResponseV1) => void;
  onPauseResume: (qr: QrResponseV1) => void;
  onArchive: (qr: QrResponseV1) => void;
  onDelete: (qr: QrResponseV1) => void;
}

export function QrGrid({
  items,
  orgSlug,
  selectedIds,
  onToggleSelect,
  onInspect,
  onDuplicate,
  onMove,
  onDownload,
  onPauseResume,
  onArchive,
  onDelete,
}: QrGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((qr) => {
        const isSelected = selectedIds.has(qr.id);
        const isPaused = qr.status === "PAUSED";
        const isActive = qr.status === "ACTIVE";
        const domainInfo = qr.destinationUrl ? cleanDomainFromUrl(qr.destinationUrl) : null;

        return (
          <div
            key={qr.id}
            onClick={() => onInspect(qr)}
            className={cn(
              "group relative flex flex-col justify-between rounded-xl border border-border/80 bg-white dark:bg-[#141414] p-4 shadow-xs transition-all duration-150 cursor-pointer overflow-hidden",
              "hover:border-primary/40 hover:shadow-sm",
              isSelected && "border-primary ring-1 ring-primary bg-primary/[0.02]"
            )}
          >
            {/* Top Row: Checkbox, Status & Action menu */}
            <div className="flex items-center justify-between gap-2">
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(qr.id)}
                  aria-label={`Select ${qr.name}`}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium",
                    isActive && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
                    isPaused && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
                    !isActive && !isPaused && "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border border-border"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isActive ? "bg-emerald-600 dark:bg-emerald-400" : isPaused ? "bg-amber-500" : "bg-neutral-400"
                    )}
                  />
                  <span>{qr.status}</span>
                </span>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 text-xs">
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/${orgSlug}/qr/${qr.id}`}
                        className="flex items-center gap-2 cursor-pointer font-medium text-primary"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>Dynamic Control</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/${orgSlug}/qr/studio?id=${qr.id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit in Studio</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onInspect(qr)}>
                      <BarChart2 className="h-3.5 w-3.5" />
                      <span>Quick Inspect</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(qr)}>
                      <Download className="h-3.5 w-3.5" />
                      <span>Download QR</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDuplicate(qr)}>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Duplicate</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMove(qr)}>
                      <FolderInput className="h-3.5 w-3.5" />
                      <span>Move to Campaign</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onPauseResume(qr)}>
                      {isPaused ? (
                        <>
                          <PlayCircle className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Resume</span>
                        </>
                      ) : (
                        <>
                          <PauseCircle className="h-3.5 w-3.5 text-amber-500" />
                          <span>Pause</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onArchive(qr)}>
                      <Archive className="h-3.5 w-3.5 text-neutral-500" />
                      <span>Archive</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(qr)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Middle: Real QR vector thumbnail + identity */}
            <div className="flex flex-col items-center justify-center my-4 space-y-3">
              <QrThumbnail
                slug={qr.slug}
                name={qr.name}
                qrType={qr.type}
                destinationUrl={qr.destinationUrl}
                design={qr.design}
                size="lg"
                interactive={false}
              />
              <div className="text-center space-y-0.5 max-w-full">
                <div className="font-semibold text-sm text-foreground truncate px-2">
                  {qr.name}
                </div>
                <div className="font-mono text-xs text-primary truncate">
                  /q/{qr.slug}
                </div>
              </div>
            </div>

            {/* Bottom: Destination & Scans */}
            <div className="border-t border-border/60 pt-3 space-y-1 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                  {domainInfo && (
                    <div className="h-4 w-4 shrink-0 rounded-xs border border-border/70 bg-neutral-100/70 dark:bg-[#1a1a1a] flex items-center justify-center p-0.5 overflow-hidden">
                      <QrTypeIcon
                        type={domainInfo.brandKey || qr.type || "url"}
                        domain={domainInfo.cleanDomain}
                        faviconUrl={domainInfo.faviconUrl}
                        size={11}
                        tone="brand"
                      />
                    </div>
                  )}
                  <span className="truncate font-mono text-[11px] text-foreground">
                    {domainInfo?.cleanDomain || "No destination"}
                  </span>
                </div>
                {qr.destinationUrl && (
                  <a
                    href={qr.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground">Scans</span>
                <span className="font-mono font-bold text-foreground">
                  {(qr.scans || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
