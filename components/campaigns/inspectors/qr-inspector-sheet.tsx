"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { QrThumbnail } from "@/components/qr-operations/qr-thumbnail";
import { CampaignQrAssetV1 } from "@nxtqr/contracts";

export interface QrInspectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qr: CampaignQrAssetV1 | null;
  orgSlug: string;
  campaignName: string;
  onRemove?: () => void;
}

export function QrInspectorSheet({
  open,
  onOpenChange,
  qr,
  orgSlug,
  campaignName,
  onRemove,
}: QrInspectorSheetProps) {
  if (!qr) return null;

  const handleCopyLink = () => {
    if (!qr.destinationUrl) return;
    navigator.clipboard.writeText(qr.destinationUrl);
    toast.success("Destination URL copied");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col justify-between overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <SheetHeader className="space-y-2 text-left">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                  {qr.qrType || "URL"}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono"
                >
                  Active
                </Badge>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[140px]">
                In {campaignName}
              </span>
            </div>

            <SheetTitle className="text-xl font-bold text-foreground tracking-tight truncate">
              {qr.name}
            </SheetTitle>
            <SheetDescription className="text-xs font-mono text-muted-foreground truncate">
              Slug: /{qr.slug}
            </SheetDescription>
          </SheetHeader>

          {/* Visual QR Thumbnail Box */}
          <div className="flex items-center justify-center p-5 rounded-xl border border-border/80 bg-surface-elevated/40">
            <div className="w-28 h-28 shrink-0 bg-white p-2 rounded-xl shadow-xs border border-border/60">
              <QrThumbnail
                name={qr.name}
                slug={qr.slug}
                qrType={qr.qrType}
                design={qr.design}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Destination Attribution */}
          <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-surface/50">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <NxtqrIcon icon="solar:link-square-bold" size={13} className="text-primary" />
                <span>Destination Endpoint</span>
              </span>
              {qr.destinationUrl && (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <NxtqrIcon icon="solar:copy-bold" size={11} />
                  <span>Copy</span>
                </button>
              )}
            </div>

            {qr.destinationUrl ? (
              <div className="p-2.5 rounded-lg bg-muted/40 font-mono text-xs text-foreground break-all flex items-center justify-between gap-2">
                <span className="truncate">{qr.destinationUrl}</span>
                <a
                  href={qr.destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 shrink-0"
                  aria-label="Open destination in new tab"
                >
                  <NxtqrIcon icon="solar:link-square-bold" size={13} />
                </a>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">
                Direct resolver route (dynamic configuration)
              </div>
            )}
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-xl border border-border/70 bg-surface/50">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Total Scans
              </div>
              <div className="text-lg font-bold text-foreground mt-0.5">
                {qr.totalScans.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {qr.totalScans === 0 ? "No scan signal yet" : "Verified hits"}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-surface/50">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Routing Engine
              </div>
              <div className="text-xs font-bold text-foreground mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">Direct Default</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Ready for rules
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-6 border-t border-border/80 bg-surface/90 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              asChild
              size="sm"
              className="text-xs h-9 font-semibold bg-primary hover:bg-[#CC3A05] text-white gap-1.5"
            >
              <Link href={`/${orgSlug}/qr/${qr.id}`}>
                <NxtqrIcon icon="solar:eye-bold" size={13} />
                <span>Open QR Details</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs h-9 font-semibold bg-surface border-border hover:bg-muted gap-1.5"
            >
              <Link href={`/${orgSlug}/qr/${qr.id}/brain`}>
                <NxtqrIcon icon="solar:route-bold" size={13} className="text-primary" />
                <span>QR Brain</span>
              </Link>
            </Button>
          </div>

          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="w-full text-xs h-8 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 gap-1.5"
            >
              <NxtqrIcon icon="solar:link-broken-minimalistic-bold" size={13} />
              <span>Remove from Campaign</span>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
