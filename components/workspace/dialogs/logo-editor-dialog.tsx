"use client";

import * as React from "react";
import { toast } from "sonner";
import { Upload, Trash2, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LogoEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  currentLogoUrl: string | null;
  onSuccess: (newLogoUrl: string | null) => void;
}

export function LogoEditorDialog({
  open,
  onOpenChange,
  orgSlug,
  currentLogoUrl,
  onSuccess,
}: LogoEditorDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(currentLogoUrl);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setFile(null);
      setPreviewUrl(currentLogoUrl);
      setIsUploading(false);
    }
  }, [open, currentLogoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate size (max 5MB)
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    // Validate MIME
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(selected.type)) {
      toast.error("Unsupported format. Please select a PNG, JPEG, WebP, or SVG file.");
      return;
    }

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/v1/organizations/${orgSlug}/workspace/logo`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to upload logo.");
      }

      toast.success("Workspace logo updated successfully.");
      onSuccess(json.data.logoUrl);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload logo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/workspace/logo`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to remove logo.");
      }

      toast.success("Workspace logo removed.");
      onSuccess(null);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove logo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/80 p-6 shadow-xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <DialogTitle className="text-base font-bold font-display">
              Workspace Logo Editor
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Upload or replace the primary image mark representing your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Preview Box */}
          <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-border/80 bg-surface/30">
            <div className="relative h-24 w-24 rounded-2xl border border-border bg-background overflow-hidden flex items-center justify-center shadow-xs">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
              )}
            </div>

            <div className="mt-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-1.5 text-xs h-8"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{file ? "Choose different file" : "Select image file"}</span>
              </Button>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                PNG, JPEG, WebP, or SVG (max 5MB)
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-2 border-t border-border/40">
          <div>
            {currentLogoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
                className="text-xs h-8 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                <span>Remove logo</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="text-xs h-8 gap-1.5"
            >
              <span>{isUploading ? "Uploading..." : "Save logo"}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
