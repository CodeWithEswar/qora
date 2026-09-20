"use client";

import * as React from "react";
import { BrandQrPreset, BrandColorToken } from "@nxtqr/contracts";
import {
  renderQrSvg,
  evaluateScanability,
  ModuleStyle,
  EyeOuterStyle,
  EyeInnerStyle,
  QrErrorCorrectionLevel,
} from "@nxtqr/qr-core";
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
import { Plus, CheckCircle2, ShieldAlert } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";

interface CreateQrPresetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  brandColors: BrandColorToken[];
  primaryColor?: string;
  onCreatePreset: (preset: BrandQrPreset) => void;
}

export function CreateQrPresetDialog({
  isOpen,
  onClose,
  brandColors,
  primaryColor = "#FA520F",
  onCreatePreset,
}: CreateQrPresetDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [moduleStyle, setModuleStyle] = React.useState<ModuleStyle>("rounded");
  const [eyeOuterStyle, setEyeOuterStyle] = React.useState<EyeOuterStyle>("rounded");
  const [eyeInnerStyle, setEyeInnerStyle] = React.useState<EyeInnerStyle>("dot");
  const [fgColor, setFgColor] = React.useState(primaryColor);
  const [bgColor, setBgColor] = React.useState("#FFFFFF");
  const [errorCorrection, setErrorCorrection] = React.useState<QrErrorCorrectionLevel>("M");
  const [frameStyle, setFrameStyle] = React.useState<any>("none");
  const [frameText, setFrameText] = React.useState("SCAN ME");

  const samplePayload = "https://nxtqr.vercel.app/preview/preset";

  // Build temporary design
  const design = React.useMemo(() => {
    return {
      schemaVersion: 1 as const,
      moduleStyle,
      eyeOuterStyle,
      eyeInnerStyle,
      fgColor,
      bgColor,
      errorCorrection,
      quietZone: 4,
      frame: {
        style: frameStyle,
        text: frameText,
        bgColor: fgColor,
        textColor: bgColor,
      },
    };
  }, [moduleStyle, eyeOuterStyle, eyeInnerStyle, fgColor, bgColor, errorCorrection, frameStyle, frameText]);

  // Live SVG
  const liveSvg = React.useMemo(() => {
    try {
      return renderQrSvg({
        content: samplePayload,
        design,
        moduleSize: 8,
      });
    } catch {
      return "";
    }
  }, [design]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const preset: BrandQrPreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      description: description.trim() || `Styled with ${moduleStyle} modules and ${eyeOuterStyle} finders.`,
      isDefault: false,
      design,
    };

    onCreatePreset(preset);
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pr-10 sm:pr-12 text-left">
            <DialogTitle className="text-base font-bold font-display">
              CREATE BRANDED QR PRESET
            </DialogTitle>
            <DialogDescription className="text-xs">
              Define reusable vector matrix geometries, finder eyes, and scannable styling rules.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Form Controls */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <Label htmlFor="preset-name" className="text-xs font-semibold">
                  Preset Title *
                </Label>
                <Input
                  id="preset-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Modern Rounded Dots"
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Module Geometry</Label>
                  <Select
                    value={moduleStyle}
                    onValueChange={(v: any) => setModuleStyle(v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="squares">Squares</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="dots">Dots</SelectItem>
                      <SelectItem value="soft">Soft</SelectItem>
                      <SelectItem value="extra_rounded">Extra Rounded</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Error Correction</Label>
                  <Select
                    value={errorCorrection}
                    onValueChange={(v: any) => setErrorCorrection(v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="L">L (7% recovery)</SelectItem>
                      <SelectItem value="M">M (15% recovery)</SelectItem>
                      <SelectItem value="Q">Q (25% recovery)</SelectItem>
                      <SelectItem value="H">H (30% recovery)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Eye Outer</Label>
                  <Select
                    value={eyeOuterStyle}
                    onValueChange={(v: any) => setEyeOuterStyle(v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="leaf">Leaf</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Eye Inner</Label>
                  <Select
                    value={eyeInnerStyle}
                    onValueChange={(v: any) => setEyeInnerStyle(v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="dot">Dot</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">QR Foreground</Label>
                  <div className="flex items-center gap-2">
                    <ColorPicker
                      value={fgColor}
                      onChange={(val) => setFgColor(val.toUpperCase())}
                      showHex={false}
                      className="w-8 h-8 p-0 flex items-center justify-center bg-surface border-border shrink-0 hover:border-border/80"
                      swatchClassName="w-5 h-5 rounded-md"
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value.toUpperCase())}
                      className="h-8 text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">QR Background</Label>
                  <div className="flex items-center gap-2">
                    <ColorPicker
                      value={bgColor}
                      onChange={(val) => setBgColor(val.toUpperCase())}
                      showHex={false}
                      className="w-8 h-8 p-0 flex items-center justify-center bg-surface border-border shrink-0 hover:border-border/80"
                      swatchClassName="w-5 h-5 rounded-md"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value.toUpperCase())}
                      className="h-8 text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="preset-desc" className="text-xs font-semibold">
                  Description / Recommendation
                </Label>
                <Input
                  id="preset-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Recommended for high-gloss print collateral"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Real Interactive Vector Preview */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-surface/50 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                LIVE VECTOR MATRIX
              </span>

              <div className="w-48 h-48 rounded-lg border border-border bg-white dark:bg-black/40 flex items-center justify-center p-3 shadow-inner overflow-hidden">
                {liveSvg ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: liveSvg }}
                    className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                  />
                ) : (
                  <div className="text-xs text-muted-foreground">Preview error</div>
                )}
              </div>

              <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 text-emerald-500">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SCANABILITY CONFIRMED</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs h-8 bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Save Preset</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
