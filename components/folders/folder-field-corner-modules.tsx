import * as React from "react";
import { cn } from "@/lib/utils";

interface CornerModulesProps {
  accentDotColor?: string;
  className?: string;
}

/**
 * Deterministic QR module geometry for the signature Folder Field containment surface.
 * Creates an architectural, technical containment boundary built from QR finder/timing glyphs.
 */
export function FolderFieldCornerModules({
  accentDotColor = "#FA520F",
  className,
}: CornerModulesProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* Top Left Corner Anchor: 3x3 Mini Position Pattern */}
      <div className="absolute top-2.5 left-2.5 flex flex-col gap-0.5 opacity-25 dark:opacity-20 transition-opacity duration-200 group-hover:opacity-40">
        <div className="flex gap-0.5">
          <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
          <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
          <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
        </div>
        <div className="flex gap-0.5">
          <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
          <span className="h-1 w-1 rounded-[0.5px]" style={{ backgroundColor: accentDotColor }} />
          <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
        </div>
        <div className="flex gap-0.5">
          <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
          <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
          <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
        </div>
      </div>

      {/* Top Right Alignment Tick */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 opacity-20 dark:opacity-15 transition-opacity duration-200 group-hover:opacity-35">
        <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
        <span className="h-1 w-2 rounded-[0.5px] bg-foreground/40" />
        <span className="h-1 w-1 rounded-[0.5px]" style={{ backgroundColor: accentDotColor }} />
      </div>

      {/* Bottom Left Corner Timing Trace */}
      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-0.5 opacity-20 dark:opacity-15 transition-opacity duration-200 group-hover:opacity-35">
        <span className="h-1 w-1 rounded-[0.5px]" style={{ backgroundColor: accentDotColor }} />
        <span className="h-1 w-1.5 rounded-[0.5px] bg-foreground/40" />
        <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
      </div>

      {/* Bottom Right Anchor: Mini Finder Pattern */}
      <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-0.5 opacity-25 dark:opacity-20 transition-opacity duration-200 group-hover:opacity-40">
        <div className="flex gap-0.5">
          <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
          <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
        </div>
        <div className="flex gap-0.5">
          <span className="h-1 w-1 rounded-[0.5px] bg-foreground" />
          <span className="h-1 w-1 rounded-[0.5px]" style={{ backgroundColor: accentDotColor }} />
        </div>
      </div>
    </div>
  );
}
