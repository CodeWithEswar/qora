"use client";

import * as React from "react";
import { BrandKitDetailV1, BrandLogoAsset } from "@nxtqr/contracts";
import {
  ImageIcon,
  Plus,
  LayoutGrid,
  List,
  Search,
  Download,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface BrandAssetsProps {
  kit: BrandKitDetailV1;
  orgSlug: string;
  onUploadAsset: () => void;
  onRemoveAsset: (assetId: string) => void;
}

export function BrandAssets({
  kit,
  orgSlug,
  onUploadAsset,
  onRemoveAsset,
}: BrandAssetsProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [search, setSearch] = React.useState("");
  const [selectedAsset, setSelectedAsset] = React.useState<BrandLogoAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = React.useState<BrandLogoAsset | null>(null);

  const filteredAssets = React.useMemo(() => {
    return kit.logos.filter((asset) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.variant.toLowerCase().includes(q) ||
        asset.format.toLowerCase().includes(q)
      );
    });
  }, [kit.logos, search]);

  // Check if asset is referenced in active QR presets
  const isAssetInUse = (assetId: string) => {
    const target = kit.logos.find((l) => l.id === assetId);
    if (!target) return false;
    return kit.qrPresets.some(
      (p) => p.design?.logo?.url && p.design.logo.url === target.url
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#FA520F] mb-1">
            <ImageIcon className="w-3 h-3" />
            <span>Digital Asset Vault</span>
          </div>
          <h3 className="text-lg font-bold text-foreground font-display">
            BRAND ASSETS & MARKS
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vector logos, center marks, icons, and approved visual resources assigned to {kit.name}.
          </p>
        </div>

        <Button
          onClick={onUploadAsset}
          size="sm"
          className="h-9 gap-1.5 text-xs bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Upload Brand Asset</span>
        </Button>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand assets..."
            className="pl-8 h-8 text-xs bg-surface border-border"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center p-0.5 rounded-lg border border-border/70 bg-surface">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1 rounded transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-surface-elevated text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1 rounded transition-colors cursor-pointer",
                viewMode === "list"
                  ? "bg-surface-elevated text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-xs font-mono text-muted-foreground">
            {filteredAssets.length} {filteredAssets.length === 1 ? "asset" : "assets"}
          </span>
        </div>
      </div>

      {/* Content Rendering */}
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-xl border border-dashed border-border/80 bg-surface/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl border border-border bg-surface-elevated flex items-center justify-center text-muted-foreground shadow-xs">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-sm font-semibold text-foreground">
              No Brand Assets Yet
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload primary logos, monochrome vector marks, or brand emblems to power QR centers and headers.
            </p>
          </div>
          <Button
            onClick={onUploadAsset}
            variant="outline"
            size="sm"
            className="text-xs h-8 gap-1.5 border-border hover:border-[#FA520F] cursor-pointer"
          >
            <Plus className="w-3 h-3 text-[#FA520F]" />
            <span>Upload First Asset</span>
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group relative p-3 rounded-xl border border-border/80 bg-surface/60 hover:border-[#FA520F]/50 transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-sm"
            >
              <div className="w-full aspect-square rounded-lg border border-border/60 bg-white dark:bg-black/40 flex items-center justify-center p-3 overflow-hidden">
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="mt-2.5 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {asset.name}
                  </span>
                  {asset.isPrimary && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FA520F] shrink-0" title="Primary Mark" />
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span className="uppercase">{asset.format}</span>
                  <span className="capitalize">{asset.variant}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-surface/50 overflow-hidden divide-y divide-border/60">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="p-3 flex items-center justify-between gap-3 hover:bg-surface-elevated/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg border border-border bg-white dark:bg-black/40 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {asset.name}
                    </span>
                    {asset.isPrimary && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-[#FA520F]/10 text-[#FA520F]">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span className="uppercase">{asset.format}</span>
                    <span>•</span>
                    <span className="capitalize">{asset.variant} variant</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAssetToDelete(asset);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asset Details Inspector Sheet */}
      <Sheet open={Boolean(selectedAsset)} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <SheetContent className="w-full sm:max-w-md p-6 space-y-6 overflow-y-auto">
          <SheetHeader className="text-left space-y-1">
            <SheetTitle className="text-lg font-bold font-display text-foreground">
              {selectedAsset?.name}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Asset specifications, dimensions, and usage within this Brand Kit.
            </SheetDescription>
          </SheetHeader>

          {selectedAsset && (
            <div className="space-y-6">
              {/* Visual Preview Box */}
              <div className="w-full h-52 rounded-xl border border-border/80 bg-white dark:bg-black/40 flex items-center justify-center p-6 shadow-inner">
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.name}
                  className="max-w-full max-h-full object-contain drop-shadow-sm"
                />
              </div>

              {/* Specifications List */}
              <div className="space-y-2 rounded-xl border border-border/70 bg-surface/50 p-3.5 text-xs">
                <div className="flex items-center justify-between text-muted-foreground py-1 border-b border-border/40">
                  <span>Variant Classification</span>
                  <span className="font-semibold text-foreground capitalize">
                    {selectedAsset.variant}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground py-1 border-b border-border/40">
                  <span>Vector / Image Format</span>
                  <span className="font-mono text-foreground uppercase">
                    {selectedAsset.format}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground py-1 border-b border-border/40">
                  <span>Safe Area Buffer</span>
                  <span className="font-mono text-foreground">
                    {selectedAsset.safeAreaPadding || 8}px
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground py-1">
                  <span>Referenced by QR Presets</span>
                  <span className="font-mono text-foreground font-semibold">
                    {kit.qrPresets.filter((p) => p.design?.logo?.url === selectedAsset.url).length}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-9 gap-1.5"
                >
                  <a href={selectedAsset.url} target="_blank" rel="noreferrer" download>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Vector File</span>
                  </a>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAssetToDelete(selectedAsset);
                    setSelectedAsset(null);
                  }}
                  className="w-full text-xs h-9 gap-1.5 text-red-500 hover:text-red-600 hover:border-red-500/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Asset from Brand Kit</span>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Safe Delete Alert Dialog */}
      <AlertDialog open={Boolean(assetToDelete)} onOpenChange={(open) => !open && setAssetToDelete(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Remove Asset from Brand Kit?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-2">
              <p>
                Are you sure you want to remove <span className="font-semibold text-foreground">{assetToDelete?.name}</span>?
              </p>
              {assetToDelete && isAssetInUse(assetToDelete.id) && (
                <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>This asset is currently configured as the center logo for one or more QR presets in this kit.</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-xs bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              onClick={() => {
                if (assetToDelete) {
                  onRemoveAsset(assetToDelete.id);
                  setAssetToDelete(null);
                }
              }}
            >
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
