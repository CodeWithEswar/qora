"use client";

import * as React from "react";
import Link from "next/link";
import { BrandKitDetailV1 } from "@nxtqr/contracts";
import { renderQrSvg, QrDesignV1 } from "@nxtqr/qr-core";
import {
  QrCode,
  Globe,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LiveBrandPreviewProps {
  kit: BrandKitDetailV1;
  orgSlug: string;
}

export function LiveBrandPreview({ kit, orgSlug }: LiveBrandPreviewProps) {
  const [activeTab, setActiveTab] = React.useState<"qr" | "landing" | "print">("qr");
  const [surface, setSurface] = React.useState<"light" | "cream" | "dark">("light");
  const [zoom, setZoom] = React.useState(100);
  const [selectedPresetId, setSelectedPresetId] = React.useState<string | null>(null);

  const primaryColor = kit.primaryColor || "#FA520F";
  const primaryLogo = kit.logos.find((l) => l.isPrimary) || kit.logos[0] || null;

  // Selected preset or default preset
  const activePreset = React.useMemo(() => {
    if (selectedPresetId) {
      const found = kit.qrPresets.find((p) => p.id === selectedPresetId);
      if (found) return found;
    }
    return kit.qrPresets.find((p) => p.isDefault) || kit.qrPresets[0] || null;
  }, [kit.qrPresets, selectedPresetId]);

  // Construct effective design
  const effectiveDesign: QrDesignV1 = React.useMemo(() => {
    if (activePreset?.design) {
      return {
        ...activePreset.design,
        fgColor: activePreset.design.fgColor || primaryColor,
        logo: primaryLogo?.url
          ? {
              url: primaryLogo.url,
              scale: 0.22,
              padding: primaryLogo.safeAreaPadding ? Math.min(primaryLogo.safeAreaPadding, 12) : 6,
              shape: "square",
            }
          : activePreset.design.logo,
      } as QrDesignV1;
    }

    return {
      schemaVersion: 1,
      moduleStyle: "squares",
      eyeOuterStyle: "square",
      eyeInnerStyle: "square",
      fgColor: primaryColor,
      bgColor: "#FFFFFF",
      errorCorrection: "M",
      quietZone: 4,
      logo: primaryLogo?.url
        ? {
            url: primaryLogo.url,
            scale: 0.22,
            padding: 6,
            shape: "square",
          }
        : undefined,
    } as QrDesignV1;
  }, [activePreset, primaryColor, primaryLogo]);

  // Render authoritative SVG
  const samplePayload = `https://nxtqr.vercel.app/s/brand-${kit.slug || kit.id.slice(0, 8)}`;
  const svgMarkup = React.useMemo(() => {
    try {
      return renderQrSvg({
        content: samplePayload,
        design: effectiveDesign,
        moduleSize: 10,
      });
    } catch {
      return `<svg viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="#f4f4f5"/><text x="100" y="100" text-anchor="middle" font-size="12" fill="#71717a">Rendering preview...</text></svg>`;
    }
  }, [samplePayload, effectiveDesign]);

  const zoomIn = () => setZoom((z) => Math.min(140, z + 10));
  const zoomOut = () => setZoom((z) => Math.max(70, z - 10));
  const resetZoom = () => setZoom(100);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border/80 bg-surface/50 backdrop-blur-sm overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-3.5 border-b border-border/70 bg-surface-elevated/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FA520F]" />
          <span className="text-xs font-bold tracking-wider uppercase text-foreground">
            LIVE BRAND PREVIEW
          </span>
        </div>

        <Badge variant="outline" className="text-[10px] font-mono border-border">
          REV {kit.publishedRevision}
        </Badge>
      </div>

      {/* Mode Tabs */}
      <div className="p-2 border-b border-border/60 bg-surface/30">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 h-8 bg-surface-elevated/60 p-0.5 rounded-lg text-[11px]">
            <TabsTrigger value="qr" className="gap-1.5 text-[11px] cursor-pointer">
              <QrCode className="w-3 h-3 text-[#FA520F]" />
              <span>QR</span>
            </TabsTrigger>
            <TabsTrigger value="landing" className="gap-1.5 text-[11px] cursor-pointer">
              <Globe className="w-3 h-3 text-blue-500" />
              <span>Page</span>
            </TabsTrigger>
            <TabsTrigger value="print" className="gap-1.5 text-[11px] cursor-pointer">
              <Printer className="w-3 h-3 text-emerald-500" />
              <span>Print</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Preview Viewport */}
      <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto space-y-4">
        {activeTab === "qr" && (
          <div className="space-y-4">
            {/* Surface Texture Toggles & Zoom bar */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface border border-border/60">
                {(["light", "cream", "dark"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSurface(s)}
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-medium capitalize rounded transition-colors cursor-pointer",
                      surface === s
                        ? "bg-surface-elevated text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="p-1 rounded hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-center">
                  {zoom}%
                </span>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="p-1 rounded hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="p-1 rounded hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Presets Switcher if multiple exist */}
            {kit.qrPresets.length > 1 && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  ACTIVE PRESET
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {kit.qrPresets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPresetId(p.id)}
                      className={cn(
                        "px-2 py-1 rounded text-xs truncate max-w-[130px] border transition-colors cursor-pointer",
                        activePreset?.id === p.id
                          ? "bg-[#FA520F]/10 text-[#FA520F] border-[#FA520F]/40 font-semibold"
                          : "bg-surface border-border/70 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render Canvas */}
            <div
              className={cn(
                "relative rounded-xl border border-border/80 flex items-center justify-center p-6 min-h-[260px] transition-colors shadow-inner overflow-hidden",
                surface === "light" && "bg-white text-zinc-900",
                surface === "cream" && "bg-[#FFF8E0] text-zinc-900",
                surface === "dark" && "bg-[#141414] text-zinc-100"
              )}
            >
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "center center",
                  transition: "transform 150ms ease-out",
                }}
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
                className="[&>svg]:max-w-[190px] [&>svg]:h-auto [&>svg]:drop-shadow-sm"
              />
            </div>

            <div className="p-2.5 rounded-lg border border-border/60 bg-surface/50 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Foreground Token:</span>
                <span className="font-mono text-foreground font-semibold flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-border/70"
                    style={{ backgroundColor: effectiveDesign.fgColor }}
                  />
                  {effectiveDesign.fgColor}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Center Brand Mark:</span>
                <span className="text-foreground truncate max-w-[120px]">
                  {primaryLogo?.name || "None"}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "landing" && (
          <div className="space-y-4">
            <div className="text-[11px] text-muted-foreground">
              Simulated branded destination view consuming this Brand Kit.
            </div>

            {/* Mobile / Card viewport mockup */}
            <div className="rounded-xl border border-border/80 bg-background overflow-hidden shadow-sm">
              {/* Browser chrome bar */}
              <div className="px-3 py-1.5 bg-surface-elevated border-b border-border flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/80" />
                <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                <div className="ml-2 flex-1 px-2 py-0.5 rounded bg-surface text-[9px] font-mono text-muted-foreground truncate border border-border/50">
                  nxtqr.vercel.app/s/{kit.slug || "brand"}
                </div>
              </div>

              {/* Landing Page Content */}
              <div className="p-5 text-center space-y-3 bg-surface/40">
                {primaryLogo?.url ? (
                  <div className="w-10 h-10 mx-auto rounded-lg border border-border bg-white p-1 shadow-xs flex items-center justify-center">
                    <img
                      src={primaryLogo.url}
                      alt={kit.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="w-10 h-10 mx-auto rounded-lg border border-border flex items-center justify-center text-sm font-bold font-mono"
                    style={{ color: primaryColor }}
                  >
                    {kit.name.slice(0, 1)}
                  </div>
                )}

                <div className="space-y-1">
                  <h4
                    className="text-base font-bold text-foreground"
                    style={{
                      fontFamily: kit.typography?.display?.fontFamily || "inherit",
                    }}
                  >
                    {kit.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {kit.description || "Connecting physical scans to instant digital experience."}
                  </p>
                </div>

                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-95 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  Explore Destination
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "print" && (
          <div className="space-y-4">
            <div className="text-[11px] text-muted-foreground">
              Standard 85mm x 55mm physical business specimen with 300 DPI geometry.
            </div>

            {/* Business Card Mockup */}
            <div className="relative rounded-xl border border-border/80 bg-white text-zinc-900 p-4 shadow-sm aspect-[85/55] flex flex-col justify-between overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="text-sm font-bold tracking-tight"
                    style={{
                      color: primaryColor,
                      fontFamily: kit.typography?.display?.fontFamily || "inherit",
                    }}
                  >
                    {kit.name}
                  </div>
                  <div className="text-[9px] text-zinc-500 font-medium">
                    Visual Identity Systems
                  </div>
                </div>

                {primaryLogo?.url && (
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img
                      src={primaryLogo.url}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-end justify-between gap-2 pt-2 border-t border-zinc-100">
                <div className="space-y-0.5 text-[8px] text-zinc-600 font-mono">
                  <div>SCAN FOR VERIFICATION</div>
                  <div>SECURE ROUTING TIER 1</div>
                </div>

                <div
                  dangerouslySetInnerHTML={{ __html: svgMarkup }}
                  className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full border border-zinc-200 rounded p-0.5 bg-white shrink-0 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono px-1">
              <span>FORMAT: 85 × 55 MM</span>
              <span>VECTOR SAFE</span>
            </div>
          </div>
        )}

        {/* Action Link: Open in QR Studio */}
        <div className="pt-2 border-t border-border/60">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full text-xs h-9 gap-1.5 border-border hover:border-[#FA520F] text-foreground hover:text-[#FA520F] transition-colors cursor-pointer"
          >
            <Link href={`/${orgSlug}/qr/studio?brandKitId=${kit.id}`}>
              <span>Open in QR Studio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
