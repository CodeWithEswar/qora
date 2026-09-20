"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrEmptyMonogram } from "@/components/empty-state/qr-empty-monogram";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface FoldersEmptyStateProps {
  unfiledQrsCount?: number;
  orgSlug: string;
  onCreateFolder: () => void;
  className?: string;
}

export function FoldersEmptyState({
  unfiledQrsCount = 0,
  orgSlug,
  onCreateFolder,
  className,
}: FoldersEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-border/80 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.01]",
        className
      )}
    >
      {/* Signature QR Monogram 'F' for Folders */}
      <div className="relative mb-5">
        <QrEmptyMonogram letter="F" size="md" />
      </div>

      <div className="max-w-md space-y-2">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-serif">
          Create your first QR space
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Folders keep related QR assets organized together without changing how those codes scan, resolve, or route traffic at the edge.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-6">
        <Button
          onClick={onCreateFolder}
          className="h-9 px-4 gap-1.5 font-medium shadow-sm cursor-pointer"
        >
          <NxtqrIcon icon="solar:add-circle-bold" size={15} />
          <span>Create Folder</span>
        </Button>

        {unfiledQrsCount > 0 && (
          <Button
            variant="outline"
            asChild
            className="h-9 px-4 gap-1.5 font-medium border-border/80 dark:border-white/[0.08] bg-white dark:bg-[#18181B]"
          >
            <Link href={`/${orgSlug}/folders/unfiled`}>
              <NxtqrIcon icon="solar:folder-with-files-linear" size={15} />
              <span>View Unfiled QR Codes ({unfiledQrsCount})</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
