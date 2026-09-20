"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { renderQrSvg, QrDesignV1, CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";
import { cn } from "@/lib/utils";

export interface QrIdentityPanelProps {
  slug: string;
  host: string;
  qrName: string;
  orgSlug: string;
  qrId: string;
  design?: QrDesignV1;
  className?: string;
}

export function QrIdentityPanel({
  slug,
  host,
  qrName,
  orgSlug,
  qrId,
  design = CANONICAL_QR_DESIGN_DEFAULTS,
  className,
}: QrIdentityPanelProps) {
  const [copied, setCopied] = React.useState(false);

  const fullShortUrl = `https://${host}/s/${slug}`;

  // Generate canonical pure vector QR SVG
  const svgMarkup = React.useMemo(() => {
    try {
      return renderQrSvg({
        content: fullShortUrl,
        design: design || CANONICAL_QR_DESIGN_DEFAULTS,
        moduleSize: 10,
      });
    } catch (err) {
      console.error("[QrIdentityPanel] Failed to render QR SVG:", err);
      return "";
    }
  }, [fullShortUrl, design]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      toast.success("Resolver URL copied", {
        description: fullShortUrl,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy URL");
    }
  };

  const handleDownloadSvg = () => {
    try {
      const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slug}-qr.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("QR SVG downloaded");
    } catch {
      toast.error("Couldn't download SVG");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs",
        className
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <Icon icon="hugeicons:qr-code" className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-muted-foreground">
              QR Identity
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-mono tracking-wide uppercase border-primary/20 bg-primary/5 text-primary"
          >
            Stable Identity
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          This is the permanent scan identity. The physical QR code never needs to be reprinted.
        </p>

        {/* QR Scan Canvas */}
        <div className="my-5 flex flex-col items-center">
          <div className="relative p-4 rounded-xl bg-[#FFFDF7] dark:bg-[#1E1E1E] border border-border/80 shadow-2xs group">
            {svgMarkup ? (
              <div
                className="w-48 h-48 sm:w-52 sm:h-52 select-none [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
                aria-label={`QR Code for ${qrName}`}
                role="img"
              />
            ) : (
              <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-xs text-muted-foreground">
                Rendering QR…
              </div>
            )}

            {/* Quick Hover Action Overlay */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="h-8 text-xs bg-surface gap-1.5 shadow-2xs"
              >
                <Icon
                  icon={copied ? "hugeicons:tick-02" : "hugeicons:copy-01"}
                  className="w-3.5 h-3.5"
                />
                <span>{copied ? "Copied" : "Copy URL"}</span>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-surface gap-1.5 shadow-2xs"
              >
                <Link href={`/${orgSlug}/qr/studio?id=${qrId}`}>
                  <Icon icon="hugeicons:paint-board" className="w-3.5 h-3.5 text-primary" />
                  <span>Studio</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Resolver Short URL Bar */}
          <div className="w-full mt-3 flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated/60 border border-border/70 font-mono text-xs">
            <span className="text-muted-foreground truncate mr-2">
              /s/<span className="font-semibold text-foreground">{slug}</span>
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Copy short resolver URL"
            >
              <Icon
                icon={copied ? "hugeicons:tick-02" : "hugeicons:copy-01"}
                className={cn("w-3.5 h-3.5", copied && "text-emerald-500")}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons & Explainer Footnote */}
      <div className="space-y-3 pt-3 border-t border-border/60">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            className="h-8 text-xs gap-1.5 bg-surface border-border hover:bg-muted"
          >
            <Icon
              icon={copied ? "hugeicons:tick-02" : "hugeicons:copy-01"}
              className="w-3.5 h-3.5 text-muted-foreground"
            />
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSvg}
            className="h-8 text-xs gap-1.5 bg-surface border-border hover:bg-muted"
          >
            <Icon icon="hugeicons:download-04" className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Download SVG</span>
          </Button>
        </div>

        {/* Stable Identity Explainer Surface */}
        <div className="p-2.5 rounded-lg bg-[#FFF8E0]/40 dark:bg-[#2A2312]/30 border border-[#FFB83E]/20 text-[11px] text-muted-foreground flex items-start gap-2">
          <Icon icon="hugeicons:infinity" className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span>
            The printed identity stays stable while published routing and destination targets change dynamically.
          </span>
        </div>
      </div>
    </div>
  );
}
