"use client";

import React from "react";
import type { FileSummaryV1 } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FileTileProps {
  file: FileSummaryV1;
  isSelected?: boolean;
  onSelect: (file: FileSummaryV1) => void;
  onPreview: (file: FileSummaryV1) => void;
  onRename: (file: FileSummaryV1) => void;
  onViewUsage: (file: FileSummaryV1) => void;
  onReplace: (file: FileSummaryV1) => void;
  onArchive: (file: FileSummaryV1) => void;
  onDelete: (file: FileSummaryV1) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

export function FileTile({
  file,
  isSelected,
  onSelect,
  onPreview,
  onRename,
  onViewUsage,
  onReplace,
  onArchive,
  onDelete,
}: FileTileProps) {
  const isImage = file.category === "IMAGE";
  const isDocument = file.category === "DOCUMENT";
  const isVideo = file.category === "VIDEO";
  const isAudio = file.category === "AUDIO";
  const isArchive = file.category === "ARCHIVE";
  const inUse = file.usageCount > 0;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = file.publicUrl;
    link.download = file.originalName || file.name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        onClick={() => onSelect(file)}
        className={cn(
          "group relative flex flex-col rounded-2xl border border-border/70 bg-card overflow-hidden transition-all duration-200 cursor-pointer shadow-xs select-none hover:-translate-y-0.5 hover:shadow-md hover:border-border",
          isSelected && "ring-2 ring-inset ring-[#FA520F] border-transparent shadow-sm"
        )}
      >
        {/* 60% REAL PREVIEW AREA */}
        <div className="relative w-full aspect-[4/3] bg-muted/20 border-b border-border/40 overflow-hidden flex items-center justify-center p-3">
          {/* Subtle Checkerboard for Transparency */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
            }}
          />

          {isImage ? (
            <img
              src={file.publicUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : isDocument ? (
            <div className="flex flex-col items-center justify-center text-center p-2 space-y-1.5">
              <div className="w-12 h-14 rounded-lg bg-amber-500/10 border border-amber-500/25 flex flex-col items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                <NxtqrIcon icon="solar:document-text-bold" size={24} />
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider mt-0.5">
                  {file.extension || "DOC"}
                </span>
              </div>
            </div>
          ) : isVideo ? (
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <NxtqrIcon icon="solar:videocamera-record-bold" size={24} />
            </div>
          ) : isAudio ? (
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <NxtqrIcon icon="solar:music-note-bold" size={24} />
            </div>
          ) : isArchive ? (
            <div className="w-12 h-12 rounded-xl bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
              <NxtqrIcon icon="solar:archive-minimalistic-bold" size={24} />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
              <NxtqrIcon icon="solar:file-bold" size={24} />
            </div>
          )}

          {/* Quick Hover Action Floating Bar */}
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-7 w-7 rounded-lg bg-background/90 backdrop-blur-sm shadow-xs hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(file);
              }}
              title="Preview Asset"
            >
              <NxtqrIcon icon="solar:eye-linear" size={13} />
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-7 w-7 rounded-lg bg-background/90 backdrop-blur-sm shadow-xs hover:bg-background"
              onClick={handleDownload}
              title="Download Asset"
            >
              <NxtqrIcon icon="solar:download-linear" size={13} />
            </Button>
          </div>
        </div>

        {/* 40% METADATA & USAGE AREA */}
        <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 space-y-1.5 sm:space-y-2">
          {/* File Name with Tooltip */}
          <div className="flex items-start justify-between gap-1 sm:gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs font-semibold text-foreground truncate block flex-1 text-left">
                  {file.name}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span className="text-xs font-mono">{file.originalName}</span>
              </TooltipContent>
            </Tooltip>

            {/* Context Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 -mr-1 cursor-pointer"
                >
                  <NxtqrIcon icon="solar:menu-dots-bold" size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onPreview(file)} className="text-xs gap-2 cursor-pointer">
                  <NxtqrIcon icon="solar:eye-linear" size={14} />
                  <span>Preview</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleDownload} className="text-xs gap-2 cursor-pointer">
                  <NxtqrIcon icon="solar:download-linear" size={14} />
                  <span>Download</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onRename(file)} className="text-xs gap-2 cursor-pointer">
                  <NxtqrIcon icon="solar:pen-linear" size={14} />
                  <span>Rename</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onViewUsage(file)} className="text-xs gap-2 cursor-pointer">
                  <NxtqrIcon icon="solar:link-circle-linear" size={14} />
                  <span>View Usage ({file.usageCount})</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onReplace(file)} className="text-xs gap-2 cursor-pointer">
                  <NxtqrIcon icon="solar:restart-linear" size={14} />
                  <span>Replace Asset</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => onArchive(file)} className="text-xs gap-2 cursor-pointer">
                  <NxtqrIcon icon="solar:archive-minimalistic-linear" size={14} />
                  <span>Archive</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onDelete(file)}
                  className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <NxtqrIcon icon="solar:trash-bin-trash-linear" size={14} />
                  <span>Delete Asset</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Type & Size */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-muted-foreground">
            <span className="uppercase">{file.category}</span>
            <span>{formatBytes(file.sizeBytes)}</span>
          </div>

          {/* SIGNATURE USAGE SIGNAL */}
          <div className="pt-1 border-t border-border/40 flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewUsage(file);
              }}
              className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium transition-colors hover:text-foreground text-left cursor-pointer"
            >
              {inUse ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FA520F] shrink-0" />
                  <span className="text-[#FA520F] font-semibold font-mono">
                    Used {file.usageCount}×
                  </span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="text-muted-foreground">Unused</span>
                </>
              )}
            </button>

            <span className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-mono">
              {new Date(file.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
