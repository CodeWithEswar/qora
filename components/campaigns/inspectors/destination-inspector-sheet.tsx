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
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { DestinationTopologyNode } from "../campaign-destination-map";
import { CampaignQrAssetV1 } from "@nxtqr/contracts";

export interface DestinationInspectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: DestinationTopologyNode | null;
  qrAssets: CampaignQrAssetV1[];
  orgSlug: string;
}

export function DestinationInspectorSheet({
  open,
  onOpenChange,
  destination,
  qrAssets,
  orgSlug,
}: DestinationInspectorSheetProps) {
  if (!destination) return null;

  // Find all QRs resolving to this destination domain
  const resolvingQrs = qrAssets.filter((qr) => {
    if (!qr.destinationUrl) return false;
    try {
      const url = new URL(
        qr.destinationUrl.startsWith("http")
          ? qr.destinationUrl
          : `https://${qr.destinationUrl}`
      );
      return (
        url.hostname.toLowerCase() === destination.domain.toLowerCase() ||
        destination.domain.toLowerCase().includes(url.hostname.toLowerCase())
      );
    } catch {
      return qr.destinationUrl.includes(destination.domain);
    }
  });

  const handleCopy = () => {
    const target = destination.domain.startsWith("http")
      ? destination.domain
      : `https://${destination.domain}`;
    navigator.clipboard.writeText(target);
    toast.success("Destination copied to clipboard");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col justify-between overflow-y-auto">
        <div className="p-6 space-y-6">
          <SheetHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                Destination Node
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                Verified Endpoint
              </span>
            </div>
            <SheetTitle className="text-xl font-bold text-foreground tracking-tight break-all">
              {destination.domain}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Target endpoint resolving traffic for campaign QR assets.
            </SheetDescription>
          </SheetHeader>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-xl border border-border/70 bg-surface/50">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Resolving QRs
              </div>
              <div className="text-lg font-bold text-foreground mt-0.5">
                {destination.qrCount} {destination.qrCount === 1 ? "asset" : "assets"}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Targeting this host
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-surface/50">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Scan Traffic
              </div>
              <div className="text-lg font-bold text-foreground mt-0.5">
                {destination.count.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Total received
              </div>
            </div>
          </div>

          {/* Resolving QR Codes List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <NxtqrIcon icon="solar:qr-code-bold" size={13} className="text-primary" />
                <span>Connected QR Codes ({resolvingQrs.length})</span>
              </span>
            </div>

            {resolvingQrs.length === 0 ? (
              <div className="p-3 rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground text-center">
                No direct QR codes found matching this domain.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {resolvingQrs.map((qr) => (
                  <Link
                    key={qr.id}
                    href={`/${orgSlug}/qr/${qr.id}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated/40 border border-border/50 hover:border-primary/40 hover:bg-muted/40 transition-colors text-xs group"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
                        {qr.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground block truncate">
                        /{qr.slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground shrink-0">
                      <span>{qr.totalScans} scans</span>
                      <NxtqrIcon
                        icon="solar:arrow-right-up-bold"
                        size={11}
                        className="text-primary opacity-60 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border/80 bg-surface/90 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1 text-xs h-9 gap-1.5 font-semibold bg-surface border-border"
          >
            <NxtqrIcon icon="solar:copy-bold" size={13} />
            <span>Copy Host</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="flex-1 text-xs h-9 gap-1.5 font-semibold bg-primary hover:bg-[#CC3A05] text-white"
          >
            <a
              href={
                destination.domain.startsWith("http")
                  ? destination.domain
                  : `https://${destination.domain}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <NxtqrIcon icon="solar:link-square-bold" size={13} />
              <span>Visit Host</span>
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
