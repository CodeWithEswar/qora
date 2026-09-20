"use client";

import React, { useState, useRef } from "react";
import type { FileSummaryV1 } from "@nxtqr/contracts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  onSuccess: () => void;
}

interface QueuedFile {
  id: string;
  file: File;
  status: "queued" | "uploading" | "success" | "error";
  error?: string;
  result?: FileSummaryV1;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

export function UploadDialog({
  open,
  onOpenChange,
  orgSlug,
  onSuccess,
}: UploadDialogProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

  const validateAndQueueFiles = (fileList: FileList | File[]) => {
    const newItems: QueuedFile[] = [];

    Array.from(fileList).forEach((file) => {
      const item: QueuedFile = {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        status: "queued",
      };

      if (file.size > MAX_FILE_SIZE) {
        item.status = "error";
        item.error = "File exceeds 25MB maximum limit";
      }

      newItems.push(item);
    });

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndQueueFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndQueueFiles(e.target.files);
    }
  };

  const removeQueuedFile = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const processUpload = async () => {
    const pendingItems = queue.filter((q) => q.status === "queued");
    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;

    for (const item of pendingItems) {
      // SVG script inspection
      if (item.file.type === "image/svg+xml") {
        try {
          const text = await item.file.text();
          const dangerousPatterns = /<script|onload=|onerror=|onclick=|javascript:/i;
          if (dangerousPatterns.test(text)) {
            setQueue((prev) =>
              prev.map((q) =>
                q.id === item.id
                  ? { ...q, status: "error", error: "SVG contains script elements" }
                  : q
              )
            );
            continue;
          }
        } catch {
          // ignore
        }
      }

      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" } : q))
      );

      try {
        const formData = new FormData();
        formData.append("file", item.file);

        const res = await fetch(`/api/v1/organizations/${orgSlug}/files`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || "Upload failed");
        }

        const json = await res.json();
        successCount++;

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "success", result: json.data } : q
          )
        );
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "error", error: err.message || "Upload error" }
              : q
          )
        );
      }
    }

    setIsProcessing(false);

    if (successCount > 0) {
      toast.success(
        successCount === 1 ? "File uploaded successfully" : `${successCount} files uploaded successfully`
      );
      onSuccess();
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setQueue([]);
    onOpenChange(false);
  };

  const hasPending = queue.some((q) => q.status === "queued");
  const hasFinished = queue.some((q) => q.status === "success");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl rounded-2xl border-border bg-surface p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FA520F]/15 flex items-center justify-center text-[#FA520F]">
              <NxtqrIcon icon="solar:cloud-upload-bold" size={18} />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Upload to Asset Vault
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Assets uploaded here become instant infrastructure for QR Studio, landing pages, and campaigns.
          </DialogDescription>
        </DialogHeader>

        {/* Dropzone Bay */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all cursor-pointer select-none",
            isDragging
              ? "border-[#FA520F] bg-[#FA520F]/5 scale-[0.99]"
              : "border-border hover:border-[#FA520F]/50 bg-muted/10 hover:bg-muted/20"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.csv,.xlsx,.zip,.svg,.mp4,.mp3"
          />

          <div className="w-12 h-12 rounded-2xl bg-[#FA520F]/10 flex items-center justify-center text-[#FA520F] mb-3">
            <NxtqrIcon icon="solar:upload-track-2-bold" size={24} />
          </div>

          <p className="text-sm font-semibold text-foreground">
            Drop files to NXTQR, or <span className="text-[#FA520F] hover:underline">browse</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Images, Documents, SVGs & Media up to 25 MB
          </p>
        </div>

        {/* Upload Queue */}
        {queue.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-foreground">
                Queue ({queue.length})
              </span>
              {hasFinished && (
                <button
                  type="button"
                  onClick={() => setQueue((prev) => prev.filter((q) => q.status !== "success"))}
                  className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear completed
                </button>
              )}
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0">
                      <NxtqrIcon icon="solar:file-linear" size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-foreground truncate block">
                        {item.file.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                        <span>{formatBytes(item.file.size)}</span>
                        {item.error && (
                          <span className="text-destructive truncate font-sans">
                            • {item.error}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === "uploading" && (
                      <div className="w-5 h-5 border-2 border-[#FA520F] border-t-transparent rounded-full animate-spin" />
                    )}
                    {item.status === "success" && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                        Ready
                      </Badge>
                    )}
                    {item.status === "error" && (
                      <Badge variant="danger" className="text-[10px] font-mono">
                        Failed
                      </Badge>
                    )}
                    {item.status === "queued" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQueuedFile(item.id);
                        }}
                      >
                        <NxtqrIcon icon="solar:close-circle-linear" size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isProcessing}
            className="text-xs cursor-pointer"
          >
            {hasFinished && !hasPending ? "Done" : "Cancel"}
          </Button>

          {hasPending && (
            <Button
              type="button"
              size="sm"
              disabled={isProcessing}
              onClick={processUpload}
              className="text-xs bg-[#FA520F] hover:bg-[#FA520F]/90 text-white font-medium gap-1.5 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading to Vault...</span>
                </>
              ) : (
                <>
                  <NxtqrIcon icon="solar:upload-bold" size={14} />
                  <span>Upload {queue.filter((q) => q.status === "queued").length} File(s)</span>
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
