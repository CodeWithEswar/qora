"use client";

import React from "react";
import type { FileSummaryV1 } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FileListProps {
  files: FileSummaryV1[];
  selectedFileId: string | null;
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

export function FileList({
  files,
  selectedFileId,
  onSelect,
  onPreview,
  onRename,
  onViewUsage,
  onReplace,
  onArchive,
  onDelete,
}: FileListProps) {
  const handleDownload = (file: FileSummaryV1, e: React.MouseEvent) => {
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
    <div className="w-full rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/30 border-b border-border/40 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-medium">Asset</th>
              <th className="py-3 px-3 font-medium hidden sm:table-cell">Type</th>
              <th className="py-3 px-3 font-medium hidden sm:table-cell">Size</th>
              <th className="py-3 px-3 font-medium">Usage</th>
              <th className="py-3 px-3 font-medium hidden md:table-cell">Uploader</th>
              <th className="py-3 px-3 font-medium hidden lg:table-cell">Updated</th>
              <th className="py-3 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {files.map((file) => {
              const inUse = file.usageCount > 0;
              const isSelected = selectedFileId === file.id;

              return (
                <tr
                  key={file.id}
                  onClick={() => onSelect(file)}
                  className={cn(
                    "group hover:bg-muted/30 transition-colors cursor-pointer",
                    isSelected && "bg-[#FA520F]/5"
                  )}
                >
                  {/* Asset Column */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-3 min-w-0 max-w-xs sm:max-w-sm md:max-w-md">
                      <div className="w-9 h-9 rounded-xl bg-muted/40 border border-border/60 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                        {file.category === "IMAGE" ? (
                          <img
                            src={file.publicUrl}
                            alt={file.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <NxtqrIcon
                            icon={
                              file.category === "DOCUMENT"
                                ? "solar:document-text-bold"
                                : file.category === "VIDEO"
                                ? "solar:videocamera-record-bold"
                                : file.category === "AUDIO"
                                ? "solar:music-note-bold"
                                : "solar:file-bold"
                            }
                            size={18}
                            className="text-muted-foreground"
                          />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground truncate block">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate font-mono">
                          {file.originalName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Type Column */}
                  <td className="py-2.5 px-3 font-mono text-muted-foreground hidden sm:table-cell">
                    <span className="uppercase text-[11px]">{file.category}</span>
                  </td>

                  {/* Size Column */}
                  <td className="py-2.5 px-3 font-mono text-muted-foreground hidden sm:table-cell">
                    {formatBytes(file.sizeBytes)}
                  </td>

                  {/* Usage Column */}
                  <td className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewUsage(file);
                      }}
                      className="inline-flex items-center gap-1.5 hover:underline"
                    >
                      {inUse ? (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FA520F] shrink-0" />
                          <span className="text-[#FA520F] font-semibold font-mono text-xs">
                            {file.usageCount} uses
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                          <span className="text-muted-foreground text-xs">Unused</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Uploader Column */}
                  <td className="py-2.5 px-3 text-muted-foreground hidden md:table-cell">
                    <span className="truncate block max-w-[120px]">
                      {file.uploadedBy?.displayName || "Member"}
                    </span>
                  </td>

                  {/* Updated Column */}
                  <td
                    suppressHydrationWarning
                    className="py-2.5 px-3 font-mono text-muted-foreground text-[11px] hidden lg:table-cell"
                  >
                    {new Date(file.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>

                  {/* Actions Column */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hidden sm:inline-flex"
                        onClick={(e) => handleDownload(file, e)}
                        title="Download"
                      >
                        <NxtqrIcon icon="solar:download-linear" size={13} />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <NxtqrIcon icon="solar:menu-dots-bold" size={13} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => onPreview(file)} className="text-xs gap-2">
                            <NxtqrIcon icon="solar:eye-linear" size={14} />
                            <span>Preview</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleDownload(file, e as any)}
                            className="text-xs gap-2"
                          >
                            <NxtqrIcon icon="solar:download-linear" size={14} />
                            <span>Download</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRename(file)} className="text-xs gap-2">
                            <NxtqrIcon icon="solar:pen-linear" size={14} />
                            <span>Rename</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewUsage(file)} className="text-xs gap-2">
                            <NxtqrIcon icon="solar:link-circle-linear" size={14} />
                            <span>View Usage ({file.usageCount})</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReplace(file)} className="text-xs gap-2">
                            <NxtqrIcon icon="solar:restart-linear" size={14} />
                            <span>Replace Asset</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onArchive(file)} className="text-xs gap-2">
                            <NxtqrIcon icon="solar:archive-minimalistic-linear" size={14} />
                            <span>Archive</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(file)}
                            className="text-xs gap-2 text-destructive focus:text-destructive"
                          >
                            <NxtqrIcon icon="solar:trash-bin-trash-linear" size={14} />
                            <span>Delete</span>
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
