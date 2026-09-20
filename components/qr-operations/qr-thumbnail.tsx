"use client";

import * as React from "react";
import { renderQrSvg, CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QrTypeIcon } from "@/components/icons/qr-type-icon";
import { cn } from "@/lib/utils";

export interface QrThumbnailProps {
  slug: string;
  name: string;
  qrType?: string;
  destinationUrl?: string;
  design?: any;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
}

export function QrThumbnail({
  slug,
  name,
  qrType = "url",
  destinationUrl,
  design,
  size = "md",
  interactive = true,
  className,
}: QrThumbnailProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Generate deterministic pure-SVG vector QR markup from authoritative slug/destination
  const svgMarkup = React.useMemo(() => {
    try {
      const content = slug
        ? `https://nxtqr.vercel.app/s/${slug}`
        : destinationUrl || "https://nxtqr.vercel.app";

      const qrDesign = {
        ...CANONICAL_QR_DESIGN_DEFAULTS,
        ...(design || {}),
        errorCorrection: (design?.errorCorrection || "M") as any,
        quietZone: design?.quietZone !== undefined ? design.quietZone : 2,
      };

      return renderQrSvg({
        content,
        design: qrDesign,
        moduleSize: 6,
      });
    } catch {
      return null;
    }
  }, [slug, destinationUrl, design]);

  // Dimensions
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
  };

  const thumbnailBox = (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center rounded-lg border border-border/70 bg-white dark:bg-[#181818] p-1 shadow-xs transition-all duration-150 overflow-hidden",
        interactive && "group-hover:border-primary/50 group-hover:shadow-sm cursor-pointer",
        sizeMap[size],
        className
      )}
    >
      {svgMarkup ? (
        <div
          className="w-full h-full flex items-center justify-center pointer-events-none [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground/70">
          <QrTypeIcon type={qrType} size="sm" />
        </div>
      )}
    </div>
  );

  if (!interactive) {
    return thumbnailBox;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg text-left"
          title={`Preview QR code for ${name}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
        >
          {thumbnailBox}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        className="w-72 p-4 bg-white dark:bg-[#1a1a1a] border border-border/80 shadow-xl rounded-xl z-50 animate-in fade-in-50 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">
              QR Identity Preview
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              /{slug}
            </span>
          </div>

          <div className="flex items-center justify-center p-3 rounded-lg bg-neutral-50 dark:bg-[#111111] border border-border/60">
            {svgMarkup ? (
              <div
                className="w-44 h-44 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full rounded-xl overflow-hidden drop-shadow-xs"
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
              />
            ) : (
              <div className="w-44 h-44 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <QrTypeIcon type={qrType} size="lg" />
                <span className="text-xs">QR Preview unavailable</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground truncate">{name}</div>
            {destinationUrl && (
              <p className="text-xs text-muted-foreground truncate font-mono">
                {destinationUrl}
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
