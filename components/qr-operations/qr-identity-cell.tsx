"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { QrThumbnail } from "./qr-thumbnail";
import { cn } from "@/lib/utils";

export interface QrIdentityCellProps {
  id: string;
  name: string;
  slug: string;
  qrType: string;
  mode: "dynamic" | "static";
  destinationUrl?: string;
  scanUrl?: string;
  design?: any;
  onInspect?: () => void;
  className?: string;
}

export function QrIdentityCell({
  id,
  name,
  slug,
  qrType,
  mode,
  destinationUrl,
  scanUrl,
  design,
  onInspect,
  className,
}: QrIdentityCellProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const urlToCopy = scanUrl || `https://nxtqr.vercel.app/s/${slug}`;
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      toast.success("QR URL copied", {
        description: urlToCopy,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const formattedType = React.useMemo(() => {
    if (mode === "dynamic") return "Dynamic QR";
    if (qrType === "pdf") return "PDF QR";
    if (qrType === "wifi") return "Wi-Fi QR";
    if (qrType === "vcard") return "vCard QR";
    if (qrType === "app") return "App Store QR";
    return "Static QR";
  }, [mode, qrType]);

  return (
    <div className={cn("flex items-center gap-3.5 min-w-[200px] max-w-[320px]", className)}>
      {/* Real SVG Vector QR Thumbnail */}
      <QrThumbnail
        slug={slug}
        name={name}
        qrType={qrType}
        destinationUrl={destinationUrl}
        design={design}
        size="md"
        interactive={true}
      />

      {/* Name, Type & Monospace Slug */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInspect?.();
            }}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate text-left focus:outline-none"
            title={`Inspect ${name}`}
          >
            {name || "Untitled QR"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground/80 font-medium">
            {formattedType}
          </span>
          <span className="text-border/80">&middot;</span>
          <div className="flex items-center gap-1 group/slug">
            <span className="font-mono text-[11px] text-muted-foreground truncate">
              /q/{slug}
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="opacity-0 group-hover/slug:opacity-100 focus:opacity-100 text-muted-foreground hover:text-foreground transition-opacity p-0.5 rounded"
              title="Copy public QR link"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
