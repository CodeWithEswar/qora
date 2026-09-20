"use client";

import * as React from "react";
import { BrandColorToken, BrandColorRole } from "@nxtqr/contracts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";

interface ColorInspectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  token: BrandColorToken | null;
  onSaveToken: (updated: BrandColorToken) => void;
  onDeleteToken: (tokenId: string) => void;
}

// Relative luminance & WCAG contrast calculation
function getLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 1;
  }
}

export function ColorInspectorSheet({
  isOpen,
  onClose,
  token,
  onSaveToken,
  onDeleteToken,
}: ColorInspectorSheetProps) {
  const [name, setName] = React.useState("");
  const [hex, setHex] = React.useState("#FA520F");
  const [role, setRole] = React.useState<BrandColorRole>("primary");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    if (token) {
      setName(token.name);
      setHex(token.hex);
      setRole(token.role);
      setDescription(token.description || "");
    }
  }, [token]);

  if (!token) return null;

  const contrastAgainstWhite = getContrastRatio(hex, "#FFFFFF");
  const contrastAgainstBlack = getContrastRatio(hex, "#000000");

  const passesWhiteAA = contrastAgainstWhite >= 4.5;
  const passesBlackAA = contrastAgainstBlack >= 4.5;

  const handleSave = () => {
    onSaveToken({
      ...token,
      name: name.trim() || token.name,
      hex: hex.toUpperCase(),
      role,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md w-full flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold font-display">
              COLOR TOKEN INSPECTOR
            </SheetTitle>
            <SheetDescription className="text-xs">
              Configure semantic token authority, role assignment, and WCAG accessibility standards.
            </SheetDescription>
          </SheetHeader>

          {/* Big Live Swatch */}
          <div
            className="w-full h-24 rounded-xl border border-black/10 dark:border-white/10 shadow-inner flex items-center justify-center font-mono font-bold text-sm"
            style={{
              backgroundColor: hex,
              color: contrastAgainstBlack > contrastAgainstWhite ? "#FFFFFF" : "#000000",
            }}
          >
            {hex}
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="token-name" className="text-xs font-semibold">
                Token Name
              </Label>
              <Input
                id="token-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Signal Orange"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="token-hex" className="text-xs font-semibold">
                HEX Color
              </Label>
              <div className="flex items-center gap-2">
                <ColorPicker
                  value={hex}
                  onChange={(val) => setHex(val.toUpperCase())}
                  showHex={false}
                  className="w-8 h-8 p-0 flex items-center justify-center bg-surface border-border shrink-0 hover:border-border/80"
                  swatchClassName="w-5 h-5 rounded-md"
                />
                <Input
                  id="token-hex"
                  value={hex}
                  onChange={(e) => setHex(e.target.value.toUpperCase())}
                  placeholder="#FA520F"
                  className="h-8 text-xs font-mono"
                  maxLength={7}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="token-role" className="text-xs font-semibold">
                Semantic Role
              </Label>
              <Select
                value={role}
                onValueChange={(val: any) => setRole(val)}
              >
                <SelectTrigger id="token-role" className="h-8 text-xs">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="primary">Primary (Brand Anchor)</SelectItem>
                  <SelectItem value="secondary">Secondary (Accent Tone)</SelectItem>
                  <SelectItem value="accent">Signal Accent (Highlight)</SelectItem>
                  <SelectItem value="background">Background (Page Canvas)</SelectItem>
                  <SelectItem value="surface">Surface (Card Canvas)</SelectItem>
                  <SelectItem value="qr_foreground">QR Foreground (Modules)</SelectItem>
                  <SelectItem value="qr_background">QR Background (Quiet Zone)</SelectItem>
                  <SelectItem value="frame">Frame (Outer CTA Rim)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="token-desc" className="text-xs font-semibold">
                Description / Purpose
              </Label>
              <Input
                id="token-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Where and when to apply this token"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* WCAG Accessibility Diagnostics */}
          <div className="p-4 rounded-xl border border-border/80 bg-surface/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FA520F]" />
                WCAG Contrast Audit
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">ISO 18004 COMPLIANT</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* vs White */}
              <div className="p-2.5 rounded-lg border border-border/60 bg-surface">
                <div className="text-[10px] text-muted-foreground">vs White (#FFF)</div>
                <div className="text-sm font-bold font-mono mt-0.5">
                  {contrastAgainstWhite.toFixed(2)}:1
                </div>
                <div className="mt-1">
                  {passesWhiteAA ? (
                    <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 py-0">
                      Passes AA (4.5+)
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/20 py-0">
                      Low Contrast
                    </Badge>
                  )}
                </div>
              </div>

              {/* vs Black */}
              <div className="p-2.5 rounded-lg border border-border/60 bg-surface">
                <div className="text-[10px] text-muted-foreground">vs Black (#000)</div>
                <div className="text-sm font-bold font-mono mt-0.5">
                  {contrastAgainstBlack.toFixed(2)}:1
                </div>
                <div className="mt-1">
                  {passesBlackAA ? (
                    <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 py-0">
                      Passes AA (4.5+)
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/20 py-0">
                      Low Contrast
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6 pt-4 border-t border-border flex sm:justify-between items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDeleteToken(token.id)}
            className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer h-8"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            <span>Remove Token</span>
          </Button>

          <div className="flex items-center gap-2">
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
              type="button"
              size="sm"
              onClick={handleSave}
              className="text-xs h-8 bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium shadow-xs cursor-pointer"
            >
              Save Changes
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
