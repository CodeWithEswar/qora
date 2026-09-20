"use client";

import * as React from "react";
import Link from "next/link";
import { FolderQrAssetV1 } from "@nxtqr/contracts";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { formatNumber, formatRelativeTime, cn } from "@/lib/utils";

export interface FolderAssetsMobileCardsProps {
  assets: FolderQrAssetV1[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onMoveQr: (qr: FolderQrAssetV1) => void;
  onRemoveQr: (qr: FolderQrAssetV1) => void;
  orgSlug: string;
  isUnfiled: boolean;
}

export function FolderAssetsMobileCards({
  assets,
  selectedIds,
  onToggleSelect,
  onMoveQr,
  onRemoveQr,
  orgSlug,
  isUnfiled,
}: FolderAssetsMobileCardsProps) {
  return (
    <div className="space-y-3">
      {assets.map((qr) => {
        const isSelected = selectedIds.includes(qr.id);
        const qrHref = `/${orgSlug}/qr/${qr.id}`;

        return (
          <div
            key={qr.id}
            className={cn(
              "rounded-xl border p-3.5 space-y-2.5 transition-colors bg-white dark:bg-[#18181B]",
              isSelected
                ? "border-primary/60 bg-primary/[0.02]"
                : "border-border/80 dark:border-white/[0.08]"
            )}
          >
            {/* Header: Select + Name + Status */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(qr.id)}
                  aria-label={`Select ${qr.name}`}
                  className="h-4.5 w-4.5"
                />
                <span className="text-base shrink-0 font-mono text-primary">▦</span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={qrHref}
                    className="text-xs font-semibold text-foreground truncate block hover:text-primary transition-colors"
                  >
                    {qr.name}
                  </Link>
                  <span className="text-[10px] font-mono text-muted-foreground block truncate">
                    /{qr.slug}
                  </span>
                </div>
              </div>

              <Badge
                variant="outline"
                className="text-[9px] font-mono uppercase tracking-wider h-5 shrink-0"
              >
                {qr.status}
              </Badge>
            </div>

            {/* Destination URL */}
            {qr.destinationUrl ? (
              <div className="text-xs font-mono text-muted-foreground truncate bg-muted/30 dark:bg-white/[0.02] p-2 rounded-md">
                <a
                  href={qr.destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground flex items-center gap-1 truncate"
                >
                  <span>→</span>
                  <span className="truncate">{qr.destinationUrl}</span>
                </a>
              </div>
            ) : (
              <div className="text-xs font-mono text-muted-foreground/50 italic px-2">
                No destination configured
              </div>
            )}

            {/* Footer metrics & actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60 dark:border-white/[0.06] text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {formatNumber(qr.totalScans)} scans
                </span>
                <span>•</span>
                <span className="capitalize">{qr.qrType}</span>
                {qr.isDynamic && (
                  <span className="text-[9px] px-1 rounded-xs bg-amber-500/10 text-amber-600 font-bold">
                    DYN
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs">
                  <Link href={qrHref}>Open</Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <NxtqrIcon icon="solar:menu-dots-bold" size={15} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 text-xs">
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
                          className="flex items-center gap-2 text-amber-600"
                        >
                          <NxtqrIcon icon="solar:folder-error-linear" size={14} />
                          <span>Move to Unfiled</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
