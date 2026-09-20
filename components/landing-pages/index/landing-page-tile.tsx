"use client";

import React from "react";
import Link from "next/link";
import type { LandingPageResponseV1 } from "@nxtqr/contracts";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LandingPageTileProps {
  page: LandingPageResponseV1;
  orgSlug: string;
  onDuplicate: (page: LandingPageResponseV1) => void;
  onDelete: (page: LandingPageResponseV1) => void;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSecs < 60) return "just now";
  const diffInMins = Math.floor(diffInSecs / 60);
  if (diffInMins < 60) return `${diffInMins}m ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function LandingPageTile({
  page,
  orgSlug,
  onDuplicate,
  onDelete,
}: LandingPageTileProps) {
  const isPublished = page.status === "published";
  const isArchived = page.status === "archived";

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(page.publicUrl);
    toast.success("Public URL copied to clipboard", {
      description: page.publicUrl,
    });
  };

  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md flex flex-col justify-between">
      {/* Upper Area: Mini Phone Preview & Main Info */}
      <div className="flex gap-4">
        {/* Phone-shaped Miniature Live Artifact */}
        <Link
          href={`/${orgSlug}/landing-pages/${page.id}`}
          className="relative w-20 h-28 shrink-0 rounded-xl border-2 border-border/80 bg-muted/40 p-1.5 shadow-xs overflow-hidden transition-transform group-hover:scale-[1.02] flex flex-col items-center justify-between"
        >
          {/* Simulated phone speaker notch */}
          <div className="w-5 h-1 rounded-full bg-border/80" />

          {/* Abstract miniature page layout preview */}
          <div className="w-full flex-1 flex flex-col items-center justify-center gap-1.5 py-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold shadow-2xs"
              style={{
                backgroundColor: isPublished ? "#FA520F20" : "rgba(0,0,0,0.06)",
                color: isPublished ? "#FA520F" : "currentColor",
              }}
            >
              {page.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="w-12 h-1 rounded-full bg-border" />
            <div className="w-9 h-1 rounded-full bg-border/60" />
            <div
              className="w-11 h-2 rounded-md mt-0.5 shadow-2xs"
              style={{
                backgroundColor: isPublished ? "#FA520F" : "#A1A1AA",
              }}
            />
          </div>

          {/* Bottom home indicator line */}
          <div className="w-7 h-0.5 rounded-full bg-border/80" />
        </Link>

        {/* Content Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <Link
                href={`/${orgSlug}/landing-pages/${page.id}`}
                className="font-bold text-base text-foreground truncate hover:text-primary transition-colors"
                title={page.name}
              >
                {page.name}
              </Link>

              {/* Action Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <NxtqrIcon icon="solar:menu-dots-bold" size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 font-sans">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${orgSlug}/landing-pages/${page.id}/edit`}
                      className="gap-2 cursor-pointer"
                    >
                      <NxtqrIcon icon="solar:pen-bold" size={15} />
                      <span>Edit in Studio</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${orgSlug}/landing-pages/${page.id}`}
                      className="gap-2 cursor-pointer"
                    >
                      <NxtqrIcon icon="solar:eye-bold" size={15} />
                      <span>View Destination Trace</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${orgSlug}/landing-pages/${page.id}/analytics`}
                      className="gap-2 cursor-pointer"
                    >
                      <NxtqrIcon icon="solar:chart-2-bold" size={15} />
                      <span>Performance Analytics</span>
                    </Link>
                  </DropdownMenuItem>

                  {isPublished && (
                    <DropdownMenuItem onClick={handleCopyUrl} className="gap-2 cursor-pointer">
                      <NxtqrIcon icon="solar:copy-bold" size={15} />
                      <span>Copy Public URL</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => onDuplicate(page)} className="gap-2 cursor-pointer">
                    <NxtqrIcon icon="solar:documents-minimalistic-bold" size={15} />
                    <span>Duplicate Page</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onDelete(page)}
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <NxtqrIcon icon="solar:trash-bin-trash-bold" size={15} />
                    <span>Delete Page...</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge
                variant={isPublished ? "default" : isArchived ? "outline" : "secondary"}
                className={cn(
                  "text-[10px] uppercase font-mono px-2 py-0.5",
                  isPublished && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                )}
              >
                {page.status}
              </Badge>

              <span className="text-xs text-muted-foreground font-mono">
                /{page.slug}
              </span>
            </div>
          </div>

          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono">
              <NxtqrIcon icon="solar:qr-code-linear" size={13} className="text-primary" />
              <strong>{page.qrCount}</strong> QR{page.qrCount === 1 ? "" : "s"}
            </span>

            <span>·</span>

            <span className="flex items-center gap-1 font-mono">
              <NxtqrIcon icon="solar:eye-linear" size={13} />
              <strong>{page.viewCount}</strong> views
            </span>
          </div>
        </div>
      </div>

      {/* Footer Status & Fast Studio CTA */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono text-[11px]">Updated {timeAgo(page.updatedAt)}</span>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-7 text-xs font-semibold hover:text-primary gap-1 px-2"
        >
          <Link href={`/${orgSlug}/landing-pages/${page.id}/edit`}>
            <span>Studio</span>
            <NxtqrIcon icon="solar:arrow-right-linear" size={13} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
