"use client";

import * as React from "react";
import { Download, Copy, Check, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { renderQrSvg, QrDesignV1, CANONICAL_QR_DESIGN_DEFAULTS } from "@nxtqr/qr-core";
import { ResolutionRail } from "./resolution-rail";
import { CurrentDestinationCard } from "./current-destination-card";
import { toast } from "sonner";

interface DynamicQrHeroCanvasProps {
  slug: string;
  host: string;
  publishedRevision: number;
  publishedDestination: string;
  draftDestination?: string;
  hasUnpublishedChanges: boolean;
  routingRuleCount?: number;
  status: string;
  design?: QrDesignV1;
  updatedAt: string;
  ownerName?: string;
  onEditDestination: () => void;
}

export function DynamicQrHeroCanvas({
  slug,
  host,
  publishedRevision,
  publishedDestination,
  draftDestination,
  hasUnpublishedChanges,
  routingRuleCount = 0,
  status,
  design = CANONICAL_QR_DESIGN_DEFAULTS,
  updatedAt,
  ownerName,
  onEditDestination,
}: DynamicQrHeroCanvasProps) {
  const [copied, setCopied] = React.useState(false);

  const fullShortUrl = `https://${host}/${slug}`;

  // Generate deterministic pure vector QR SVG for the STABLE SHORT RESOLVER URL
  const svgMarkup = React.useMemo(() => {
    try {
      return renderQrSvg({
        content: fullShortUrl,
        design: design || CANONICAL_QR_DESIGN_DEFAULTS,
        moduleSize: 10,
      });
    } catch (err) {
      console.error("[DynamicQrHeroCanvas] Failed to render QR SVG:", err);
      return "";
    }
  }, [fullShortUrl, design]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      toast.success("QR URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleDownloadSvg = () => {
    try {
      const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nxtqr-${slug}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("SVG downloaded");
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* 1. Left Column: Real QR Preview (Stable Physical Identity) */}
      <div className="lg:col-span-4 flex flex-col items-center justify-between p-6 bg-card/80 dark:bg-card/50 rounded-2xl border border-border shadow-xs backdrop-blur-xs">
        <div className="w-full flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-muted-foreground">
              QR Identity
            </span>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono uppercase">
            Stable Identity
          </Badge>
        </div>

        {/* Vector SVG Container */}
        <div className="my-6 p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-border shadow-inner flex items-center justify-center aspect-square max-w-[240px] w-full">
          {svgMarkup ? (
            <div
              className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          ) : (
            <div className="text-xs text-muted-foreground font-mono">Rendering QR...</div>
          )}
        </div>

        {/* Identity Details */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-muted/50 border border-border/50">
            <span className="text-muted-foreground font-mono">/{slug}</span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400 font-medium">
              Permanent
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-medium gap-1.5"
              onClick={handleCopyUrl}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy URL"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-medium gap-1.5"
              onClick={handleDownloadSvg}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Center Column: Signature Resolution Rail */}
      <div className="lg:col-span-4 flex">
        <ResolutionRail
          slug={slug}
          host={host}
          publishedRevision={publishedRevision}
          publishedDestination={publishedDestination}
          draftDestination={draftDestination}
          hasUnpublishedChanges={hasUnpublishedChanges}
          routingRuleCount={routingRuleCount}
          status={status}
        />
      </div>

      {/* 3. Right Column: Current Destination Surface */}
      <div className="lg:col-span-4 flex">
        <CurrentDestinationCard
          publishedDestination={publishedDestination}
          publishedRevision={publishedRevision}
          updatedAt={updatedAt}
          ownerName={ownerName}
          onEditClick={onEditDestination}
        />
      </div>
    </div>
  );
}
