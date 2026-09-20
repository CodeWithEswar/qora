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

interface LandingPagesListProps {
  pages: LandingPageResponseV1[];
  orgSlug: string;
  onDuplicate: (page: LandingPageResponseV1) => void;
  onDelete: (page: LandingPageResponseV1) => void;
}

export function LandingPagesList({
  pages,
  orgSlug,
  onDuplicate,
  onDelete,
}: LandingPagesListProps) {
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Public URL copied to clipboard", { description: url });
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 border-b border-border/60 text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Destination Name</th>
              <th className="px-4 py-3.5 font-semibold">Status</th>
              <th className="px-4 py-3.5 font-semibold">Connected QRs</th>
              <th className="px-4 py-3.5 font-semibold">Views</th>
              <th className="px-4 py-3.5 font-semibold">Updated</th>
              <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {pages.map((page) => {
              const isPublished = page.status === "published";
              const isArchived = page.status === "archived";

              return (
                <tr key={page.id} className="group hover:bg-muted/20 transition-colors">
                  {/* Name & Slug */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <Link
                        href={`/${orgSlug}/landing-pages/${page.id}`}
                        className="font-bold text-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                      >
                        <span>{page.name}</span>
                      </Link>
                      <span className="text-xs text-muted-foreground font-mono mt-0.5">
                        /p/{page.slug}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge
                      variant={isPublished ? "default" : isArchived ? "outline" : "secondary"}
                      className={cn(
                        "text-[10px] uppercase font-mono px-2 py-0.5",
                        isPublished && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      )}
                    >
                      {page.status}
                    </Badge>
                  </td>

                  {/* Connected QRs */}
                  <td className="px-4 py-4 whitespace-nowrap font-mono text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <NxtqrIcon icon="solar:qr-code-bold" size={14} className="text-primary" />
                      {page.qrCount} QR{page.qrCount === 1 ? "" : "s"}
                    </span>
                  </td>

                  {/* Views */}
                  <td className="px-4 py-4 whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {page.viewCount.toLocaleString()}
                  </td>

                  {/* Updated */}
                  <td suppressHydrationWarning className="px-4 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold">
                        <Link href={`/${orgSlug}/landing-pages/${page.id}/edit`}>
                          <NxtqrIcon icon="solar:pen-bold" size={13} />
                          <span>Studio</span>
                        </Link>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <NxtqrIcon icon="solar:menu-dots-bold" size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/${orgSlug}/landing-pages/${page.id}`} className="gap-2 cursor-pointer">
                              <NxtqrIcon icon="solar:eye-bold" size={15} />
                              <span>Destination Trace</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link href={`/${orgSlug}/landing-pages/${page.id}/analytics`} className="gap-2 cursor-pointer">
                              <NxtqrIcon icon="solar:chart-2-bold" size={15} />
                              <span>Analytics</span>
                            </Link>
                          </DropdownMenuItem>

                          {isPublished && (
                            <DropdownMenuItem onClick={() => handleCopyUrl(page.publicUrl)} className="gap-2 cursor-pointer">
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
