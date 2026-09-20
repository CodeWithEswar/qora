"use client";

import * as React from "react";
import { BrandLogoAsset, BrandLogoVariant } from "@nxtqr/contracts";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, ImageIcon, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface UploadLogoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLogo: (logo: BrandLogoAsset) => void;
}

export function UploadLogoDialog({
  isOpen,
  onClose,
  onAddLogo,
}: UploadLogoDialogProps) {
  const [name, setName] = React.useState("");
  const [variant, setVariant] = React.useState<BrandLogoVariant>("primary");
  const [isPrimary, setIsPrimary] = React.useState(false);
  const [safeAreaPadding, setSafeAreaPadding] = React.useState(8);
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate size (max 20MB)
    if (selected.size > 20 * 1024 * 1024) {
      toast.error("File exceeds 20MB size limit.");
      return;
    }

    // Validate type
    const validMimes = [
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];
    if (!validMimes.includes(selected.type)) {
      toast.error("Unsupported file type. Please provide SVG, PNG, JPEG, or WebP.");
      return;
    }

    setFile(selected);
    if (!name.trim()) {
      setName(selected.name.replace(/\.[^/.]+$/, ""));
    }

    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a logo asset to upload.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload logo asset.");
      }

      const newLogo: BrandLogoAsset = {
        id: `logo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim() || file.name,
        variant,
        url: data.publicUrl || data.url,
        format: file.type.includes("svg") ? "svg" : file.name.split(".").pop()?.toLowerCase() || "png",
        sizeBytes: file.size,
        isPrimary,
        safeAreaPadding,
      };

      onAddLogo(newLogo);
      toast.success("Logo asset added to brand kit.");

      // Reset
      setFile(null);
      setPreviewUrl(null);
      setName("");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Logo upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display">
              UPLOAD BRAND LOGO
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload vector SVG marks or high-resolution raster logos into the brand vault.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File dropzone / preview */}
            <div className="relative rounded-xl border border-dashed border-border bg-surface/50 p-4 text-center hover:border-primary/50 transition-colors flex flex-col items-center justify-center">
              {previewUrl ? (
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-lg border border-border bg-white dark:bg-black/30 p-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {file?.name} ({(Number(file?.size || 0) / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-muted-foreground">
                    <Upload className="w-4 h-4 text-[#FA520F]" />
                  </div>
                  <div className="text-xs text-foreground font-medium">
                    Select vector SVG, PNG, or WebP
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Max size 20MB • SVG recommended for vector sharpness
                  </div>
                </div>
              )}

              <input
                type="file"
                accept=".svg,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required={!file}
              />
            </div>

            {/* Asset Name */}
            <div className="space-y-1.5">
              <Label htmlFor="logo-name" className="text-xs font-semibold">
                Asset Label *
              </Label>
              <Input
                id="logo-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Primary Horizontal Monogram"
                className="h-8 text-xs"
                required
              />
            </div>

            {/* Variant Classifier */}
            <div className="space-y-1.5">
              <Label htmlFor="logo-variant" className="text-xs font-semibold">
                Classification Variant
              </Label>
              <Select
                value={variant}
                onValueChange={(val: any) => setVariant(val)}
              >
                <SelectTrigger id="logo-variant" className="h-8 text-xs">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="primary">Primary (Default Brand Mark)</SelectItem>
                  <SelectItem value="secondary">Secondary (Alternate Lockup)</SelectItem>
                  <SelectItem value="monochrome">Monochrome (Single Tint)</SelectItem>
                  <SelectItem value="mark">Mark Only (Isolated Symbol)</SelectItem>
                  <SelectItem value="light">Light (Dark Mode Inverted)</SelectItem>
                  <SelectItem value="dark">Dark (Light Surface Tint)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Primary Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is-primary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded border-border accent-[#FA520F] h-4 w-4 cursor-pointer"
              />
              <Label htmlFor="is-primary" className="text-xs font-medium cursor-pointer">
                Set as the default brand mark for QR centers
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isUploading}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isUploading || !file}
              className="text-xs h-8 bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  <span>Upload Asset</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
