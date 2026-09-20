"use client";

import * as React from "react";
import Link from "next/link";
import { FolderQrAssetV1 } from "@nxtqr/contracts";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { formatRelativeTime, formatNumber } from "@/lib/utils";

export interface FolderAssetsTableProps {
  assets: FolderQrAssetV1[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onToggleSelect: (id: string) => void;
  onMoveQr: (qr: FolderQrAssetV1) => void;
  onRemoveQr: (qr: FolderQrAssetV1) => void;
  orgSlug: string;
  isUnfiled: boolean;
}

export function FolderAssetsTable({
  assets,
  selectedIds,
  onSelectAll,
  onToggleSelect,
  onMoveQr,
  onRemoveQr,
  orgSlug,
  isUnfiled,
}: FolderAssetsTableProps) {
  const allSelected = assets.length > 0 && selectedIds.length === assets.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <div className="rounded-xl border border-border/80 dark:border-white/[0.08] bg-white dark:bg-[#18181B] overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40 dark:bg-white/[0.02]">
          <TableRow className="border-border/60 dark:border-white/[0.06] hover:bg-transparent">
            <TableHead className="w-[44px] text-center">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
                aria-label="Select all QR codes"
              />
            </TableHead>
            <TableHead className="w-[280px] text-xs font-mono uppercase">QR Asset</TableHead>
            <TableHead className="text-xs font-mono uppercase hidden sm:table-cell">Type</TableHead>
            <TableHead className="text-xs font-mono uppercase hidden md:table-cell">Destination</TableHead>
            <TableHead className="text-xs font-mono uppercase text-center hidden lg:table-cell">Scans</TableHead>
            <TableHead className="text-xs font-mono uppercase text-center">Status</TableHead>
            <TableHead className="text-xs font-mono uppercase hidden xl:table-cell">Updated</TableHead>
            <TableHead className="w-[80px] text-right text-xs font-mono uppercase">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {assets.map((qr) => {
            const isSelected = selectedIds.includes(qr.id);
            const qrHref = `/${orgSlug}/qr/${qr.id}`;

            return (
              <TableRow
                key={qr.id}
                data-state={isSelected ? "selected" : undefined}
                className="group border-border/60 dark:border-white/[0.06] hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Checkbox */}
                <TableCell className="text-center py-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(qr.id)}
                    aria-label={`Select ${qr.name}`}
                  />
                </TableCell>

                {/* Identity */}
                <TableCell className="py-3">
                  <Link href={qrHref} className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-md bg-muted/60 dark:bg-white/[0.04] flex items-center justify-center text-primary font-mono text-base shrink-0 group-hover:bg-primary/10 transition-colors">
                      ▦
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {qr.name}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground truncate">
                        /{qr.slug}
                      </div>
                    </div>
                  </Link>
                </TableCell>

                {/* QR Type */}
                <TableCell className="py-3 hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground">
                    <span className="capitalize">{qr.qrType}</span>
                    {qr.isDynamic && (
                      <span className="text-[9px] px-1 rounded-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                        DYN
                      </span>
                    )}
                  </span>
                </TableCell>

                {/* Destination URL */}
                <TableCell className="py-3 hidden md:table-cell max-w-[220px]">
                  {qr.destinationUrl ? (
                    <a
                      href={qr.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-muted-foreground hover:text-foreground truncate flex items-center gap-1 group/link"
                      title={qr.destinationUrl}
                    >
                      <span className="truncate">{qr.destinationUrl.replace(/^https?:\/\//, "")}</span>
                      <NxtqrIcon
                        icon="solar:arrow-right-up-linear"
                        size={11}
                        className="shrink-0 opacity-60 group-hover/link:opacity-100"
                      />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground/50 italic font-mono">—</span>
                  )}
                </TableCell>

                {/* Scans */}
                <TableCell className="py-3 text-center hidden lg:table-cell">
                  <span className="font-mono text-xs font-medium text-foreground">
                    {formatNumber(qr.totalScans)}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="py-3 text-center">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono uppercase tracking-wider h-5 px-1.5"
                  >
                    {qr.status}
                  </Badge>
                </TableCell>

                {/* Updated At */}
                <TableCell className="py-3 text-xs font-mono text-muted-foreground hidden xl:table-cell">
                  {formatRelativeTime(qr.updatedAt)}
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
                        <span className="sr-only">QR actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 text-xs">
                      <DropdownMenuItem asChild>
                        <Link href={qrHref} className="flex items-center gap-2">
                          <NxtqrIcon icon="solar:eye-linear" size={14} />
                          <span>View Details</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onMoveQr(qr)}
                        className="flex items-center gap-2"
                      >
                        <NxtqrIcon icon="solar:folder-linear" size={14} />
                        <span>Move to Folder...</span>
                      </DropdownMenuItem>

                      {!isUnfiled && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onRemoveQr(qr)}
                            className="flex items-center gap-2 text-amber-600 dark:text-amber-400 focus:text-amber-600"
                          >
                            <NxtqrIcon icon="solar:folder-error-linear" size={14} />
                            <span>Move to Unfiled</span>
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
