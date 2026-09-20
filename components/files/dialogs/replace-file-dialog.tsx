"use client";

import React, { useState, useEffect } from "react";
import type { FileSummaryV1, FileUsageV1 } from "@nxtqr/contracts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ReplaceFileDialogProps {
  file: FileSummaryV1 | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  onSuccess: (updatedFile: FileSummaryV1) => void;
}

export function ReplaceFileDialog({
  file,
  open,
  onOpenChange,
  orgSlug,
  onSuccess,
}: ReplaceFileDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usages, setUsages] = useState<FileUsageV1[]>([]);
  const [isLoadingUsages, setIsLoadingUsages] = useState(false);

  useEffect(() => {
    if (!file || !open) {
      setSelectedFile(null);
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
        console.error("Failed to load usages for replacement impact:", err);
      } finally {
        if (isMounted) setIsLoadingUsages(false);
      }
    };

    fetchUsages();
    return () => {
      isMounted = false;
    };
  }, [file?.id, open, orgSlug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setSelectedFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedFile) return;

    // SVG Active script validation
    if (selectedFile.type === "image/svg+xml") {
      const text = await selectedFile.text();
      const dangerousPatterns = /<script|onload=|onerror=|onclick=|javascript:/i;
      if (dangerousPatterns.test(text)) {
        toast.error("SVG file contains active script elements and was rejected for security.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`/api/v1/organizations/${orgSlug}/files/${file.id}/replace`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to replace asset binary");
      }

      const json = await res.json();
      toast.success("Asset replaced successfully");
      onSuccess(json.data);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Could not replace file");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border bg-surface p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500">
              <NxtqrIcon icon="solar:refresh-bold" size={16} />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">Replace Asset Binary</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload a replacement file. All QR experiences and landing pages referencing this asset will instantly receive the new version.
          </DialogDescription>
        </DialogHeader>

        {Array.isArray(usages) && usages.length > 0 && (
          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
            <NxtqrIcon icon="solar:danger-triangle-bold" size={16} className="text-amber-500" />
            <AlertTitle className="text-xs font-semibold">Dependency Impact</AlertTitle>
            <AlertDescription className="text-[11px] mt-1">
              This asset is currently used in <strong>{usages.length}</strong> location{usages.length === 1 ? "" : "s"}:
              <ul className="list-disc pl-4 mt-1 space-y-0.5 font-mono text-[10px]">
                {usages.slice(0, 4).map((u) => (
                  <li key={u.id}>
                    {u.resourceType.replace("_", " ")}: {u.resourceName || u.resourceId}
                  </li>
                ))}
                {usages.length > 4 && <li>...and {usages.length - 4} more</li>}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Select Replacement File
            </Label>
            <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border hover:border-[#FA520F]/50 rounded-2xl cursor-pointer transition-colors bg-muted/10 text-muted-foreground hover:text-foreground">
              <NxtqrIcon icon="solar:cloud-upload-bold" size={28} className="text-[#FA520F]" />
              {selectedFile ? (
                <div className="text-center">
                  <span className="text-xs font-semibold text-foreground block truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-xs font-medium block">Click or drag new file here</span>
                  <span className="text-[10px] text-muted-foreground">
                    Matches type: {file.category}
                  </span>
                </div>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="hidden"
                required
              />
            </label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !selectedFile}
              className="text-xs bg-[#FA520F] hover:bg-[#FA520F]/90 text-white font-medium"
            >
              {isSubmitting ? "Uploading..." : "Replace Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
