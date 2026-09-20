"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { renderQrSvg, CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";
import { toast } from "sonner";
import { CheckCircle2, Download } from "lucide-react";

export interface DownloadQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrName: string;
  slug: string;
  destinationUrl?: string;
  design?: any;
}

export function DownloadQrDialog({
  open,
  onOpenChange,
  qrName,
  slug,
  destinationUrl,
  design,
}: DownloadQrDialogProps) {
  const [format, setFormat] = React.useState<"png" | "svg">("png");
  const [sizePreset, setSizePreset] = React.useState<"digital" | "print">("digital");
  const [isExporting, setIsExporting] = React.useState(false);

  const content = slug
    ? `https://nxtqr.vercel.app/s/${slug}`
    : destinationUrl || "https://nxtqr.vercel.app";

  const qrDesign = React.useMemo(() => ({
    ...CANONICAL_QR_DESIGN_DEFAULTS,
    ...(design || {}),
    errorCorrection: "M" as const,
    quietZone: 2,
  }), [design]);

  const svgString = React.useMemo(() => {
    try {
      return renderQrSvg({
        content,
        design: qrDesign,
        moduleSize: 8,
      });
    } catch {
      return null;
    }
  }, [content, qrDesign]);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const fileName = `${slug || "qr-code"}.${format}`;

      if (format === "svg") {
        if (!svgString) throw new Error("Could not render vector SVG");
        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("SVG Export complete", { description: fileName });
      } else {
        // PNG export via client Canvas
        const pixelDimension = sizePreset === "print" ? 2048 : 512;
        const img = new Image();
        const svgBlob = new Blob([svgString || ""], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = pixelDimension;
          canvas.height = pixelDimension;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, pixelDimension, pixelDimension);
          canvas.toBlob((blob) => {
            if (!blob) return;
            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(pngUrl);
            URL.revokeObjectURL(url);
            toast.success("PNG Export complete", {
              description: `${fileName} (${pixelDimension}x${pixelDimension})`,
            });
          }, "image/png");
        };
        img.src = url;
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Export failed", { description: err?.message || "Could not generate export" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#161616] border border-border/80">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg tracking-tight">
            Download QR Code
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Export production-ready QR vector or high-resolution raster graphic for print or digital deployment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Signal Integrity Badge */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>SIGNAL INTEGRITY: Ready for export</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground uppercase">
              EC: M (15%)
            </span>
          </div>

          {/* SVG Preview */}
          <div className="flex items-center justify-center p-4 rounded-xl bg-neutral-50 dark:bg-[#111111] border border-border/60">
            {svgString ? (
              <div
                className="w-36 h-36 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full rounded-xl overflow-hidden drop-shadow-xs"
                dangerouslySetInnerHTML={{ __html: svgString }}
              />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center text-xs text-muted-foreground">
                Rendering...
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Format
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("png")}
                className={`flex flex-col p-2.5 rounded-lg border text-left text-xs transition-colors ${
                  format === "png"
                    ? "border-primary bg-primary/5 text-foreground font-medium"
                    : "border-border hover:bg-neutral-50 dark:hover:bg-neutral-800 text-muted-foreground"
                }`}
              >
                <span className="font-semibold text-foreground">PNG (Raster)</span>
                <span className="text-[11px] text-muted-foreground">Digital & standard print</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("svg")}
                className={`flex flex-col p-2.5 rounded-lg border text-left text-xs transition-colors ${
                  format === "svg"
                    ? "border-primary bg-primary/5 text-foreground font-medium"
                    : "border-border hover:bg-neutral-50 dark:hover:bg-neutral-800 text-muted-foreground"
                }`}
              >
                <span className="font-semibold text-foreground">SVG (Vector)</span>
                <span className="text-[11px] text-muted-foreground">Infinite scale & packaging</span>
              </button>
            </div>
          </div>

          {/* Resolution Preset (for PNG only) */}
          {format === "png" && (
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Resolution Preset
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSizePreset("digital")}
                  className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                    sizePreset === "digital"
                      ? "border-primary bg-primary/5 text-foreground font-medium"
                      : "border-border hover:bg-neutral-50 dark:hover:bg-neutral-800 text-muted-foreground"
                  }`}
                >
                  <div className="font-medium text-foreground">Digital Display</div>
                  <div className="text-[10px] font-mono text-muted-foreground">512 &times; 512 px</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSizePreset("print")}
                  className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                    sizePreset === "print"
                      ? "border-primary bg-primary/5 text-foreground font-medium"
                      : "border-border hover:bg-neutral-50 dark:hover:bg-neutral-800 text-muted-foreground"
                  }`}
                >
                  <div className="font-medium text-foreground">Print 300 DPI</div>
                  <div className="text-[10px] font-mono text-muted-foreground">2048 &times; 2048 px</div>
                </button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:space-x-0">
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
            className="bg-primary hover:bg-[#cc3a05] text-white text-xs h-8 gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? "Generating..." : `Download ${format.toUpperCase()}`}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
