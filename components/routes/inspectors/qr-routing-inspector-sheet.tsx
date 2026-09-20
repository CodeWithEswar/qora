"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Check, Route, QrCode, Play } from "lucide-react";
import { toast } from "sonner";
import { RoutingAssetItem } from "../types";

interface QrRoutingInspectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: RoutingAssetItem | null;
  orgSlug: string;
  onSelectForSimulator: (asset: RoutingAssetItem) => void;
}

export function QrRoutingInspectorSheet({
  open,
  onOpenChange,
  asset,
  orgSlug,
  onSelectForSimulator,
}: QrRoutingInspectorSheetProps) {
  const [copiedUrl, setCopiedUrl] = React.useState(false);

  if (!asset) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(asset.defaultUrl);
    setCopiedUrl(true);
    toast.success("Destination URL copied");
    setTimeout(() => setCopiedUrl(false), 1500);
  };

  const isConditional = asset.ruleCount > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[#18181b] border-white/10 text-[#F7F4EC] w-full sm:max-w-md p-6 space-y-6 overflow-y-auto">
        <SheetHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-white/10 text-[#85827B]"
            >
              REV {asset.publishedRevision}
            </Badge>
            <span className="text-[10px] font-mono text-emerald-400">
              ● {asset.status}
            </span>
          </div>
          <SheetTitle className="text-lg font-bold text-[#F7F4EC] font-serif">
            {asset.name}
          </SheetTitle>
          <SheetDescription className="text-xs text-[#85827B]">
            Routing configuration and published edge resolver profile.
          </SheetDescription>
        </SheetHeader>

        {/* Identity block */}
        <div className="p-3 rounded-lg bg-[#141414] border border-white/5 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-[#85827B]">
            <span>Slug Path</span>
            <span className="text-[#F7F4EC]">/{asset.slug}</span>
          </div>
          <div className="flex items-center justify-between text-[#85827B]">
            <span>Routing Architecture</span>
            <span className="text-[#FA520F]">
              {isConditional ? `${asset.ruleCount} Active Rules` : "Direct Default"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#85827B]">
            <span>Asset UUID</span>
            <span className="text-[10px] text-[#85827B] truncate max-w-[150px]">
              {asset.id}
            </span>
          </div>
        </div>

        {/* Default Destination */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#85827B]">
            Default Destination URL
          </span>
          <div className="p-3 rounded-lg bg-[#141414] border border-white/5 space-y-2">
            <div className="text-xs font-mono text-[#F7F4EC] break-all">
              {asset.defaultUrl}
            </div>
            <div className="flex items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs text-[#85827B] hover:text-[#F7F4EC] gap-1"
              >
                {copiedUrl ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>Copy</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Configured Rules List */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#85827B]">
            Configured Rules ({asset.ruleCount})
          </span>
          {asset.rules && asset.rules.length > 0 ? (
            <div className="space-y-2">
              {asset.rules.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-lg bg-[#141414] border border-white/5 space-y-1.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#FA520F] font-bold">
                      #{r.priority} {r.name}
                    </span>
                    <span className="text-[10px] text-[#85827B]">
                      {r.conditions?.length || 0} conditions ({r.matchType})
                    </span>
                  </div>
                  <div className="text-[11px] text-[#B8B5AD] truncate">
                    Target: {r.action?.destinationUrl}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#141414] border border-white/5 text-xs text-[#85827B]">
              No conditional rules configured. Scans route directly to default destination.
            </div>
          )}
        </div>

        <SheetFooter className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onSelectForSimulator(asset);
            }}
            className="flex-1 text-xs border-white/10 text-[#F7F4EC] gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-current text-[#FA520F]" />
            <span>Test in Simulator</span>
          </Button>

          <Button
            asChild
            className="flex-1 bg-[#FA520F] hover:bg-[#d9440a] text-white text-xs gap-1.5"
          >
            <Link href={`/${orgSlug}/qr/${asset.id}/brain`}>
              <span>Open in QR Brain</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
