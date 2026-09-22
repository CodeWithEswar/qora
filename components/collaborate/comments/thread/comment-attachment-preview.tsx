"use client";

import * as React from "react";
import { FileIcon, ImageIcon, Download, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CommentAttachmentItem } from "@/lib/supabase/types/comments";

interface CommentAttachmentPreviewProps {
  attachment: CommentAttachmentItem;
  className?: string;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function CommentAttachmentPreview({
  attachment,
  className = "",
}: CommentAttachmentPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const isImage = attachment.fileType.toLowerCase() === "image" || attachment.mimeType.startsWith("image/");

  return (
    <>
      <div
        className={`flex items-center gap-2 p-2 rounded-md border border-border/50 bg-background/60 text-xs font-mono max-w-sm ${className}`}
      >
        <div className="p-1.5 rounded bg-muted/60 text-muted-foreground shrink-0">
          {isImage ? <ImageIcon className="w-4 h-4" /> : <FileIcon className="w-4 h-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate text-xs font-sans">
            {attachment.name}
          </p>
          <span className="text-[10px] text-muted-foreground font-mono">
            {formatBytes(attachment.sizeBytes)}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isImage && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setIsPreviewOpen(true)}
              title="Preview attachment"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            asChild
            title="Download attachment"
          >
            <a href={attachment.url} target="_blank" rel="noreferrer" download={attachment.name}>
              <Download className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>

      {isImage && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-3xl p-4 bg-background border-border">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-sm font-mono truncate">
                {attachment.name}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[75vh] flex items-center justify-center overflow-hidden rounded border border-border/40 bg-muted/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-h-[70vh] object-contain rounded"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
