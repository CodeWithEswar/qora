"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// In-memory recent colors for current session
const sessionRecentColors: string[] = ["#FA520F", "#121212", "#FFFFFF", "#FBF8F1", "#10B981", "#6366F1"];

export const BRAND_COLOR_PRESETS = [
  "#FA520F", // NXTQR Orange
  "#FFB83E", // Amber Sun
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Rose
  "#EF4444", // Red
  "#FFFFFF", // Pure White
  "#F8F9FA", // Light Neutral
  "#FBF8F1", // Sunlit Cream
  "#64748B", // Slate
  "#2A2825", // Dark Umber
  "#1F1F1F", // Dark Charcoal
  "#121212", // Surface Black
  "#000000", // Pitch Black
];

/* =========================================================================
   COLOR CONVERSION MATH
   ========================================================================= */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, "0").toUpperCase();
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r = r / 255;
  g = g / 255;
  b = b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else if (max === b) {
      h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  s = s / 100;
  v = v / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h >= 0 && h < 60) {
    r1 = c; g1 = x; b1 = 0;
  } else if (h >= 60 && h < 120) {
    r1 = x; g1 = c; b1 = 0;
  } else if (h >= 120 && h < 180) {
    r1 = 0; g1 = c; b1 = x;
  } else if (h >= 180 && h < 240) {
    r1 = 0; g1 = x; b1 = c;
  } else if (h >= 240 && h < 300) {
    r1 = x; g1 = 0; b1 = c;
  } else if (h >= 300 && h <= 360) {
    r1 = c; g1 = 0; b1 = x;
  }
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 20, s: 95, v: 98 };
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

/* =========================================================================
   COLOR PICKER CONTENT (THE INTERACTIVE DIALOG/POPOVER BODY)
   ========================================================================= */

interface ColorPickerContentProps {
  color: string;
  onChange: (hex: string) => void;
  onClose?: () => void;
}

export function ColorPickerContent({ color, onChange, onClose }: ColorPickerContentProps) {
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [hexInput, setHexInput] = useState(color.toUpperCase());
  const [mode, setMode] = useState<"hex" | "rgb">("hex");

  // Track dragging state
  const satValRef = useRef<HTMLDivElement>(null);
  const isDraggingSatVal = useRef(false);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const isDraggingHue = useRef(false);

  // Sync state if external color changes
  useEffect(() => {
    const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);
    if (color && color.toUpperCase() !== currentHex.toUpperCase()) {
      const newHsv = hexToHsv(color);
      setHsv(newHsv);
      setHexInput(color.toUpperCase());
    }
  }, [color]);

  const updateColor = useCallback(
    (newH: number, newS: number, newV: number) => {
      const clampedH = Math.max(0, Math.min(360, newH));
      const clampedS = Math.max(0, Math.min(100, newS));
      const clampedV = Math.max(0, Math.min(100, newV));
      setHsv({ h: clampedH, s: clampedS, v: clampedV });
      const hex = hsvToHex(clampedH, clampedS, clampedV);
      setHexInput(hex);
      onChange(hex);

      // Add to session recent colors
      if (!sessionRecentColors.includes(hex)) {
        sessionRecentColors.unshift(hex);
        if (sessionRecentColors.length > 8) sessionRecentColors.pop();
      }
    },
    [onChange]
  );

  // Saturation / Value Drag Handler
  const handleSatValPointer = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (!satValRef.current) return;
      const rect = satValRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      const s = (x / rect.width) * 100;
      const v = (1 - y / rect.height) * 100;
      updateColor(hsv.h, s, v);
    },
    [hsv.h, updateColor]
  );

  const onSatValPointerDown = (e: React.PointerEvent) => {
    isDraggingSatVal.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleSatValPointer(e);
  };

  const onSatValPointerMove = (e: React.PointerEvent) => {
    if (isDraggingSatVal.current) {
      handleSatValPointer(e);
    }
  };

  const onSatValPointerUp = (e: React.PointerEvent) => {
    isDraggingSatVal.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Hue Slider Drag Handler
  const handleHuePointer = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (!hueSliderRef.current) return;
      const rect = hueSliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const h = (x / rect.width) * 360;
      updateColor(h, hsv.s, hsv.v);
    },
    [hsv.s, hsv.v, updateColor]
  );

  const onHuePointerDown = (e: React.PointerEvent) => {
    isDraggingHue.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleHuePointer(e);
  };

  const onHuePointerMove = (e: React.PointerEvent) => {
    if (isDraggingHue.current) {
      handleHuePointer(e);
    }
  };

  const onHuePointerUp = (e: React.PointerEvent) => {
    isDraggingHue.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Native EyeDropper API
  const hasEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;

  const handleEyeDropper = async () => {
    if (!hasEyeDropper) return;
    try {
      // @ts-ignore - EyeDropper is a modern Web API
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        const pickedHex = result.sRGBHex.toUpperCase();
        const newHsv = hexToHsv(pickedHex);
        updateColor(newHsv.h, newHsv.s, newHsv.v);
      }
    } catch {
      // User cancelled pipette
    }
  };

  // Hex Text Input commit
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setHexInput(val);
    const cleaned = val.startsWith("#") ? val : `#${val}`;
    const rgb = hexToRgb(cleaned);
    if (rgb) {
      const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHsv(newHsv);
      onChange(cleaned);
    }
  };

  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);
  const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);

  const copyHex = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentHex);
      toast.success(`Copied ${currentHex} to clipboard`);
    }
  };

  return (
    <div className="w-[268px] select-none p-1 flex flex-col gap-3 font-sans">
      {/* 1. Interactive 2D Saturation / Value Canvas */}
      <div
        ref={satValRef}
        onPointerDown={onSatValPointerDown}
        onPointerMove={onSatValPointerMove}
        onPointerUp={onSatValPointerUp}
        className="w-full h-36 rounded-lg relative overflow-hidden cursor-crosshair touch-none shadow-inner border border-black/10 dark:border-white/10"
        style={{
          backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
        }}
      >
        {/* Layer 1: White Gradient (Horizontal) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0))",
          }}
        />
        {/* Layer 2: Black Gradient (Vertical) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, #000000, rgba(0, 0, 0, 0))",
          }}
        />

        {/* Reticle Circle */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-[0_0_2px_rgba(0,0,0,0.8)] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform"
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            backgroundColor: currentHex,
          }}
        />
      </div>

      {/* 2. Controls Bar: Eyedropper, Hue Slider, Current Swatch */}
      <div className="flex items-center gap-2.5 px-0.5">
        {hasEyeDropper && (
          <button
            type="button"
            onClick={handleEyeDropper}
            title="Sample color from screen"
            className="w-7 h-7 rounded-md border border-border/80 bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
          >
            <NxtqrIcon icon="solar:pipette-linear" size={15} />
          </button>
        )}

        {/* Rainbow Hue Spectrum Slider */}
        <div
          ref={hueSliderRef}
          onPointerDown={onHuePointerDown}
          onPointerMove={onHuePointerMove}
          onPointerUp={onHuePointerUp}
          className="flex-1 h-3.5 rounded-full relative cursor-pointer touch-none shadow-xs border border-black/10 dark:border-white/10"
          style={{
            background:
              "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
          }}
        >
          {/* Slider Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-zinc-800 dark:border-zinc-900 shadow-md pointer-events-none"
            style={{
              left: `${(hsv.h / 360) * 100}%`,
            }}
          />
        </div>

        {/* Live Current Swatch */}
        <div
          className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm shrink-0"
          style={{ backgroundColor: currentHex }}
          title={currentHex}
        />
      </div>

      {/* 3. Value Inputs (Hex vs RGB) */}
      <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border/80 bg-muted/40">
        <button
          type="button"
          onClick={() => setMode(mode === "hex" ? "rgb" : "hex")}
          className="px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground hover:text-foreground uppercase transition-colors shrink-0"
        >
          {mode === "hex" ? "HEX" : "RGB"}
        </button>

        {mode === "hex" ? (
          <div className="flex-1 flex items-center gap-1">
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              maxLength={7}
              placeholder="#FA520F"
              className="w-full bg-transparent text-xs font-mono font-medium text-foreground uppercase outline-none focus:ring-0 px-1"
            />
            <button
              type="button"
              onClick={copyHex}
              title="Copy hex code"
              className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <NxtqrIcon icon="solar:copy-linear" size={13} />
            </button>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-3 gap-1 text-[11px] font-mono text-center">
            <span className="bg-background/80 rounded py-0.5">{currentRgb.r}</span>
            <span className="bg-background/80 rounded py-0.5">{currentRgb.g}</span>
            <span className="bg-background/80 rounded py-0.5">{currentRgb.b}</span>
          </div>
        )}
      </div>

      {/* 4. Brand & Theme Preset Swatches */}
      <div className="space-y-1.5 pt-1 border-t border-border/60">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground">
          <span>Palette</span>
          <span className="text-[9px] lowercase opacity-60">presets</span>
        </div>

        <div className="grid grid-cols-8 gap-1.5">
          {BRAND_COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                const newHsv = hexToHsv(preset);
                updateColor(newHsv.h, newHsv.s, newHsv.v);
              }}
              title={preset}
              className={cn(
                "w-6 h-6 rounded-md border transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-xs",
                currentHex.toUpperCase() === preset.toUpperCase()
                  ? "border-[#FA520F] ring-2 ring-[#FA520F]/30 z-10"
                  : "border-black/10 dark:border-white/15"
              )}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </div>

      {/* 5. Recent Colors in Current Session */}
      {sessionRecentColors.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-border/60">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground">
            <span>Recent</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {sessionRecentColors.map((recent, idx) => (
              <button
                key={`${recent}_${idx}`}
                type="button"
                onClick={() => {
                  const newHsv = hexToHsv(recent);
                  updateColor(newHsv.h, newHsv.s, newHsv.v);
                }}
                title={recent}
                className={cn(
                  "w-5 h-5 rounded-full border transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-xs",
                  currentHex.toUpperCase() === recent.toUpperCase()
                    ? "border-[#FA520F] ring-2 ring-[#FA520F]/30"
                    : "border-black/10 dark:border-white/15"
                )}
                style={{ backgroundColor: recent }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   FLAGSHIP NXTQR COLOR PICKER (TRIGGER + POPOVER)
   ========================================================================= */

interface ColorPickerProps {
  value?: string;
  onChange: (hex: string) => void;
  label?: string;
  showHex?: boolean;
  className?: string;
  swatchClassName?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

export function ColorPicker({
  value,
  onChange,
  label,
  showHex = true,
  className,
  swatchClassName,
  align = "start",
  side = "bottom",
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const safeColor = value || "#FA520F";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex items-center gap-2 p-1 rounded-lg border border-border/80 bg-surface hover:bg-surface-hover transition-colors cursor-pointer text-left select-none",
            className
          )}
        >
          {/* Swatch Pill */}
          <div
            className={cn(
              "w-6 h-6 rounded-md border border-black/15 dark:border-white/20 shadow-xs shrink-0 transition-transform group-hover:scale-105",
              swatchClassName
            )}
            style={{ backgroundColor: safeColor }}
          />

          {/* Optional Label or Hex Readout */}
          {showHex && (
            <span className="font-mono text-[11px] uppercase text-foreground/90 font-medium truncate pr-1">
              {safeColor}
            </span>
          )}

          {label && (
            <span className="text-xs text-muted-foreground truncate">{label}</span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        side={side}
        sideOffset={6}
        className="w-auto p-3 bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl z-[70]"
      >
        <ColorPickerContent
          color={safeColor}
          onChange={onChange}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
