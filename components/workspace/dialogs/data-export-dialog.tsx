"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, ShieldCheck, Database, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DataExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
  workspaceName: string;
}

export function DataExportDialog({
  open,
  onOpenChange,
  orgSlug,
  workspaceName,
}: DataExportDialogProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/v1/organizations/${orgSlug}/workspace/export`);
      if (!response.ok) {
        throw new Error("Failed to generate export file.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workspace-export-${orgSlug}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Workspace export downloaded successfully.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to download export.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/80 p-6 shadow-xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            <DialogTitle className="text-base font-bold font-display">
              Export Workspace Data
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Generate an authoritative, sanitized JSON export of configuration and resources for <strong>{workspaceName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Included Objects */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-surface/50 space-y-2 font-mono text-[11px]">
            <span className="text-[10px] uppercase font-bold text-foreground block">
              Included Configuration & Resources:
            </span>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-1.5 text-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Workspace settings, timezone & policies</span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Active team member & role mappings</span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>All QR codes, drafts & metadata</span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Brand Kits, palettes & typography tokens</span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Custom domain host records</span>
              </li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-2 text-[11px] text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Strict Security Exclusions:</strong> Password hashes, OAuth tokens, secret keys, Cashfree credentials, and private system tokens are never included in export files.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
            className="text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDownload}
            disabled={isExporting}
            className="gap-1.5 text-xs h-8"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? "Generating..." : "Download JSON"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
