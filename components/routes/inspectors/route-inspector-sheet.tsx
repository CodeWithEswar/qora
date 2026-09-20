"use client";

import * as React from "react";
import Link from "next/link";
import { RoutingRule } from "@nxtqr/contracts";
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
import { ExternalLink, Copy, Check, Route, QrCode } from "lucide-react";
import { toast } from "sonner";
import { RoutingAssetItem } from "../types";

interface RouteInspectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: RoutingRule | null;
  qrAsset: RoutingAssetItem | null;
  orgSlug: string;
}

export function RouteInspectorSheet({
  open,
  onOpenChange,
  rule,
  qrAsset,
  orgSlug,
}: RouteInspectorSheetProps) {
  const [copiedUrl, setCopiedUrl] = React.useState(false);

  if (!rule || !qrAsset) return null;

  const handleCopy = () => {
    if (rule.action?.destinationUrl) {
      navigator.clipboard.writeText(rule.action.destinationUrl);
      setCopiedUrl(true);
      toast.success("Destination URL copied");
      setTimeout(() => setCopiedUrl(false), 1500);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[#18181b] border-white/10 text-[#F7F4EC] w-full sm:max-w-md p-6 space-y-6 overflow-y-auto">
        <SheetHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FA520F]/20 text-[#FA520F] font-bold">
              PRIORITY #{rule.priority}
            </span>
            <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-[#85827B]">
              {rule.matchType} CONDITIONS
            </Badge>
          </div>
          <SheetTitle className="text-lg font-bold text-[#F7F4EC] font-serif">
            {rule.name}
          </SheetTitle>
          <SheetDescription className="text-xs text-[#85827B]">
            Routing branch configured on Dynamic QR &apos;{qrAsset.name}&apos;.
          </SheetDescription>
        </SheetHeader>

        {/* QR Asset Profile snippet */}
        <div className="p-3 rounded-lg bg-[#141414] border border-white/5 space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[#85827B]">
            <span className="flex items-center gap-1.5">
              <QrCode className="h-3.5 w-3.5 text-[#FA520F]" />
              Parent Asset
            </span>
            <span className="text-[#F7F4EC] font-semibold">{qrAsset.name}</span>
          </div>
          <div className="flex items-center justify-between text-[#85827B]">
            <span>Slug Path</span>
            <span className="text-[#B8B5AD]">/{qrAsset.slug}</span>
          </div>
          <div className="flex items-center justify-between text-[#85827B]">
            <span>Published Revision</span>
            <span className="text-[#B8B5AD]">Rev {qrAsset.publishedRevision}</span>
          </div>
        </div>

        {/* Target Destination */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#85827B]">
            Target Destination
          </span>
          <div className="p-3 rounded-lg bg-[#141414] border border-white/5 space-y-2">
            <div className="text-xs font-mono text-[#F7F4EC] break-all">
              {rule.action?.destinationUrl || qrAsset.defaultUrl}
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs text-[#85827B] hover:text-[#F7F4EC] gap-1"
              >
                {copiedUrl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>Copy</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Conditions List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#85827B]">
              Evaluation Conditions
            </span>
            <span className="text-[10px] font-mono text-[#85827B]">
              Match: {rule.matchType}
            </span>
          </div>

          <div className="space-y-2">
            {(rule.conditions || []).map((cond, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#141414] border border-white/5 space-y-1 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#FA520F] uppercase font-bold text-[10px]">
                    Condition {idx + 1}: {cond.type}
                  </span>
                  <span className="text-[10px] text-[#85827B]">
                    Operator: {cond.operator}
                  </span>
                </div>
                <div className="text-[#F7F4EC] pt-1">
                  Expected Value: <span className="text-emerald-400">{String(cond.value)}</span>
                </div>
                {cond.paramName && (
                  <div className="text-[#85827B] text-[10px]">
                    Query Key: {cond.paramName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <SheetFooter className="pt-4 border-t border-white/10 flex flex-col gap-2">
          <Button
            asChild
            className="w-full bg-[#FA520F] hover:bg-[#d9440a] text-white text-xs gap-1.5"
          >
            <Link href={`/${orgSlug}/qr/${qrAsset.id}/brain`}>
              <span>Open in QR Brain</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
