"use client";

import * as React from "react";
import Link from "next/link";
import {
  QrCode,
  Route,
  ArrowRight,
  ExternalLink,
  Copy,
  MoreVertical,
  Play,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { RoutingAssetItem } from "../types";

interface RoutingAssetCardProps {
  asset: RoutingAssetItem;
  orgSlug: string;
  onSelectForSimulator: (asset: RoutingAssetItem) => void;
  onInspectProfile: (asset: RoutingAssetItem) => void;
}

export function RoutingAssetCard({
  asset,
  orgSlug,
  onSelectForSimulator,
  onInspectProfile,
}: RoutingAssetCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.defaultUrl);
    setCopied(true);
    toast.success("Destination URL copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const isConditional = asset.ruleCount > 0;
  const isPaused = asset.status === "PAUSED";

  return (
    <div className="group relative rounded-xl border border-white/[0.08] hover:border-[#FA520F]/40 bg-[#161619] hover:bg-[#19191d] transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm">
      {/* Top bar: QR Icon + Title + Status & Rule count */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#FA520F]/10 border border-[#FA520F]/20 flex items-center justify-center text-[#FA520F] shrink-0 mt-0.5">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#F7F4EC] truncate group-hover:text-white transition-colors">
                {asset.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-mono text-[#85827B] truncate">
                  /{asset.slug}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-[10px] font-mono text-[#85827B]">
                  Rev {asset.publishedRevision}
                </span>
              </div>
            </div>
          </div>

          {/* Badges & Overflow Menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant="outline"
              className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                isConditional
                  ? "bg-[#FA520F]/10 border-[#FA520F]/30 text-[#FA520F]"
                  : "bg-white/5 border-white/10 text-[#85827B]"
              }`}
            >
              {isConditional ? `${asset.ruleCount} Rules` : "Default"}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[#85827B] hover:text-[#F7F4EC] hover:bg-white/5 rounded-md"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#18181b] border-white/10 text-[#F7F4EC]">
                <DropdownMenuItem
                  onClick={() => onSelectForSimulator(asset)}
                  className="gap-2 text-xs focus:bg-white/5 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 text-[#FA520F]" />
                  <span>Test in Simulator</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onInspectProfile(asset)}
                  className="gap-2 text-xs focus:bg-white/5 cursor-pointer"
                >
                  <Route className="h-3.5 w-3.5 text-[#B8B5AD]" />
                  <span>Inspect Routing Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleCopyUrl}
                  className="gap-2 text-xs focus:bg-white/5 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-[#B8B5AD]" />
                  <span>Copy Destination URL</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="gap-2 text-xs focus:bg-white/5 cursor-pointer">
                  <Link href={`/${orgSlug}/qr/${asset.id}/brain`}>
                    <ExternalLink className="h-3.5 w-3.5 text-[#B8B5AD]" />
                    <span>Open QR Brain</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Signal Geometry Line: SOURCE ── RULE ── DESTINATION */}
        <div className="py-1 px-2.5 rounded-md bg-[#121214] border border-white/[0.04]">
          <div className="flex items-center justify-between text-[9px] font-mono text-[#85827B]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              SCAN
            </span>
            <div className="flex-1 mx-2 flex items-center justify-center">
              <div className="h-[1px] w-full bg-gradient-to-r from-emerald-500/30 via-[#FA520F]/50 to-primary/40 relative">
                {isConditional && (
                  <div className="absolute left-1/2 -translate-x-1/2 -top-1 px-1 py-0 rounded text-[8px] bg-[#1a1a1d] border border-[#FA520F]/40 text-[#FA520F]">
                    {asset.ruleCount}R
                  </div>
                )}
              </div>
            </div>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FA520F]" />
              TARGET
            </span>
          </div>
        </div>

        {/* Destination Summary */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#85827B]">
            <span>Primary Destination</span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono ${
                isPaused ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-amber-400" : "bg-emerald-400"}`} />
              {isPaused ? "PAUSED" : "ACTIVE"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 p-2 rounded bg-[#131315] border border-white/[0.06]">
            <span className="text-xs font-mono text-[#B8B5AD] truncate select-all">
              {asset.defaultUrl || "https://nxtqr.vercel.app"}
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="text-[#85827B] hover:text-[#F7F4EC] p-1 rounded transition-colors shrink-0"
              title="Copy URL"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSelectForSimulator(asset)}
          className="h-8 text-xs font-medium border-white/10 bg-[#121214] hover:bg-white/5 text-[#B8B5AD] hover:text-[#F7F4EC] gap-1.5"
        >
          <Play className="h-3 w-3 fill-current text-[#FA520F]" />
          <span>Simulate</span>
        </Button>

        <Button
          asChild
          size="sm"
          className="h-8 text-xs font-medium bg-[#FA520F] hover:bg-[#d9440a] text-white gap-1 shadow-xs"
        >
          <Link href={`/${orgSlug}/qr/${asset.id}/brain`}>
            <span>Open QR Brain</span>
            <ArrowRight className="h-3 w-3 ml-0.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
