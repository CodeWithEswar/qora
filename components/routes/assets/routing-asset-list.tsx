"use client";

import * as React from "react";
import Link from "next/link";
import {
  QrCode,
  Route,
  ArrowRight,
  Copy,
  Check,
  Play,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { RoutingAssetItem } from "../types";

interface RoutingAssetListProps {
  assets: RoutingAssetItem[];
  orgSlug: string;
  onSelectForSimulator: (asset: RoutingAssetItem) => void;
  onInspectProfile: (asset: RoutingAssetItem) => void;
}

export function RoutingAssetList({
  assets,
  orgSlug,
  onSelectForSimulator,
  onInspectProfile,
}: RoutingAssetListProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyUrl = (id: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Destination URL copied");
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#141414] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#111111] border-b border-white/[0.08]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B] w-[220px]">
                QR Asset
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                Slug Path
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                Routing Mode
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                Active Rules
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B] min-w-[200px]">
                Primary Destination
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B]">
                Revision
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[#85827B] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/[0.06]">
            {assets.map((asset) => {
              const isConditional = asset.ruleCount > 0;
              const isPaused = asset.status === "PAUSED";

              return (
                <TableRow
                  key={asset.id}
                  className="hover:bg-[#18181c] transition-colors border-none"
                >
                  {/* QR Asset Name */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-[#FA520F]/10 border border-[#FA520F]/20 flex items-center justify-center text-[#FA520F] shrink-0">
                        <QrCode className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[#F7F4EC] truncate block max-w-[170px]">
                          {asset.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Slug */}
                  <TableCell className="py-3.5 font-mono text-xs text-[#B8B5AD]">
                    /{asset.slug}
                  </TableCell>

                  {/* Routing Mode */}
                  <TableCell className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded border ${
                        isConditional
                          ? "bg-[#FA520F]/10 border-[#FA520F]/30 text-[#FA520F]"
                          : "bg-white/5 border-white/10 text-[#85827B]"
                      }`}
                    >
                      <Route className="w-3 h-3" />
                      {isConditional ? "Conditional" : "Default"}
                    </span>
                  </TableCell>

                  {/* Rules count */}
                  <TableCell className="py-3.5 font-mono text-xs text-[#F7F4EC]">
                    {asset.ruleCount} {asset.ruleCount === 1 ? "rule" : "rules"}
                  </TableCell>

                  {/* Destination */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-1.5 max-w-[260px]">
                      <span className="text-xs font-mono text-[#B8B5AD] truncate select-all">
                        {asset.defaultUrl}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyUrl(asset.id, asset.defaultUrl, e)}
                        className="text-[#85827B] hover:text-[#F7F4EC] p-0.5 shrink-0"
                        title="Copy URL"
                      >
                        {copiedId === asset.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                        isPaused ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPaused ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                      />
                      {isPaused ? "PAUSED" : "ACTIVE"}
                    </span>
                  </TableCell>

                  {/* Revision */}
                  <TableCell className="py-3.5 font-mono text-xs text-[#85827B]">
                    Rev {asset.publishedRevision}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectForSimulator(asset)}
                        className="h-7 text-xs text-[#85827B] hover:text-[#FA520F] hover:bg-white/5 gap-1"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span className="hidden sm:inline">Simulate</span>
                      </Button>

                      <Button
                        asChild
                        size="sm"
                        className="h-7 text-xs bg-[#FA520F] hover:bg-[#d9440a] text-white gap-1"
                      >
                        <Link href={`/${orgSlug}/qr/${asset.id}/brain`}>
                          <span>QR Brain</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[#85827B] hover:text-[#F7F4EC] hover:bg-white/5"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#18181b] border-white/10 text-[#F7F4EC]">
                          <DropdownMenuItem
                            onClick={() => onInspectProfile(asset)}
                            className="gap-2 text-xs focus:bg-white/5 cursor-pointer"
                          >
                            <Route className="h-3.5 w-3.5 text-[#B8B5AD]" />
                            <span>Inspect Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleCopyUrl(asset.id, asset.defaultUrl, e as any)}
                            className="gap-2 text-xs focus:bg-white/5 cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5 text-[#B8B5AD]" />
                            <span>Copy Destination</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="gap-2 text-xs focus:bg-white/5 cursor-pointer">
                            <Link href={`/${orgSlug}/qr/${asset.id}/brain`}>
                              <ExternalLink className="h-3.5 w-3.5 text-[#B8B5AD]" />
                              <span>Edit in QR Brain</span>
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
