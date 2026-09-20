"use client";

import * as React from "react";
import Link from "next/link";
import { Route, Plus, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoutingAssetItem } from "../types";
import { RoutingAssetCard } from "./routing-asset-card";

interface RoutingAssetGridProps {
  assets: RoutingAssetItem[];
  totalAssetsCount: number;
  orgSlug: string;
  onResetFilters: () => void;
  onSelectForSimulator: (asset: RoutingAssetItem) => void;
  onInspectProfile: (asset: RoutingAssetItem) => void;
}

export function RoutingAssetGrid({
  assets,
  totalAssetsCount,
  orgSlug,
  onResetFilters,
  onSelectForSimulator,
  onInspectProfile,
}: RoutingAssetGridProps) {
  // 1. Filtered empty state
  if (assets.length === 0 && totalAssetsCount > 0) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#85827B]">
          <FilterX className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-semibold text-[#F7F4EC]">
            No matching routing assets
          </h3>
          <p className="text-xs text-[#85827B]">
            No QR routing policies matched your current search and filter criteria.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          className="text-xs border-white/10 bg-[#191919] hover:bg-[#222222] text-[#F7F4EC]"
        >
          Clear filters
        </Button>
      </div>
    );
  }

  // 2. Absolute empty state (no QRs in workspace)
  if (assets.length === 0 && totalAssetsCount === 0) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#141414] p-12 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#FA520F]/10 border border-[#FA520F]/20 flex items-center justify-center mx-auto text-[#FA520F]">
          <Route className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-[#F7F4EC] font-serif">
            No Routing Assets Yet
          </h3>
          <p className="text-xs text-[#85827B] leading-relaxed">
            Create or publish a Dynamic QR code to begin building deterministic,
            context-aware edge routing policies.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            asChild
            size="sm"
            className="text-xs bg-[#FA520F] hover:bg-[#d9440a] text-white"
          >
            <Link href={`/${orgSlug}/qr`}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Create Dynamic QR</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs border-white/10 bg-[#18181b] text-[#B8B5AD] hover:text-[#F7F4EC]"
          >
            <Link href={`/${orgSlug}/qr`}>View QR Codes</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 3. Grid of cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset) => (
        <RoutingAssetCard
          key={asset.id}
          asset={asset}
          orgSlug={orgSlug}
          onSelectForSimulator={onSelectForSimulator}
          onInspectProfile={onInspectProfile}
        />
      ))}
    </div>
  );
}
