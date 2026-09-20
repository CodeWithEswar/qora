"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { FileSummaryV1, FileCategory } from "@nxtqr/contracts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { UploadDialog } from "@/components/files/upload/upload-dialog";
import { cn } from "@/lib/utils";

interface AssetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  allowedCategories?: FileCategory[];
  onSelect: (file: FileSummaryV1) => void;
  title?: string;
  description?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

export function AssetPicker({
  open,
  onOpenChange,
  orgSlug,
  allowedCategories,
  onSelect,
  title = "Choose from Asset Vault",
  description = "Select an existing asset from your workspace infrastructure or upload a new one.",
}: AssetPickerProps) {
  const [files, setFiles] = useState<FileSummaryV1[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileSummaryV1 | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("ALL");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!open) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedTab !== "ALL") params.set("category", selectedTab);
      params.set("limit", "40");

      const res = await fetch(`/api/v1/organizations/${orgSlug}/files?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        let items: FileSummaryV1[] = json.data || [];
        if (allowedCategories && allowedCategories.length > 0) {
          items = items.filter((f) => allowedCategories.includes(f.category));
        }
        setFiles(items);
      }
    } catch (err) {
      console.error("Failed to load picker assets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [open, orgSlug, search, selectedTab, allowedCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFiles();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchFiles]);

  const handleConfirm = () => {
    if (selectedFile) {
      onSelect(selectedFile);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl rounded-2xl border-border bg-surface p-6 shadow-2xl flex flex-col max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FA520F]/15 flex items-center justify-center text-[#FA520F]">
                  <NxtqrIcon icon="solar:folder-with-files-bold" size={16} />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">{title}</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {description}
                  </DialogDescription>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs h-8 cursor-pointer"
                onClick={() => setIsUploadOpen(true)}
              >
                <NxtqrIcon icon="solar:upload-minimalistic-bold" size={14} className="text-[#FA520F]" />
                <span>Upload New</span>
              </Button>
            </div>
          </DialogHeader>

          {/* Search & Tabs */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="relative flex-1">
              <NxtqrIcon
                icon="solar:magnifer-linear"
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets by name or format..."
                className="h-8 pl-8 text-xs bg-muted/20"
              />
            </div>

            <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/20 text-xs">
              {["ALL", "IMAGE", "DOCUMENT"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedTab(tab)}
                  className={cn(
                    "px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer capitalize",
                    selectedTab === tab
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "ALL" ? "All" : tab === "IMAGE" ? "Images" : "Documents"}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Grid */}
          <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[420px] pr-1 py-2">
            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : files.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl bg-muted/5">
                <NxtqrIcon
                  icon="solar:folder-linear"
                  size={32}
                  className="text-muted-foreground/60 mb-2"
                />
                <p className="text-xs font-semibold text-foreground">No assets found</p>
                <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5 mb-3">
                  Upload an asset to your workspace vault to use it across QR experiences.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5 cursor-pointer"
                  onClick={() => setIsUploadOpen(true)}
                >
                  <NxtqrIcon icon="solar:upload-minimalistic-bold" size={14} className="text-[#FA520F]" />
                  Upload First Asset
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {files.map((file) => {
                  const isSelected = selectedFile?.id === file.id;
                  const isImage = file.category === "IMAGE";

                  return (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      onDoubleClick={() => {
                        setSelectedFile(file);
                        onSelect(file);
                        onOpenChange(false);
                      }}
                      className={cn(
                        "group relative rounded-xl border p-2 transition-all cursor-pointer select-none bg-card hover:border-[#FA520F]/40 flex flex-col",
                        isSelected
                          ? "border-[#FA520F] ring-1 ring-[#FA520F] bg-[#FA520F]/5"
                          : "border-border"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="h-24 w-full rounded-lg bg-muted/20 relative flex items-center justify-center overflow-hidden mb-2">
                        {isImage ? (
                          <img
                            src={file.publicUrl}
                            alt={file.name}
                            className="max-h-full max-w-full object-contain p-1"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <NxtqrIcon icon="solar:document-text-bold" size={26} />
                            <span className="text-[9px] font-mono uppercase mt-1">
                              .{file.extension || "FILE"}
                            </span>
                          </div>
                        )}
                        {file.usageCount > 0 && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-background/90 text-muted-foreground border border-border">
                            {file.usageCount}×
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate block" title={file.name}>
                          {file.name}
                        </span>
                        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mt-0.5">
                          <span>.{file.extension || "ext"}</span>
                          <span>{formatBytes(file.sizeBytes)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border flex items-center justify-between">
            <div className="text-xs text-muted-foreground truncate max-w-sm hidden sm:block">
              {selectedFile ? (
                <span>
                  Selected: <strong className="text-foreground">{selectedFile.name}</strong> (
                  {formatBytes(selectedFile.sizeBytes)})
                </span>
              ) : (
                <span>No asset selected</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!selectedFile}
                onClick={handleConfirm}
                className="text-xs bg-[#FA520F] hover:bg-[#FA520F]/90 text-white font-medium cursor-pointer"
              >
                Use Selected Asset
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embedded Upload Dialog */}
      <UploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        orgSlug={orgSlug}
        onSuccess={() => {
          setIsUploadOpen(false);
          fetchFiles();
        }}
      />
    </>
  );
}
