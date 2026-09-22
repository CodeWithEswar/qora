"use client";

import React from "react";
import { QrDesignV1 } from "@nxtqr/qr-core";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Icon } from "@iconify/react";

interface DesignFingerprintProps {
  design: QrDesignV1;
  className?: string;
  showLabels?: boolean;
}

export function DesignFingerprint({
  design,
  className = "",
  showLabels = false,
}: DesignFingerprintProps) {
  // Module indicator
  const moduleInfo = (() => {
    switch (design.moduleStyle) {
      case "dots":
        return { icon: "tabler:point-filled", label: "Dots Pattern", symbol: "●" };
      case "rounded":
      case "soft":
        return { icon: "tabler:square-rounded-filled", label: "Rounded Modules", symbol: "▣" };
      case "extra_rounded":
        return { icon: "tabler:circle-filled", label: "Smooth Radii", symbol: "◉" };
      case "diamond":
        return { icon: "tabler:diamond-filled", label: "Diamond Grid", symbol: "◆" };
      case "squares":
      default:
        return { icon: "tabler:square-filled", label: "Square Standard", symbol: "■" };
    }
  })();

  // Eye indicator
  const eyeInfo = (() => {
    switch (design.eyeOuterStyle) {
      case "circle":
        return { icon: "tabler:circle-dot", label: "Circle Eyes", symbol: "◎" };
      case "leaf":
        return { icon: "tabler:leaf", label: "Leaf Contour", symbol: "☘" };
      case "rounded":
        return { icon: "tabler:square-rounded", label: "Rounded Eyes", symbol: "▢" };
      case "square":
      default:
        return { icon: "tabler:square", label: "Square Eyes", symbol: "◻" };
    }
  })();

  // Color / Gradient indicator
  const colorInfo = (() => {
    if (design.gradient) {
      return {
        icon: "tabler:gradienter",
        label: `Gradient (${design.gradient.type})`,
        symbol: "▨",
      };
    }
    return {
      icon: "tabler:palette",
      label: `Solid ${design.fgColor}`,
      symbol: "◼",
      color: design.fgColor,
    };
  })();

  // Logo indicator
  const logoInfo = (() => {
    if (design.logo?.url || design.logo?.assetId) {
      return { icon: "tabler:photo", label: "Logo Embedded", symbol: "◈", active: true };
    }
    return { icon: "tabler:photo-off", label: "No Logo", symbol: "─", active: false };
  })();

  // Frame indicator
  const frameInfo = (() => {
    if (design.frame && design.frame.style !== "none") {
      return {
        icon: "tabler:border-outer",
        label: `Frame: ${design.frame.style.replace("_", " ")}`,
        symbol: "▭",
        active: true,
      };
    }
    return { icon: "tabler:border-none", label: "Frameless", symbol: "┄", active: false };
  })();

  const glyphs = [
    { key: "module", ...moduleInfo },
    { key: "eye", ...eyeInfo },
    { key: "color", ...colorInfo },
    { key: "logo", ...logoInfo },
    { key: "frame", ...frameInfo },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <div className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}>
        {glyphs.map((g) => (
          <Tooltip key={g.key}>
            <TooltipTrigger asChild>
              <div
                className={`flex items-center justify-center h-6 w-6 rounded border transition-colors ${
                  "active" in g && g.active === false
                    ? "bg-muted/20 border-border/40 text-muted-foreground/50"
                    : "bg-muted/60 border-border/80 text-foreground hover:border-primary/60 hover:text-primary"
                }`}
              >
                <Icon icon={g.icon} className="h-3.5 w-3.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <span className="font-sans font-medium">{g.label}</span>
            </TooltipContent>
          </Tooltip>
        ))}

        {showLabels && (
          <span className="ml-2 text-[11px] font-sans text-muted-foreground">
            {design.moduleStyle} · {design.eyeOuterStyle} · {design.gradient ? "grad" : "solid"}
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}
