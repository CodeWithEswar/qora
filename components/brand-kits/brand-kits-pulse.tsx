import * as React from "react";
import { BrandKitPulseMetrics } from "@nxtqr/contracts";
import { Palette, QrCode, Layers, ImageIcon } from "lucide-react";

interface BrandKitsPulseProps {
  pulse: BrandKitPulseMetrics;
}

export function BrandKitsPulse({ pulse }: BrandKitsPulseProps) {
  const cards = [
    {
      label: "BRAND KITS",
      value: pulse.totalKits,
      sublabel: `${pulse.activeKits} active`,
      icon: <Palette className="w-3.5 h-3.5 text-[#FA520F]" />,
    },
    {
      label: "QRS USING KITS",
      value: pulse.totalAssignedQrs,
      sublabel: "Across workspace",
      icon: <QrCode className="w-3.5 h-3.5 text-emerald-500" />,
    },
    {
      label: "BRAND ASSETS",
      value: pulse.totalBrandAssets,
      sublabel: "Logos & vector marks",
      icon: <ImageIcon className="w-3.5 h-3.5 text-blue-500" />,
    },
    {
      label: "QR STYLE PRESETS",
      value: pulse.totalQrPresets,
      sublabel: "Validated geometries",
      icon: <Layers className="w-3.5 h-3.5 text-amber-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="relative p-3.5 sm:p-4 rounded-xl border border-border/80 bg-surface/60 backdrop-blur-sm flex flex-col justify-between overflow-hidden group hover:border-border transition-colors shadow-xs"
        >
          <div className="flex items-center justify-between gap-2 text-muted-foreground">
            <span className="text-[10px] font-bold tracking-wider uppercase">
              {card.label}
            </span>
            <div className="p-1 rounded-md bg-surface-elevated border border-border/60">
              {card.icon}
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
              {card.value}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {card.sublabel}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
