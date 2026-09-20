"use client";

import * as React from "react";
import { BrandLogoAsset } from "@nxtqr/contracts";
import {
  Upload,
  Copy,
  Download,
  Trash2,
  Check,
  Shield,
  Star,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogoSafeArea } from "./logo-safe-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LogoLibraryProps {
  logos: BrandLogoAsset[];
  onUploadLogo: () => void;
  onSetPrimary: (logoId: string) => void;
  onRemoveLogo: (logoId: string) => void;
  onUpdateLogoPadding?: (logoId: string, padding: number) => void;
}

export function LogoLibrary({
  logos,
  onUploadLogo,
  onSetPrimary,
  onRemoveLogo,
  onUpdateLogoPadding,
}: LogoLibraryProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [inspectingSafeAreaLogo, setInspectingSafeAreaLogo] = React.useState<BrandLogoAsset | null>(null);

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Logo URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
            BRAND LOGO LIBRARY
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vector SVG marks and high-resolution raster logos approved for scannable QR center positioning.
          </p>
        </div>

        <Button
          onClick={onUploadLogo}
          size="sm"
          className="h-8 gap-1.5 text-xs bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium shadow-xs cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Upload Logo</span>
        </Button>
      </div>

      {logos.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-dashed border-border bg-surface/40 space-y-3">
          <p className="text-xs text-muted-foreground">
            No logo assets have been uploaded to this Brand Kit yet.
          </p>
          <Button
            onClick={onUploadLogo}
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#FA520F]" />
            <span>Upload First Logo</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="p-4 rounded-xl border border-border/80 bg-surface/60 backdrop-blur-sm space-y-3 flex flex-col justify-between group hover:border-border transition-colors shadow-xs"
            >
              <div>
                {/* Logo Display Surface */}
                <div className="relative w-full h-32 rounded-lg border border-border bg-white dark:bg-black/30 p-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={logo.url}
                    alt={logo.name}
                    className="max-w-full max-h-full object-contain"
                  />

                  {logo.isPrimary && (
                    <Badge
                      variant="secondary"
                      className="absolute top-2 left-2 text-[9px] font-semibold bg-[#FA520F] text-white border-0 py-0"
                    >
                      Primary Mark
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className="absolute top-2 right-2 text-[9px] uppercase font-mono bg-surface-elevated/80 py-0"
                  >
                    {logo.format}
                  </Badge>
                </div>

                {/* Metadata */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground truncate">
                      {logo.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[9px] font-mono capitalize px-1.5 py-0"
                    >
                      {logo.variant}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                    {logo.sizeBytes && (
                      <span>{(logo.sizeBytes / 1024).toFixed(1)} KB</span>
                    )}
                    <span>•</span>
                    <span>Safe Pad: {logo.safeAreaPadding || 8}px</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyUrl(logo.id, logo.url)}
                    className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                    title="Copy Image URL"
                  >
                    {copiedId === logo.id ? (
                      <Check className="w-3 h-3 text-emerald-500 mr-1" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    <span>Copy</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInspectingSafeAreaLogo(logo)}
                    className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                    title="Inspect Safe Area"
                  >
                    <Shield className="w-3 h-3 mr-1 text-[#FA520F]" />
                    <span>Safe Area</span>
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  {!logo.isPrimary && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSetPrimary(logo.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-[#FA520F]"
                      title="Set as Primary Logo"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveLogo(logo.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                    title="Delete Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safe Area Inspection Dialog */}
      {inspectingSafeAreaLogo && (
        <Dialog
          open={!!inspectingSafeAreaLogo}
          onOpenChange={(open) => !open && setInspectingSafeAreaLogo(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold font-display">
                LOGO SAFE AREA BOUNDING BOX
              </DialogTitle>
            </DialogHeader>
            <LogoSafeArea
              logo={inspectingSafeAreaLogo}
              onUpdatePadding={(newPadding) => {
                if (onUpdateLogoPadding) {
                  onUpdateLogoPadding(inspectingSafeAreaLogo.id, newPadding);
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
