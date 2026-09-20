import * as React from "react";
import {
  Palette,
  Shapes,
  Image as ImageIcon,
  SlidersHorizontal,
  RotateCcw,
  Upload,
  Trash2,
  ChevronDown,
  Eye as EyeIcon,
  Square,
  Sparkles,
  Link,
  Unlink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  QrDesignV1,
  CANONICAL_QR_DESIGN_DEFAULTS,
  ModuleStyle,
  EyeOuterStyle,
  EyeInnerStyle,
  QrErrorCorrectionLevel,
  renderMiniThumbnailSvg,
} from "@nxtqr/qr-core";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetPicker } from "@/components/files/picker/asset-picker";
import type { FileSummaryV1, BrandKitSummaryV1, BrandKitDetailV1 } from "@nxtqr/contracts";
import NextLink from "next/link";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";

interface DesignInspectorProps {
  design: QrDesignV1;
  onChange: (next: QrDesignV1) => void;
  orgSlug: string;
  focusedTarget?: string | null;
}

interface SectionProps {
  id?: string;
  sectionNumber: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ id, sectionNumber, title, icon, isOpen, onToggle, children }: SectionProps) {
  return (
    <div id={id} className="border-b border-border/70 last:border-b-0 scroll-mt-6">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2.5 px-2 hover:bg-surface-hover/50 text-xs font-semibold text-foreground transition-colors cursor-pointer rounded-md select-none gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[10px] text-primary font-bold shrink-0">{sectionNumber}</span>
          <div className="text-muted-foreground shrink-0">{icon}</div>
          <span className="tracking-tight truncate">{title}</span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-foreground" : ""
          }`}
        />
      </button>
      {isOpen && <div className="space-y-3.5 pt-1 pb-3 px-2 text-xs">{children}</div>}
    </div>
  );
}

// Mini dynamic real SVG preview tile
function MiniPreviewThumbnail({
  designPartial,
  className = "",
}: {
  designPartial: Partial<QrDesignV1>;
  className?: string;
}) {
  const svg = React.useMemo(() => {
    return renderMiniThumbnailSvg(designPartial);
  }, [designPartial]);

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:object-contain pointer-events-none ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// WCAG Contrast calculation helper
function getLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2) || "00", 16) / 255;
  const g = parseInt(clean.substring(2, 4) || "00", 16) / 255;
  const b = parseInt(clean.substring(4, 6) || "00", 16) / 255;
  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex1) || !/^#[0-9a-fA-F]{6}$/.test(hex2)) return 21;
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const MODULE_STYLES: { id: ModuleStyle; label: string; description: string }[] = [
  { id: "squares", label: "Classic Square", description: "Standard ISO geometric matrix" },
  { id: "rounded", label: "Smooth Rounded", description: "Softened module corners" },
  { id: "dots", label: "Connected Dots", description: "Circular pinpoint modules" },
  { id: "soft", label: "Soft Square", description: "Subtle 25% corner radius" },
  { id: "extra_rounded", label: "Extra Rounded", description: "Pronounced curved modules" },
  { id: "diamond", label: "Diamond Gem", description: "45-degree angled facet matrix" },
];

const EYE_OUTER_STYLES: { id: EyeOuterStyle; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "leaf", label: "Leaf Curve" },
  { id: "circle", label: "Circle" },
];

const EYE_INNER_STYLES: { id: EyeInnerStyle; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "dot", label: "Circle Dot" },
  { id: "diamond", label: "Diamond" },
];

const FRAME_STYLES = [
  { id: "none", label: "None", desc: "Clean QR matrix" },
  { id: "simple", label: "Bottom Banner", desc: "Lower callout block" },
  { id: "badge", label: "Top Header", desc: "Upper title banner" },
  { id: "card", label: "Full Card", desc: "Complete surrounding card" },
  { id: "signal_bar", label: "Signal Bar", desc: "NXTQR signature rule" },
  { id: "corners", label: "Corners", desc: "Camera finder brackets" },
  { id: "outline", label: "Outline", desc: "Technical boundary rule" },
];

const FRAME_TEXT_PRESETS = [
  "SCAN TO OPEN",
  "CONNECT",
  "VIEW MENU",
  "PAY NOW",
  "OPEN PROFILE",
  "SCAN ME",
];

export function DesignInspector({
  design,
  onChange,
  orgSlug,
  focusedTarget,
}: DesignInspectorProps) {
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = React.useState(false);

  // Section open/close states (7 vertical sections)
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    brand: true,
    style: false,
    eyes: false,
    color: true,
    logo: false,
    frame: false,
    advanced: false,
  });

  // Brand Kits Integration State
  const [brandKits, setBrandKits] = React.useState<BrandKitSummaryV1[]>([]);
  const [selectedKitId, setSelectedKitId] = React.useState<string | null>(null);
  const [selectedKitDetail, setSelectedKitDetail] = React.useState<BrandKitDetailV1 | null>(null);
  const [isLoadingBrandKits, setIsLoadingBrandKits] = React.useState(true);

  // Load organization brand kits
  React.useEffect(() => {
    let isMounted = true;
    setIsLoadingBrandKits(true);
    fetch("/api/v1/brand-kits?status=active")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.data) return;
        const kits: BrandKitSummaryV1[] = Array.isArray(data.data)
          ? data.data
          : data.data.kits || [];
        setBrandKits(kits);
        if (kits.length > 0) {
          const def = kits.find((k) => k.isDefault) || kits[0];
          setSelectedKitId(def.id);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingBrandKits(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // When selectedKitId changes, load its full detail
  React.useEffect(() => {
    if (!selectedKitId) {
      setSelectedKitDetail(null);
      return;
    }
    let isMounted = true;
    fetch(`/api/v1/brand-kits/${selectedKitId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.data) return;
        const kitDetail = data.data.kit || data.data;
        setSelectedKitDetail(kitDetail);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [selectedKitId]);

  // Are eye colors linked to foreground color?
  const areEyesLinked = !design.eyeColor && !design.eyeInnerColor;

  // React to programmatic jump-to-control target
  React.useEffect(() => {
    if (!focusedTarget) return;

    if (focusedTarget === "design.colors") {
      setOpenSections((s) => ({ ...s, color: true }));
      const el = document.getElementById("inspector-section-color");
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else if (focusedTarget === "design.logo.size") {
      setOpenSections((s) => ({ ...s, logo: true }));
      const el = document.getElementById("inspector-section-logo");
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else if (
      focusedTarget === "design.quietZone" ||
      focusedTarget === "design.errorCorrection"
    ) {
      setOpenSections((s) => ({ ...s, advanced: true }));
      const el = document.getElementById("inspector-section-advanced");
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [focusedTarget]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Contrast analysis
  const contrastRatio = React.useMemo(() => {
    return getContrastRatio(design.fgColor, design.bgColor);
  }, [design.fgColor, design.bgColor]);

  const isContrastStrong = contrastRatio >= 4.5;

  // Logo upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("resourceType", "logo");

      const res = await fetch(`/api/v1/organizations/${orgSlug}/assets`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        const localPreviewUrl = URL.createObjectURL(file);

        onChange({
          ...design,
          logo: {
            assetId: data.assetId,
            url: localPreviewUrl,
            scale: design.logo?.scale || 0.24,
            padding: design.logo?.padding || 4,
            shape: design.logo?.shape || "square",
          },
          errorCorrection:
            design.errorCorrection === "L" || design.errorCorrection === "M"
              ? "Q"
              : design.errorCorrection,
        });
      }
    } catch {
      // Handled
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSelectVaultLogo = (file: FileSummaryV1) => {
    onChange({
      ...design,
      logo: {
        assetId: file.id,
        url: file.publicUrl,
        scale: design.logo?.scale || 0.24,
        padding: design.logo?.padding || 4,
        shape: design.logo?.shape || "square",
      },
      errorCorrection:
        design.errorCorrection === "L" || design.errorCorrection === "M"
          ? "Q"
          : design.errorCorrection,
    });
  };

  const removeLogo = () => {
    const next = { ...design };
    delete next.logo;
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border shadow-2xs">
        <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold truncate">2. Design Inspector</CardTitle>
            <CardDescription className="text-xs truncate">
              6-section vector styling & geometry engine
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(CANONICAL_QR_DESIGN_DEFAULTS)}
            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            title="Reset to canonical NXTQR defaults"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            <span>Reset</span>
          </Button>
        </CardHeader>

        <CardContent className="p-2 text-xs">
          {/* =========================================================================
              00 BRAND: Brand Kit Identity & Presets
             ========================================================================= */}
          <Section
            id="inspector-section-brand"
            sectionNumber="00"
            title="Brand Kit & Presets"
            icon={<NxtqrIcon icon="solar:palette-bold-duotone" size={14} />}
            isOpen={openSections.brand}
            onToggle={() => toggleSection("brand")}
          >
            <div className="space-y-3">
              {isLoadingBrandKits ? (
                <div className="p-3 text-center text-xs text-muted-foreground animate-pulse">
                  Loading brand kits...
                </div>
              ) : brandKits.length === 0 ? (
                <div className="p-3 rounded-lg border border-dashed border-border bg-surface-elevated/40 text-center space-y-2">
                  <p className="text-[11px] text-muted-foreground">
                    No active Brand Kits in this workspace yet.
                  </p>
                  <NextLink
                    href={`/${orgSlug}/brand`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <NxtqrIcon icon="solar:add-circle-linear" size={13} />
                    Create Brand Kit
                  </NextLink>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Kit Selector */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <Label className="font-semibold text-muted-foreground">Active Brand Kit</Label>
                      <NextLink
                        href={`/${orgSlug}/brand`}
                        className="text-[10px] text-primary hover:underline font-mono"
                      >
                        Manage Kits →
                      </NextLink>
                    </div>
                    <Select
                      value={selectedKitId || ""}
                      onValueChange={(val) => setSelectedKitId(val)}
                    >
                      <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs text-foreground font-medium focus:ring-1 focus:ring-primary">
                        <SelectValue placeholder="Select Brand Kit" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {brandKits.map((k) => (
                          <SelectItem key={k.id} value={k.id} className="text-xs cursor-pointer">
                            <span>{k.name}</span>
                            {k.isDefault && (
                              <span className="ml-1.5 text-[10px] text-muted-foreground font-mono">
                                (Default)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedKitDetail && (
                    <>
                      {/* Governance badge if active */}
                      {(!selectedKitDetail.governance.allowCustomColors ||
                        !selectedKitDetail.governance.allowCustomLogos ||
                        selectedKitDetail.governance.requireApprovedTemplate) && (
                        <div className="flex items-center gap-1.5 p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-medium">
                          <NxtqrIcon icon="solar:shield-check-bold" size={13} />
                          <span>Brand Guardrails active on this identity</span>
                        </div>
                      )}

                      {/* Brand QR Presets */}
                      {selectedKitDetail.qrPresets && selectedKitDetail.qrPresets.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-muted-foreground block">
                            Branded QR Styles ({selectedKitDetail.qrPresets.length})
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedKitDetail.qrPresets.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  onChange({
                                    ...design,
                                    ...(preset.design as Partial<QrDesignV1>),
                                  });
                                  toast.success(`Applied "${preset.name}" style`);
                                }}
                                className="p-2 rounded-lg border border-border/80 bg-surface hover:border-primary/50 hover:bg-primary/[0.03] transition-all text-left flex items-center gap-2 group cursor-pointer"
                              >
                                <div className="w-9 h-9 rounded bg-background p-0.5 border border-border shrink-0 flex items-center justify-center">
                                  <MiniPreviewThumbnail
                                    designPartial={preset.design as Partial<QrDesignV1>}
                                    className="w-full h-full"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-[11px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                    {preset.name}
                                  </div>
                                  <span className="text-[9px] font-mono text-muted-foreground capitalize">
                                    {preset.design.moduleStyle || "square"}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Brand Palette Quick Swatches */}
                      {selectedKitDetail.colors && selectedKitDetail.colors.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-muted-foreground">Brand Palette</span>
                            <button
                              type="button"
                              onClick={() => {
                                const primary = selectedKitDetail.colors.find((c) => c.role === "primary")?.hex;
                                const surface = selectedKitDetail.colors.find((c) => c.role === "surface" || c.role === "background")?.hex;
                                if (primary) {
                                  onChange({
                                    ...design,
                                    fgColor: primary,
                                    bgColor: surface || "#FFFFFF",
                                  });
                                  toast.success("Applied brand palette colors");
                                }
                              }}
                              className="text-[10px] text-primary hover:underline cursor-pointer font-medium"
                            >
                              Apply Colors
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedKitDetail.colors.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  onChange({ ...design, fgColor: c.hex });
                                  toast.success(`Set QR foreground to ${c.name}`);
                                }}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-surface hover:border-primary/50 text-[10px] cursor-pointer transition-colors"
                                title={`Click to set as foreground: ${c.name} (${c.hex})`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                  style={{ backgroundColor: c.hex }}
                                />
                                <span className="font-mono text-[9px] text-muted-foreground">{c.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Brand Logos */}
                      {selectedKitDetail.logos && selectedKitDetail.logos.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-muted-foreground block">
                            Approved Logos ({selectedKitDetail.logos.length})
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedKitDetail.logos.map((logo) => (
                              <button
                                key={logo.id}
                                type="button"
                                onClick={() => {
                                  onChange({
                                    ...design,
                                    logo: {
                                      assetId: logo.fileId || logo.id,
                                      url: logo.url,
                                      scale: 0.24,
                                      padding: (logo.safeAreaPadding || 8) / 2,
                                      shape: "square",
                                    },
                                    errorCorrection:
                                      design.errorCorrection === "L" || design.errorCorrection === "M"
                                        ? "Q"
                                        : design.errorCorrection,
                                  });
                                  toast.success(`Applied ${logo.name} mark`);
                                }}
                                className="p-2 rounded-lg border border-border/80 bg-surface hover:border-primary/50 hover:bg-primary/[0.03] transition-all text-left flex items-center gap-2 group cursor-pointer"
                              >
                                <div className="w-8 h-8 rounded bg-background p-1 border border-border shrink-0 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={logo.url}
                                    alt={logo.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = "none";
                                    }}
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-[10px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                    {logo.name}
                                  </div>
                                  <span className="text-[9px] font-mono text-muted-foreground uppercase">
                                    {logo.variant}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* =========================================================================
              01 STYLE: Module Pattern Gallery with REAL Mini Previews
             ========================================================================= */}
          <Section
            id="inspector-section-style"
            sectionNumber="01"
            title="Style & Module Geometry"
            icon={<Shapes className="h-3.5 w-3.5" />}
            isOpen={openSections.style}
            onToggle={() => toggleSection("style")}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <Label className="font-semibold text-muted-foreground">Module Pattern</Label>
                <span className="font-mono text-[10px] text-primary capitalize">
                  {design.moduleStyle.replace("_", " ")}
                </span>
              </div>

              {/* Grid of Real Mini SVG QR Previews */}
              <div className="grid grid-cols-3 gap-2">
                {MODULE_STYLES.map((m) => {
                  const isSelected = design.moduleStyle === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onChange({ ...design, moduleStyle: m.id })}
                      className={`group relative p-2 rounded-xl border-2 text-center transition-all duration-150 cursor-pointer flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? "border-primary bg-primary/[0.08] ring-2 ring-primary/20 shadow-xs z-10"
                          : "border-border/70 bg-surface hover:border-primary/50 hover:bg-primary/[0.02] hover:shadow-xs z-0 hover:z-10"
                      }`}
                    >
                      {/* Live Vector Mini QR Preview */}
                      <div className="w-12 h-12 rounded bg-background p-1 border border-border/80 flex items-center justify-center">
                        <MiniPreviewThumbnail
                          designPartial={{
                            moduleStyle: m.id,
                            fgColor: design.fgColor,
                            bgColor: design.bgColor,
                          }}
                          className="w-full h-full"
                        />
                      </div>
                      <span className={`text-[10px] font-semibold truncate max-w-full ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* =========================================================================
              02 EYES: Outer Ring & Inner Core Geometry + Finder Preview
             ========================================================================= */}
          <Section
            id="inspector-section-eyes"
            sectionNumber="02"
            title="Eye Finder Geometry"
            icon={<EyeIcon className="h-3.5 w-3.5" />}
            isOpen={openSections.eyes}
            onToggle={() => toggleSection("eyes")}
          >
            {/* Enlarged Live Finder Pattern Visualizer */}
            <div className="p-3 rounded-lg border border-border bg-surface-elevated/40 flex items-center justify-between gap-3 min-w-0">
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-[11px] font-bold text-foreground block truncate">Finder Pattern Preview</span>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  Corner calibration targets scanned by camera sensors
                </p>
              </div>

              {/* Enlarged Single Finder Eye Preview */}
              <div
                className="h-12 w-12 rounded border border-border flex items-center justify-center p-1 relative shadow-xs shrink-0"
                style={{ backgroundColor: design.bgColor }}
              >
                <div
                  className="w-9 h-9 border-4 flex items-center justify-center transition-all"
                  style={{
                    borderColor: design.eyeColor || design.fgColor,
                    borderRadius:
                      design.eyeOuterStyle === "circle"
                        ? "50%"
                        : design.eyeOuterStyle === "rounded"
                        ? "6px"
                        : design.eyeOuterStyle === "leaf"
                        ? "8px 0px 8px 0px"
                        : "0px",
                  }}
                >
                  <div
                    className="w-3.5 h-3.5 transition-all"
                    style={{
                      backgroundColor: design.eyeInnerColor || design.fgColor,
                      borderRadius:
                        design.eyeInnerStyle === "dot"
                          ? "50%"
                          : design.eyeInnerStyle === "rounded"
                          ? "3px"
                          : design.eyeInnerStyle === "diamond"
                          ? "1px"
                          : "0px",
                      transform: design.eyeInnerStyle === "diamond" ? "rotate(45deg) scale(0.85)" : undefined,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Eye Outer Ring Selector */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">Outer Ring Shape</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {EYE_OUTER_STYLES.map((e) => {
                  const isSelected = design.eyeOuterStyle === e.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onChange({ ...design, eyeOuterStyle: e.id })}
                      className={`px-2.5 py-2 rounded-md border text-left text-xs transition-colors cursor-pointer flex items-center gap-2 min-w-0 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                          : "border-border bg-surface hover:bg-surface-hover text-foreground"
                      }`}
                    >
                      <span
                        className="w-4 h-4 border-2 shrink-0 transition-all"
                        style={{
                          borderColor: "currentColor",
                          opacity: isSelected ? 1 : 0.6,
                          borderRadius:
                            e.id === "circle"
                              ? "50%"
                              : e.id === "rounded"
                              ? "4px"
                              : e.id === "leaf"
                              ? "6px 0px 6px 0px"
                              : "0px",
                        }}
                      />
                      <span className="truncate text-xs font-medium">{e.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Eye Inner Core Selector */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <Label className="text-[11px] font-semibold text-muted-foreground">Inner Core Shape</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {EYE_INNER_STYLES.map((e) => {
                  const isSelected = design.eyeInnerStyle === e.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onChange({ ...design, eyeInnerStyle: e.id })}
                      className={`px-2.5 py-2 rounded-md border text-left text-xs transition-colors cursor-pointer flex items-center gap-2 min-w-0 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                          : "border-border bg-surface hover:bg-surface-hover text-foreground"
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        <span
                          className="shrink-0 transition-all"
                          style={{
                            backgroundColor: "currentColor",
                            opacity: isSelected ? 1 : 0.6,
                            width: e.id === "diamond" ? "9px" : "10px",
                            height: e.id === "diamond" ? "9px" : "10px",
                            borderRadius:
                              e.id === "dot"
                                ? "50%"
                                : e.id === "rounded"
                                ? "2.5px"
                                : e.id === "diamond"
                                ? "1px"
                                : "0px",
                            transform: e.id === "diamond" ? "rotate(45deg)" : undefined,
                          }}
                        />
                      </div>
                      <span className="truncate text-xs font-medium">{e.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* =========================================================================
              03 COLOR: System Colors, Eye Linking, Gradients & Contrast Check
             ========================================================================= */}
          <Section
            id="inspector-section-color"
            sectionNumber="03"
            title="Colors & Gradients"
            icon={<Palette className="h-3.5 w-3.5" />}
            isOpen={openSections.color}
            onToggle={() => toggleSection("color")}
          >
            {/* Inline Contrast Feedback */}
            <div
              className={`p-2 rounded-md border flex items-center justify-between text-[11px] gap-2 min-w-0 ${
                isContrastStrong
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {isContrastStrong ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate">
                  {isContrastStrong
                    ? "Strong separation (good scanability)"
                    : "Low contrast ratio (scan failure risk)"}
                </span>
              </div>
              <span className="font-mono text-[10px] font-bold shrink-0">{contrastRatio.toFixed(1)}:1</span>
            </div>

            {/* Foreground & Background Pickers */}
            <div className="grid grid-cols-2 gap-2 min-w-0">
              <div className="space-y-1 min-w-0">
                <Label className="text-[11px] font-semibold text-muted-foreground truncate block">Modules Color</Label>
                <ColorPicker
                  value={design.fgColor}
                  onChange={(hex) => onChange({ ...design, fgColor: hex })}
                  className="w-full justify-between h-8 text-[11px]"
                />
              </div>

              <div className="space-y-1 min-w-0">
                <Label className="text-[11px] font-semibold text-muted-foreground truncate block">Background Color</Label>
                <ColorPicker
                  value={design.bgColor}
                  onChange={(hex) => onChange({ ...design, bgColor: hex })}
                  className="w-full justify-between h-8 text-[11px]"
                />
              </div>
            </div>

            {/* Eye Color Linking */}
            <div className="p-2.5 rounded-lg border border-border bg-surface-elevated/30 space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {areEyesLinked ? (
                    <Link className="h-3.5 w-3.5 text-primary shrink-0" />
                  ) : (
                    <Unlink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-[11px] font-semibold text-foreground truncate">
                    {areEyesLinked ? "Eye Colors Linked to Modules" : "Independent Eye Colors"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (areEyesLinked) {
                      // Unlink
                      onChange({
                        ...design,
                        eyeColor: design.fgColor,
                        eyeInnerColor: design.fgColor,
                      });
                    } else {
                      // Link
                      const next = { ...design };
                      delete next.eyeColor;
                      delete next.eyeInnerColor;
                      onChange(next);
                    }
                  }}
                  className="h-6 px-2 text-[10px] text-primary hover:underline cursor-pointer shrink-0"
                >
                  {areEyesLinked ? "Unlink" : "Link"}
                </Button>
              </div>

              {!areEyesLinked && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 min-w-0">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] text-muted-foreground block truncate">Eye Outer Color</span>
                    <ColorPicker
                      value={design.eyeColor || design.fgColor}
                      onChange={(hex) => onChange({ ...design, eyeColor: hex })}
                      className="w-full justify-between h-7 text-[10px]"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] text-muted-foreground block truncate">Eye Inner Color</span>
                    <ColorPicker
                      value={design.eyeInnerColor || design.fgColor}
                      onChange={(hex) => onChange({ ...design, eyeInnerColor: hex })}
                      className="w-full justify-between h-7 text-[10px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Gradient Toggle & Config */}
            <div className="pt-2 border-t border-border/60 space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <Label className="text-xs font-semibold truncate block">Linear Gradient</Label>
                  <p className="text-[10px] text-muted-foreground truncate">Smooth dual-color colorway</p>
                </div>
                <Switch
                  checked={Boolean(design.gradient)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange({
                        ...design,
                        gradient: {
                          type: "linear",
                          startColor: design.fgColor,
                          endColor: "#FA520F",
                          angle: 45,
                        },
                      });
                    } else {
                      const next = { ...design };
                      delete next.gradient;
                      onChange(next);
                    }
                  }}
                  className="shrink-0"
                />
              </div>

              {design.gradient && (
                <div className="space-y-2 p-2.5 rounded-md border border-border bg-surface-elevated/50 mt-1 min-w-0">
                  <div className="grid grid-cols-2 gap-2 min-w-0">
                    <div className="min-w-0">
                      <span className="text-[10px] text-muted-foreground block mb-1 truncate">Start Color</span>
                      <ColorPicker
                        value={design.gradient.startColor}
                        onChange={(hex) =>
                          onChange({
                            ...design,
                            gradient: { ...design.gradient!, startColor: hex },
                          })
                        }
                        className="w-full justify-between h-7 text-[10px]"
                      />
                    </div>

                    <div className="min-w-0">
                      <span className="text-[10px] text-muted-foreground block mb-1 truncate">End Color</span>
                      <ColorPicker
                        value={design.gradient.endColor}
                        onChange={(hex) =>
                          onChange({
                            ...design,
                            gradient: { ...design.gradient!, endColor: hex },
                          })
                        }
                        className="w-full justify-between h-7 text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] min-w-0">
                      <span className="text-muted-foreground truncate">Angle</span>
                      <span className="font-mono shrink-0">{design.gradient.angle}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={15}
                      value={design.gradient.angle || 45}
                      onChange={(e) =>
                        onChange({
                          ...design,
                          gradient: { ...design.gradient!, angle: Number(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* =========================================================================
              04 LOGO: Brand Center Logo & Controls
             ========================================================================= */}
          <Section
            id="inspector-section-logo"
            sectionNumber="04"
            title="Center Logo & Badge"
            icon={<ImageIcon className="h-3.5 w-3.5" />}
            isOpen={openSections.logo}
            onToggle={() => toggleSection("logo")}
          >
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold text-muted-foreground">Brand Mark Asset</Label>
              {design.logo?.url ? (
                <div className="p-2.5 rounded-lg border border-border bg-surface-elevated flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={design.logo.url}
                      alt="Logo Preview"
                      className="h-8 w-8 rounded object-contain border border-border bg-white p-0.5"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-foreground truncate block">Logo Attached</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Scale: {Math.round((design.logo.scale || 0.24) * 100)}%
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeLogo}
                    className="h-7 w-7 text-muted-foreground hover:text-rose-500 cursor-pointer"
                    title="Remove Logo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAssetPickerOpen(true)}
                    className="h-9 text-xs gap-1.5 cursor-pointer border-dashed"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-[#FA520F]" />
                    <span>Choose Vault</span>
                  </Button>
                  <label className="flex items-center justify-center gap-1.5 h-9 px-2.5 border border-dashed border-border hover:border-primary/50 rounded-md cursor-pointer transition-colors bg-surface text-muted-foreground hover:text-foreground text-xs">
                    <Upload className="h-3.5 w-3.5 text-primary" />
                    <span>{isUploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                    <input
                      type="file"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {design.logo && (
                <div className="space-y-2.5 pt-1">
                  {/* Size Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Logo Size Ratio</span>
                      <span className="font-mono">{Math.round((design.logo.scale || 0.24) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={32}
                      step={2}
                      value={Math.round((design.logo.scale || 0.24) * 100)}
                      onChange={(e) =>
                        onChange({
                          ...design,
                          logo: { ...design.logo!, scale: Number(e.target.value) / 100 },
                        })
                      }
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Padding Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Plate Padding</span>
                      <span className="font-mono">{design.logo.padding || 4}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={12}
                      step={1}
                      value={design.logo.padding || 4}
                      onChange={(e) =>
                        onChange({
                          ...design,
                          logo: { ...design.logo!, padding: Number(e.target.value) },
                        })
                      }
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Shape Selector */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground block">Plate Background Shape</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["square", "circle"] as const).map((shape) => (
                        <button
                          key={shape}
                          type="button"
                          onClick={() =>
                            onChange({
                              ...design,
                              logo: { ...design.logo!, shape },
                            })
                          }
                          className={`py-1 px-2 rounded border text-xs capitalize transition-colors cursor-pointer ${
                            design.logo?.shape === shape
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border bg-surface hover:bg-surface-hover text-foreground"
                          }`}
                        >
                          {shape} Plate
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* =========================================================================
              05 FRAME: NXTQR Frame Geometry Library with Live Dynamic Thumbnails
             ========================================================================= */}
          <Section
            id="inspector-section-frame"
            sectionNumber="05"
            title="Frame Callout & Banners"
            icon={<Square className="h-3.5 w-3.5" />}
            isOpen={openSections.frame}
            onToggle={() => toggleSection("frame")}
          >
            {(() => {
              const currentFrame = design.frame || {
                style: "none",
                text: "SCAN ME",
                bgColor: design.fgColor,
                textColor: "#FFFFFF",
              };

              return (
                <div className="space-y-3">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Frame Geometry</Label>

                  {/* Grid of Real Dynamic Mini Frame Previews */}
                  <div className="grid grid-cols-3 gap-2">
                    {FRAME_STYLES.map((f) => {
                      const isSelected = currentFrame.style === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() =>
                            onChange({
                              ...design,
                              frame: {
                                ...currentFrame,
                                style: f.id as any,
                              },
                            })
                          }
                          className={`group relative p-1.5 rounded-xl border-2 text-center transition-all duration-150 cursor-pointer flex flex-col items-center gap-1 ${
                            isSelected
                              ? "border-primary bg-primary/[0.08] ring-2 ring-primary/20 shadow-xs z-10"
                              : "border-border/70 bg-surface hover:border-primary/50 hover:bg-primary/[0.02] hover:shadow-xs z-0 hover:z-10"
                          }`}
                        >
                          {/* Dynamic Mini Frame SVG */}
                          <div className="w-12 h-14 rounded bg-background p-0.5 border border-border/80 flex items-center justify-center">
                            <MiniPreviewThumbnail
                              designPartial={{
                                fgColor: design.fgColor,
                                bgColor: design.bgColor,
                                frame: {
                                  style: f.id as any,
                                  text: "SCAN",
                                  bgColor: currentFrame.bgColor || design.fgColor,
                                  textColor: currentFrame.textColor || "#FFFFFF",
                                },
                              }}
                              className="w-full h-full"
                            />
                          </div>
                          <span className={`text-[10px] font-semibold truncate max-w-full ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}>
                            {f.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Frame Customization when active */}
                  {currentFrame.style !== "none" && (
                    <div className="space-y-2.5 pt-2 border-t border-border/60">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Frame Callout Text</Label>
                        <Input
                          value={currentFrame.text || ""}
                          onChange={(e) =>
                            onChange({
                              ...design,
                              frame: { ...currentFrame, text: e.target.value.toUpperCase() },
                            })
                          }
                          placeholder="SCAN TO OPEN"
                          maxLength={28}
                          className="text-xs uppercase font-semibold font-mono"
                        />
                      </div>

                      {/* Frame Text Quick Presets */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground block">Quick Text Presets</span>
                        <div className="flex flex-wrap gap-1">
                          {FRAME_TEXT_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() =>
                                onChange({
                                  ...design,
                                  frame: { ...currentFrame, text: preset },
                                })
                              }
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-border bg-surface-elevated hover:border-primary/50 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Frame Colors */}
                      <div className="grid grid-cols-2 gap-2 pt-1 min-w-0">
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] text-muted-foreground block truncate">Frame Background</span>
                          <ColorPicker
                            value={currentFrame.bgColor || design.fgColor}
                            onChange={(hex) =>
                              onChange({
                                ...design,
                                frame: { ...currentFrame, bgColor: hex },
                              })
                            }
                            className="w-full justify-between h-7 text-[10px]"
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] text-muted-foreground block truncate">Text Color</span>
                          <ColorPicker
                            value={currentFrame.textColor || "#FFFFFF"}
                            onChange={(hex) =>
                              onChange({
                                ...design,
                                frame: { ...currentFrame, textColor: hex },
                              })
                            }
                            className="w-full justify-between h-7 text-[10px]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </Section>

          {/* =========================================================================
              06 ADVANCED: Quiet Zone & Error Correction Resilience
             ========================================================================= */}
          <Section
            id="inspector-section-advanced"
            sectionNumber="06"
            title="Advanced Parameters"
            icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
            isOpen={openSections.advanced}
            onToggle={() => toggleSection("advanced")}
          >
            {/* Quiet Zone Slider */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-between text-[11px] min-w-0">
                <Label className="text-[11px] font-semibold text-muted-foreground truncate">Quiet Zone Margin</Label>
                <span className="font-mono font-bold text-foreground shrink-0">{design.quietZone} modules</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={design.quietZone}
                onChange={(e) => onChange({ ...design, quietZone: Number(e.target.value) })}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-[10px] text-muted-foreground">
                ISO 18004 standard mandates minimum 4 modules for reliable camera edge boundary detection.
              </p>
            </div>

            {/* Error Correction Selector */}
            <div className="space-y-1.5 pt-2 border-t border-border/60 min-w-0">
              <Label className="text-[11px] font-semibold text-muted-foreground truncate block">
                Reed-Solomon Error Correction
              </Label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: "L", label: "L", desc: "7% rec", note: "Cleanest / lowest density" },
                  { id: "M", label: "M", desc: "15% rec", note: "Standard default" },
                  { id: "Q", label: "Q", desc: "25% rec", note: "Recommended with logos" },
                  { id: "H", label: "H", desc: "30% rec", note: "Maximum physical resilience" },
                ].map((ec) => {
                  const isSelected = design.errorCorrection === ec.id;
                  return (
                    <button
                      key={ec.id}
                      type="button"
                      onClick={() => onChange({ ...design, errorCorrection: ec.id as QrErrorCorrectionLevel })}
                      className={`p-1.5 rounded-md border text-center transition-colors cursor-pointer min-w-0 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                          : "border-border bg-surface hover:bg-surface-hover text-muted-foreground"
                      }`}
                    >
                      <span className="block font-bold text-xs">{ec.label}</span>
                      <span className="text-[9px] opacity-75 block truncate">{ec.desc}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Higher resilience creates denser matrices with smaller modules, requiring larger print dimensions.
              </p>
            </div>
          </Section>
        </CardContent>
      </Card>

      {/* Asset Vault Logo Picker */}
      <AssetPicker
        open={isAssetPickerOpen}
        onOpenChange={setIsAssetPickerOpen}
        orgSlug={orgSlug}
        allowedCategories={["IMAGE", "BRAND"]}
        title="Select Logo from Asset Vault"
        description="Choose an existing brand asset or upload a new logo to the vault."
        onSelect={handleSelectVaultLogo}
      />
    </div>
  );
}
