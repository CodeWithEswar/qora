"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Search, Route, ArrowRight, Plus } from "lucide-react";
import { RoutingAssetItem } from "../types";

interface SelectQrBrainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: RoutingAssetItem[];
  orgSlug: string;
  mode: "configure" | "test";
  onSelectForSimulator?: (asset: RoutingAssetItem) => void;
}

export function SelectQrBrainDialog({
  open,
  onOpenChange,
  assets,
  orgSlug,
  mode,
  onSelectForSimulator,
}: SelectQrBrainDialogProps) {
  const [search, setSearch] = React.useState("");
  const router = useRouter();

  const filteredAssets = React.useMemo(() => {
    if (!search.trim()) return assets;
    const q = search.toLowerCase();
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.defaultUrl.toLowerCase().includes(q)
    );
  }, [assets, search]);

  const handleSelect = (asset: RoutingAssetItem) => {
    onOpenChange(false);
    if (mode === "test" && onSelectForSimulator) {
      onSelectForSimulator(asset);
    } else {
      router.push(`/${orgSlug}/qr/${asset.id}/brain`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#18181b] border-white/10 text-[#F7F4EC] max-w-md p-6 space-y-4">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-lg font-bold text-[#F7F4EC] font-serif">
            {mode === "test" ? "Select QR for Simulation" : "Select QR for QR Brain"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#85827B]">
            {mode === "test"
              ? "Choose which Dynamic QR's published routing policy to test in the simulator."
              : "Choose a Dynamic QR to open its visual routing decision canvas."}
          </DialogDescription>
        </DialogHeader>

        {assets.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-[#85827B]">
              No Dynamic QR codes found in this organization.
            </p>
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
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#85827B]" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Dynamic QRs..."
                className="pl-9 h-9 text-xs bg-[#141414] border-white/10 text-[#F7F4EC] placeholder:text-[#85827B]"
              />
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-white/5 pr-1">
              {filteredAssets.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#85827B]">
                  No QR codes match &quot;{search}&quot;.
                </div>
              ) : (
                filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => handleSelect(asset)}
                    className="w-full text-left p-3 hover:bg-white/5 rounded-lg flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-[#FA520F]/10 border border-[#FA520F]/20 flex items-center justify-center text-[#FA520F] shrink-0">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[#F7F4EC] block truncate group-hover:text-white">
                          {asset.name}
                        </span>
                        <span className="text-[11px] font-mono text-[#85827B] truncate block">
                          /{asset.slug}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono border-white/10 text-[#85827B]"
                      >
                        {asset.ruleCount > 0 ? `${asset.ruleCount} Rules` : "Default"}
                      </Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-[#85827B] group-hover:text-[#FA520F] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
