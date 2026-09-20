"use client";

import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { QrIdentityCell } from "./qr-identity-cell";
import { ColumnVisibility } from "./qr-command-bar";
import { QrResponseV1 } from "@nxtqr/contracts";
import { cleanDomainFromUrl, QrTypeIcon } from "@/components/icons/qr-type-icon";
import {
  MoreHorizontal,
  ExternalLink,
  Edit,
  Copy,
  Download,
  PauseCircle,
  PlayCircle,
  Archive,
  Trash2,
  FolderInput,
  BarChart2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

export interface QrTableProps {
  items: QrResponseV1[];
  orgSlug: string;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  columns: ColumnVisibility;
  onInspect: (qr: QrResponseV1) => void;
  onDuplicate: (qr: QrResponseV1) => void;
  onMove: (qr: QrResponseV1) => void;
  onDownload: (qr: QrResponseV1) => void;
  onPauseResume: (qr: QrResponseV1) => void;
  onArchive: (qr: QrResponseV1) => void;
  onDelete: (qr: QrResponseV1) => void;
}

export function QrTable({
  items,
  orgSlug,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  columns,
  onInspect,
  onDuplicate,
  onMove,
  onDownload,
  onPauseResume,
  onArchive,
  onDelete,
}: QrTableProps) {
  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 30) return `${diffDays}d ago`;
      return formatDate(date);
    } catch {
      return "—";
    }
  };

  return (
    <TooltipProvider delayDuration={250}>
      <div className="rounded-xl border border-border/80 bg-white dark:bg-[#141414] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-50/80 dark:bg-[#181818]/80 border-b border-border/70">
              <TableRow className="hover:bg-transparent">
                {/* Select All Checkbox */}
                <TableHead className="w-10 px-3 text-center">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={onToggleSelectAll}
                    aria-label="Select all QR codes"
                    className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </TableHead>

                {/* Signal Rail Column Header */}
                <TableHead className="w-6 px-1 text-center" aria-label="Signal rail" />

                {/* Main QR Identity */}
                <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  QR Identity
                </TableHead>

                {/* Destination */}
                {columns.destination && (
                  <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Destination
                  </TableHead>
                )}

                {/* Campaign */}
                {columns.campaign && (
                  <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Campaign
                  </TableHead>
                )}

                {/* Scans */}
                {columns.scans && (
                  <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground text-right">
                    Scans
                  </TableHead>
                )}

                {/* Status */}
                {columns.status && (
                  <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                )}

                {/* Owner */}
                {columns.owner && (
                  <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Owner
                  </TableHead>
                )}

                {/* Updated */}
                {columns.updated && (
                  <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Updated
                  </TableHead>
                )}

                {/* Actions */}
                <TableHead className="w-12 text-right pr-4" aria-label="Actions" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((qr) => {
                const isSelected = selectedIds.has(qr.id);
                const isPaused = qr.status === "PAUSED";
                const isActive = qr.status === "ACTIVE";
                const domainInfo = qr.destinationUrl ? cleanDomainFromUrl(qr.destinationUrl) : null;

                return (
                  <TableRow
                    key={qr.id}
                    onClick={() => onInspect(qr)}
                    className={cn(
                      "group relative cursor-pointer border-b border-border/50 transition-colors duration-150 h-[70px]",
                      "hover:bg-[#FFFDF7] dark:hover:bg-[#1a1a1a]",
                      isSelected && "bg-primary/[0.04] dark:bg-primary/[0.08]"
                    )}
                  >
                    {/* Checkbox */}
                    <TableCell
                      className="px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(qr.id)}
                        aria-label={`Select ${qr.name}`}
                        className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableCell>

                    {/* NXTQR Signal Rail Node: ■ travels subtly toward identity on hover */}
                    <TableCell className="px-1 text-center select-none" aria-hidden="true">
                      <div className="relative flex items-center justify-center w-5 h-5">
                        {/* Module square */}
                        <span
                          className={cn(
                            "h-2 w-2 rounded-[1px] transition-all duration-200",
                            isSelected
                              ? "bg-primary shadow-xs"
                              : "bg-border group-hover:bg-primary/80"
                          )}
                        />
                        {/* Directional beam traveling toward identity on hover */}
                        <span
                          className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2 h-[1.5px] rounded-full bg-primary/60 transition-all duration-200 pointer-events-none",
                            "opacity-0 w-0 group-hover:opacity-100 group-hover:w-3.5",
                            isSelected && "opacity-100 w-3.5 bg-primary"
                          )}
                        />
                      </div>
                    </TableCell>

                    {/* QR Identity Cell */}
                    <TableCell className="py-2.5">
                      <QrIdentityCell
                        id={qr.id}
                        name={qr.name}
                        slug={qr.slug}
                        qrType={qr.type}
                        mode={qr.mode as any}
                        destinationUrl={qr.destinationUrl}
                        scanUrl={qr.scanUrl}
                        design={qr.design}
                        onInspect={() => onInspect(qr)}
                      />
                    </TableCell>

                    {/* Destination Cell with Domain Icon */}
                    {columns.destination && (
                      <TableCell className="py-2.5 max-w-[240px]">
                        {domainInfo ? (
                          <div className="flex items-center gap-2 group/dest">
                            <div className="h-5 w-5 shrink-0 rounded-xs border border-border/70 bg-neutral-100/70 dark:bg-[#1a1a1a] flex items-center justify-center p-0.5 overflow-hidden shadow-3xs">
                              <QrTypeIcon
                                type={domainInfo.brandKey || qr.type || "url"}
                                domain={domainInfo.cleanDomain}
                                faviconUrl={domainInfo.faviconUrl}
                                size={13}
                                tone="brand"
                              />
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-mono text-xs text-foreground hover:text-primary transition-colors truncate font-medium">
                                  {domainInfo.cleanDomain || qr.destinationUrl}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs break-all font-mono text-xs">
                                {qr.destinationUrl}
                              </TooltipContent>
                            </Tooltip>
                            <a
                              href={qr.destinationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-foreground opacity-60 group-hover/dest:opacity-100 transition-opacity"
                              title="Open destination in new tab"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                        <div className="text-[11px] text-muted-foreground/70 truncate pl-7">
                          {qr.mode === "dynamic" ? "Dynamic route" : "Direct static"}
                        </div>
                      </TableCell>
                    )}

                    {/* Campaign Cell */}
                    {columns.campaign && (
                      <TableCell className="py-2.5 max-w-[150px]">
                        {qr.campaignName ? (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium text-foreground truncate border border-border/60">
                            {qr.campaignName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    )}

                    {/* Scans Telemetry */}
                    {columns.scans && (
                      <TableCell className="py-2.5 text-right font-mono text-xs tabular-nums text-foreground">
                        {typeof qr.scans === "number" ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold">{qr.scans.toLocaleString()}</div>
                            {typeof qr.uniqueScans === "number" && qr.uniqueScans > 0 && (
                              <div className="text-[10px] text-muted-foreground">
                                {qr.uniqueScans.toLocaleString()} unique
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}

                    {/* Status Cell */}
                    {columns.status && (
                      <TableCell className="py-2.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                            isActive && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
                            isPaused && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
                            !isActive && !isPaused && "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border border-border/80"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              isActive ? "bg-emerald-600 dark:bg-emerald-400" : isPaused ? "bg-amber-500" : "bg-neutral-400"
                            )}
                          />
                          <span>
                            {qr.status ? qr.status.charAt(0) + qr.status.slice(1).toLowerCase() : "Active"}
                          </span>
                        </span>
                      </TableCell>
                    )}

                    {/* Owner Cell */}
                    {columns.owner && (
                      <TableCell className="py-2.5 max-w-[140px]">
                        {qr.ownerName ? (
                          <div className="flex items-center gap-2 truncate">
                            <Avatar className="h-5 w-5 shrink-0">
                              {qr.ownerAvatarUrl && <AvatarImage src={qr.ownerAvatarUrl} />}
                              <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                {qr.ownerName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-foreground truncate">{qr.ownerName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    )}

                    {/* Updated Cell */}
                    {columns.updated && (
                      <TableCell className="py-2.5" suppressHydrationWarning>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className="text-xs text-muted-foreground font-mono cursor-default"
                              suppressHydrationWarning
                            >
                              {formatRelativeTime(qr.updatedAt)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs font-mono">
                            {formatDateTime(qr.updatedAt)}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    )}

                    {/* Action Dropdown */}
                    <TableCell
                      className="py-2.5 text-right pr-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
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
                            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete Permanently</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}
