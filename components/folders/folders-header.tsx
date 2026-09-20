"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface FoldersHeaderProps {
  orgSlug: string;
  onNewFolder: () => void;
}

export function FoldersHeader({ orgSlug, onNewFolder }: FoldersHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 pb-4 border-b border-border/80 dark:border-white/[0.08]">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-mono">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${orgSlug}`}>Workspace</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Folders</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              Folders
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-primary/10 text-primary border border-primary/20">
              Workspace Layers
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Organize QR assets into focused spaces without changing their scan identity, destination routing, or analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          <Button
            onClick={onNewFolder}
            className="w-full sm:w-auto h-9 gap-1.5 font-medium shadow-sm cursor-pointer text-xs sm:text-sm"
          >
            <NxtqrIcon icon="solar:add-circle-bold" size={16} />
            <span>New Folder</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
