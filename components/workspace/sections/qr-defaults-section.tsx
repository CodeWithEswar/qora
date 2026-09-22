"use client";

import * as React from "react";
import {
  QrCode,
  Save,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WorkspaceControlPlaneOverview,
  WorkspaceQrDefaults,
  UpdateWorkspaceQrDefaultsRequest,
} from "@nxtqr/contracts";
import { renderQrSvg, evaluateScanability, QrDesignV1 } from "@nxtqr/qr-core";

interface QrDefaultsSectionProps {
  overview: WorkspaceControlPlaneOverview;
  onSave: (payload: UpdateWorkspaceQrDefaultsRequest) => Promise<void>;
  isSaving: boolean;
}

const PREVIEW_PAYLOAD = "https://nxtqr.vercel.app/preview";

export function QrDefaultsSection({
  overview,
  onSave,
  isSaving,
}: QrDefaultsSectionProps) {
  const { qrDefaults, userPermissions } = overview;

  const [errorCorrection, setErrorCorrection] = React.useState(qrDefaults.errorCorrection);
  const [quietZone, setQuietZone] = React.useState(qrDefaults.quietZone);
  const [moduleStyle, setModuleStyle] = React.useState(qrDefaults.moduleStyle);
  const [eyeOuterStyle, setEyeOuterStyle] = React.useState(qrDefaults.eyeOuterStyle);
  const [eyeInnerStyle, setEyeInnerStyle] = React.useState(qrDefaults.eyeInnerStyle);
  const [fgColor, setFgColor] = React.useState(qrDefaults.fgColor);
  const [bgColor, setBgColor] = React.useState(qrDefaults.bgColor);
  const [frameStyle, setFrameStyle] = React.useState(qrDefaults.frameStyle);
  const [frameText, setFrameText] = React.useState(qrDefaults.frameText);
  const [format, setFormat] = React.useState(qrDefaults.format);
  const [size, setSize] = React.useState(qrDefaults.size);

  React.useEffect(() => {
    setErrorCorrection(qrDefaults.errorCorrection);
    setQuietZone(qrDefaults.quietZone);
    setModuleStyle(qrDefaults.moduleStyle);
    setEyeOuterStyle(qrDefaults.eyeOuterStyle);
    setEyeInnerStyle(qrDefaults.eyeInnerStyle);
    setFgColor(qrDefaults.fgColor);
    setBgColor(qrDefaults.bgColor);
    setFrameStyle(qrDefaults.frameStyle);
    setFrameText(qrDefaults.frameText);
    setFormat(qrDefaults.format);
    setSize(qrDefaults.size);
  }, [qrDefaults]);

  // Compute live design object for rendering and scanability
  const activeDesign: QrDesignV1 = React.useMemo(() => {
    return {
      schemaVersion: 1,
      moduleStyle,
      eyeOuterStyle,
      eyeInnerStyle,
      fgColor,
      bgColor,
      quietZone,
      errorCorrection,
      frame: {
        style: frameStyle as any,
        text: frameText,
        bgColor: fgColor,
        textColor: bgColor,
      },
    };
  }, [
    moduleStyle,
    eyeOuterStyle,
    eyeInnerStyle,
    fgColor,
    bgColor,
    quietZone,
    errorCorrection,
    frameStyle,
    frameText,
  ]);

  // Render SVG string in memory
  const previewSvg = React.useMemo(() => {
    try {
      return renderQrSvg({
        content: PREVIEW_PAYLOAD,
        design: activeDesign,
        moduleSize: 5,
      });
    } catch {
      return "";
    }
  }, [activeDesign]);

  // Run pure Scanability engine calculation in memory
  const scanabilityResult = React.useMemo(() => {
    try {
      return evaluateScanability(PREVIEW_PAYLOAD, activeDesign);
    } catch {
      return null;
    }
  }, [activeDesign]);

  const hasChanges =
    errorCorrection !== qrDefaults.errorCorrection ||
    quietZone !== qrDefaults.quietZone ||
    moduleStyle !== qrDefaults.moduleStyle ||
    eyeOuterStyle !== qrDefaults.eyeOuterStyle ||
    eyeInnerStyle !== qrDefaults.eyeInnerStyle ||
    fgColor !== qrDefaults.fgColor ||
    bgColor !== qrDefaults.bgColor ||
    frameStyle !== qrDefaults.frameStyle ||
    frameText !== qrDefaults.frameText ||
    format !== qrDefaults.format ||
    size !== qrDefaults.size;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || isSaving || !userPermissions.canUpdate) return;

    await onSave({
      qrDefaults: {
        errorCorrection,
        quietZone,
        moduleStyle,
        eyeOuterStyle,
        eyeInnerStyle,
        fgColor,
        bgColor,
        frameStyle,
        frameText,
        format,
        size,
      },
    });
  };

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-bold font-display">QR Creation Defaults</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Establish organization-wide default error correction, geometry modules, finder eyes, and print export specifications.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Error Correction & Quiet Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="qr-ec" className="text-xs font-medium text-foreground">
                    Error Correction Level
                  </Label>
                  <Select
                    value={errorCorrection}
                    onValueChange={(val: any) => setErrorCorrection(val)}
                    disabled={!userPermissions.canUpdate || isSaving}
                  >
                    <SelectTrigger id="qr-ec" className="h-9 text-xs font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L" className="text-xs font-mono">
                        Level L (7% recovery)
                      </SelectItem>
                      <SelectItem value="M" className="text-xs font-mono">
                        Level M (15% recovery)
                      </SelectItem>
                      <SelectItem value="Q" className="text-xs font-mono">
                        Level Q (25% recovery — Recommended)
                      </SelectItem>
                      <SelectItem value="H" className="text-xs font-mono">
                        Level H (30% recovery — Logo safe)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="qr-qz" className="text-xs font-medium text-foreground">
                    Quiet Zone Margin
                  </Label>
                  <Select
                    value={String(quietZone)}
                    onValueChange={(val) => setQuietZone(Number(val))}
                    disabled={!userPermissions.canUpdate || isSaving}
                  >
                    <SelectTrigger id="qr-qz" className="h-9 text-xs font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1" className="text-xs font-mono">1 module (Tight)</SelectItem>
                      <SelectItem value="2" className="text-xs font-mono">2 modules (Compact)</SelectItem>
                      <SelectItem value="4" className="text-xs font-mono">4 modules (ISO Standard)</SelectItem>
                      <SelectItem value="6" className="text-xs font-mono">6 modules (Generous)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Module Style & Finder Eye Geometry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="qr-style" className="text-xs font-medium text-foreground">
                    Matrix Dot Style
                  </Label>
                  <Select
                    value={moduleStyle}
                    onValueChange={(val: any) => setModuleStyle(val)}
                    disabled={!userPermissions.canUpdate || isSaving}
                  >
                    <SelectTrigger id="qr-style" className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="squares" className="text-xs">Crisp Squares</SelectItem>
                      <SelectItem value="rounded" className="text-xs">Smooth Rounded</SelectItem>
                      <SelectItem value="dots" className="text-xs">Circular Dots</SelectItem>
                      <SelectItem value="diamond" className="text-xs">Precision Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="qr-eye" className="text-xs font-medium text-foreground">
                    Finder Eye Geometry
                  </Label>
                  <Select
                    value={eyeOuterStyle}
                    onValueChange={(val: any) => setEyeOuterStyle(val)}
                    disabled={!userPermissions.canUpdate || isSaving}
                  >
                    <SelectTrigger id="qr-eye" className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square" className="text-xs">Square Eyes</SelectItem>
                      <SelectItem value="rounded" className="text-xs">Rounded Eyes</SelectItem>
                      <SelectItem value="leaf" className="text-xs">Organic Leaf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="qr-fg" className="text-xs font-medium text-foreground">
                    Foreground Color
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="qr-fg"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      disabled={!userPermissions.canUpdate || isSaving}
                      className="h-8 w-8 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      disabled={!userPermissions.canUpdate || isSaving}
                      className="h-8 font-mono text-xs max-w-[120px]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="qr-bg" className="text-xs font-medium text-foreground">
                    Background Color
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="qr-bg"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      disabled={!userPermissions.canUpdate || isSaving}
                      className="h-8 w-8 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      disabled={!userPermissions.canUpdate || isSaving}
                      className="h-8 font-mono text-xs max-w-[120px]"
                    />
                  </div>
                </div>
              </div>

              {/* Export Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="qr-format" className="text-xs font-medium text-foreground">
                    Default Export Format
                  </Label>
                  <Select
                    value={format}
                    onValueChange={(val: any) => setFormat(val)}
                    disabled={!userPermissions.canUpdate || isSaving}
                  >
                    <SelectTrigger id="qr-format" className="h-9 text-xs font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png" className="text-xs font-mono">PNG (Raster bitmap)</SelectItem>
                      <SelectItem value="svg" className="text-xs font-mono">SVG (Infinite vector)</SelectItem>
                      <SelectItem value="pdf" className="text-xs font-mono">PDF (Commercial print)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="qr-size" className="text-xs font-medium text-foreground">
                    Default Canvas Dimension
                  </Label>
                  <Select
                    value={String(size)}
                    onValueChange={(val) => setSize(Number(val))}
                    disabled={!userPermissions.canUpdate || isSaving}
                  >
                    <SelectTrigger id="qr-size" className="h-9 text-xs font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="512" className="text-xs font-mono">512 × 512 px</SelectItem>
                      <SelectItem value="1024" className="text-xs font-mono">1024 × 1024 px (Default)</SelectItem>
                      <SelectItem value="2048" className="text-xs font-mono">2048 × 2048 px (Hi-Res)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right Column: Live QR Preview & Pure Scanability Calculation (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-4 p-4 rounded-xl border border-border/60 bg-surface/30">
              <div className="w-full flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Default QR Appearance
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Safe explicit preview
                </span>
              </div>

              {/* Vector SVG Render Container */}
              <div className="relative p-4 rounded-xl border border-border/80 bg-background shadow-xs flex items-center justify-center min-h-[190px]">
                {previewSvg ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: previewSvg }}
                    className="max-h-[160px] max-w-[160px] flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <QrCode className="h-8 w-8 text-muted-foreground/40 animate-pulse" />
                    <span className="text-xs text-muted-foreground mt-2 font-mono">
                      Rendering preview...
                    </span>
                  </div>
                )}
              </div>

              {/* Pure Scanability Diagnostics */}
              <div className="w-full space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5 font-display text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span>SCANABILITY ENGINE</span>
                  </span>

                  {scanabilityResult && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                        scanabilityResult.status === "pass"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : scanabilityResult.status === "warning" || scanabilityResult.status === "notice"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      {scanabilityResult.status}
                    </span>
                  )}
                </div>

                {scanabilityResult?.findings?.some((f) => f.severity === "blocking" || f.blocking) ? (
                  <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-[11px] text-destructive space-y-1">
                    <span className="font-bold block">Scanability Blockers:</span>
                    {scanabilityResult.findings
                      .filter((f) => f.severity === "blocking" || f.blocking)
                      .map((b, idx) => (
                        <p key={idx}>• {b.description || b.title}</p>
                      ))}
                  </div>
                ) : scanabilityResult?.findings?.some((f) => f.severity === "warning") ? (
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 space-y-1">
                    <span className="font-bold block">Scanability Warnings:</span>
                    {scanabilityResult.findings
                      .filter((f) => f.severity === "warning")
                      .map((w, idx) => (
                        <p key={idx}>• {w.description || w.title}</p>
                      ))}
                  </div>
                ) : (
                  <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Color contrast and quiet zone verify at 100% readability standard.</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section Save Bar */}
          {userPermissions.canUpdate && (
            <div className="pt-4 flex items-center justify-between border-t border-border/40">
              <span className="text-[11px] text-muted-foreground font-mono">
                {hasChanges ? "● Unsaved QR default changes" : "All QR defaults saved"}
              </span>

              <Button
                type="submit"
                size="sm"
                disabled={!hasChanges || isSaving}
                className="gap-1.5 text-xs h-8"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? "Saving..." : "Save QR Defaults"}</span>
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
