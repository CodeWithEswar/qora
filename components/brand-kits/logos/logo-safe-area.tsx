"use client";

import * as React from "react";
import { BrandLogoAsset } from "@nxtqr/contracts";
import { ShieldCheck, Eye } from "lucide-react";

interface LogoSafeAreaProps {
  logo: BrandLogoAsset;
  onUpdatePadding?: (newPadding: number) => void;
}

export function LogoSafeArea({ logo, onUpdatePadding }: LogoSafeAreaProps) {
  const [padding, setPadding] = React.useState(logo.safeAreaPadding || 8);

  const handlePaddingChange = (val: number) => {
    setPadding(val);
    if (onUpdatePadding) {
      onUpdatePadding(val);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border/80 bg-surface/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FA520F]" />
          <span>LOGO PROTECTED SAFE AREA</span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          PADDING: {padding}PX
        </span>
      </div>

      {/* Visual Bounding Box Preview */}
      <div className="relative w-full h-44 rounded-lg border border-dashed border-[#FA520F]/40 bg-[#FA520F]/5 flex items-center justify-center overflow-hidden">
        {/* Safe Area Guideline lines */}
        <div
          className="relative border-2 border-dashed border-[#FA520F] rounded-md transition-all flex items-center justify-center bg-white dark:bg-black/40 shadow-sm"
          style={{
            padding: `${padding}px`,
          }}
        >
          {/* Logo inner bounding box */}
          <div className="w-20 h-20 flex items-center justify-center p-1">
            <img
              src={logo.url}
              alt={logo.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Indicator tags */}
          <span className="absolute -top-3 left-2 px-1.5 py-0.2 rounded text-[8px] font-mono bg-[#FA520F] text-white uppercase tracking-wider">
            SAFE BOUNDS ({padding}px)
          </span>
        </div>
      </div>

      {/* Range controls */}
      {onUpdatePadding && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Minimum Module Buffer</span>
            <span className="font-mono">{padding}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={32}
            step={2}
            value={padding}
            onChange={(e) => handlePaddingChange(Number(e.target.value))}
            className="w-full accent-[#FA520F] cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
