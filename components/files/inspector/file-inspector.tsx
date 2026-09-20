"use client";

import React, { useState, useEffect } from "react";
import type { FileSummaryV1, FileDetailV1, FileUsageV1 } from "@nxtqr/contracts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { AssetConstellation } from "@/components/files/inspector/asset-constellation";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FileInspectorProps {
  file: FileSummaryV1 | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  onRename: (file: FileSummaryV1) => void;
  onReplace: (file: FileSummaryV1) => void;
  onArchive: (file: FileSummaryV1) => void;
  onDelete: (file: FileSummaryV1) => void;
  onViewUsage: (file: FileSummaryV1) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

export function FileInspector({
  file,
  open,
  onOpenChange,
  orgSlug,
  onRename,
  onReplace,
  onArchive,
  onDelete,
  onViewUsage,
}: FileInspectorProps) {
  const [usages, setUsages] = useState<FileUsageV1[]>([]);
  const [isLoadingUsages, setIsLoadingUsages] = useState(false);

  useEffect(() => {
    if (!file || !open) {
      setUsages([]);
      return;
    }

    let isMounted = true;
    const fetchUsages = async () => {
      setIsLoadingUsages(true);
      try {
        const res = await fetch(`/api/v1/organizations/${orgSlug}/files/${file.id}/usages`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            const usageList = Array.isArray(json.data)
              ? json.data
              : Array.isArray(json.data?.usages)
              ? json.data.usages
              : [];
            setUsages(usageList);
          }
        }
      } catch (err) {
        console.error("Failed to load asset usages:", err);
      } finally {
        if (isMounted) setIsLoadingUsages(false);
      }
    };

    fetchUsages();
    return () => {
      isMounted = false;
    };
  }, [file?.id, open, orgSlug]);

  if (!file) return null;

  const isImage = file.category === "IMAGE";
  const isDocument = file.category === "DOCUMENT";
  const isVideo = file.category === "VIDEO";
  const isAudio = file.category === "AUDIO";

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.publicUrl;
    link.download = file.originalName || file.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[500px] p-0 flex flex-col h-full bg-surface border-l border-border z-50 overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-5 border-b border-border bg-muted/10 shrink-0">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase font-mono px-2 py-0.5",
                    file.status === "READY"
                      ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
                      : "border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
                      file.status === "READY" ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                  {file.status}
                </Badge>
                <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                  {file.category}
                </Badge>
                {file.extension && (
                  <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground uppercase">
                    .{file.extension}
                  </Badge>
                )}
              </div>
              <h2 className="text-base font-bold text-foreground truncate select-all" title={file.name}>
                {file.name}
              </h2>
              <p className="text-xs text-muted-foreground font-mono truncate mt-0.5" title={file.originalName}>
                {file.originalName}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Real Preview Canvas */}
          <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-xs">
            <div className="h-60 w-full relative flex items-center justify-center p-4">
              {isImage ? (
                <div
                  className="w-full h-full rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, rgba(128, 128, 128, 0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(128, 128, 128, 0.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(128, 128, 128, 0.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(128, 128, 128, 0.08) 75%)",
                    backgroundSize: "16px 16px",
                    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                  }}
                >
                  <img
                    src={file.publicUrl}
                    alt={file.name}
                    className="max-h-full max-w-full object-contain drop-shadow-md rounded transition-transform hover:scale-105 duration-200"
                    loading="lazy"
                  />
                </div>
              ) : isDocument ? (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                    <NxtqrIcon icon="solar:document-text-bold" size={36} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                      {file.extension || "PDF"} Document
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatBytes(file.sizeBytes)}
                    </span>
                  </div>
                </div>
              ) : isVideo ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <video
                    src={file.publicUrl}
                    controls
                    className="max-h-full max-w-full rounded-xl bg-black"
                  />
                </div>
              ) : isAudio ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-3">
                    <NxtqrIcon icon="solar:music-note-bold" size={32} />
                  </div>
                  <audio src={file.publicUrl} controls className="w-full max-w-xs" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <NxtqrIcon icon="solar:file-bold" size={36} />
                  </div>
                  <span className="text-xs font-mono uppercase text-muted-foreground">
                    .{file.extension || "FILE"}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions Bar under Preview */}
            <div className="flex items-center justify-between p-3 border-t border-border bg-muted/20 text-xs">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs font-medium cursor-pointer"
                onClick={handleDownload}
              >
                <NxtqrIcon icon="solar:download-minimalistic-linear" size={14} />
                Download
              </Button>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs cursor-pointer"
                  onClick={() => onRename(file)}
                >
                  <NxtqrIcon icon="solar:pen-linear" size={14} className="mr-1" />
                  Rename
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs cursor-pointer"
                  onClick={() => onReplace(file)}
                >
                  <NxtqrIcon icon="solar:refresh-linear" size={14} className="mr-1" />
                  Replace
                </Button>
              </div>
            </div>
          </div>

          {/* Asset Constellation / Graph */}
          <AssetConstellation
            fileName={file.name}
            usages={usages}
            orgSlug={orgSlug}
          />

          {/* Technical Identity Metadata */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <NxtqrIcon icon="solar:database-bold" size={14} className="text-[#FA520F]" />
              Technical Identity
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground font-mono uppercase block">Size</span>
                <span className="font-mono font-medium text-foreground">{formatBytes(file.sizeBytes)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-mono uppercase block">Category</span>
                <span className="font-medium text-foreground">{file.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-mono uppercase block">MIME Type</span>
                <span className="font-mono text-[11px] text-foreground truncate block" title={file.mimeType}>
                  {file.mimeType}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-mono uppercase block">Dimensions</span>
                <span className="font-mono text-[11px] text-foreground">
                  {file.dimensions?.width && file.dimensions?.height
                    ? `${file.dimensions.width} × ${file.dimensions.height} px`
                    : "—"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-muted-foreground font-mono uppercase block">Storage Path</span>
                <span className="font-mono text-[11px] text-muted-foreground truncate block select-all" title={file.storagePath || ""}>
                  {file.bucket || "qr-assets"}/{file.storagePath || file.name}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-mono uppercase block">Uploaded</span>
                <span className="text-muted-foreground">
                  {new Date(file.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-mono uppercase block">Last Modified</span>
                <span className="text-muted-foreground">
                  {new Date(file.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-destructive">Asset Lifecycle</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {file.usageCount > 0
                    ? `This asset is used in ${file.usageCount} location${file.usageCount === 1 ? "" : "s"}. Archiving preserves existing references.`
                    : "No current dependencies. Safe to permanently delete or archive."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex-1 cursor-pointer"
                onClick={() => onArchive(file)}
              >
                <NxtqrIcon icon="solar:archive-linear" size={14} className="mr-1.5" />
                Archive Asset
              </Button>
              <Button
                size="sm"
                className="text-xs flex-1 cursor-pointer bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium shadow-xs"
                onClick={() => onDelete(file)}
              >
                <NxtqrIcon icon="solar:trash-bin-trash-bold" size={14} className="mr-1.5" />
                Delete Asset
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
