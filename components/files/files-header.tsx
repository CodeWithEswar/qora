"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";

interface FilesHeaderProps {
  orgSlug: string;
  onUploadClick: () => void;
}

export function FilesHeader({ orgSlug, onUploadClick }: FilesHeaderProps) {
  return (
    <div className="space-y-2 pb-3 border-b border-border/40 select-none">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
        <Link
          href={`/${orgSlug}`}
          className="hover:text-foreground transition-colors hover:underline"
        >
          Workspace
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-foreground font-semibold">Files</span>
      </div>

      {/* Editorial Heading + Upload Action Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-foreground">
            Files
          </h1>
        </div>

        {/* Action Button: compact on mobile, full on desktop */}
        <Button
          onClick={onUploadClick}
          size="sm"
          className="bg-[#FA520F] hover:bg-[#FA520F]/90 text-white gap-1.5 sm:gap-2 font-medium shadow-sm transition-all hover:shadow-md active:scale-95 h-8 sm:h-9 px-3 sm:px-4 text-xs shrink-0 cursor-pointer"
        >
          <NxtqrIcon icon="solar:upload-track-linear" size={15} />
          <span className="sm:hidden">Upload</span>
          <span className="hidden sm:inline">Upload Files</span>
        </Button>
      </div>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
        Manage the assets behind your QR codes, landing pages and campaigns.
      </p>
    </div>
  );
}
