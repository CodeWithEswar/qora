"use client";

import * as React from "react";
import Link from "next/link";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { CampaignIdentity } from "./campaign-identity";
import { QrThumbnail } from "@/components/qr-operations/qr-thumbnail";
import { CampaignResponseV1, CampaignQrAssetV1 } from "@nxtqr/contracts";
import { DestinationTopologyNode } from "./campaign-destination-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CampaignMapProps {
  campaign: CampaignResponseV1;
  qrAssets: CampaignQrAssetV1[];
  destinations: DestinationTopologyNode[];
  routesCount: number;
  orgSlug: string;
  onSelectQr: (qr: CampaignQrAssetV1) => void;
  onSelectDestination: (dest: DestinationTopologyNode) => void;
  onSelectCampaign: () => void;
  onSelectRouting?: () => void;
  onAddQrs: () => void;
  className?: string;
}

/**
 * CampaignMap — Signature Adaptive Signal Topology Surface for NXTQR Campaigns.
 * Dynamically scales its layout based on QR asset count:
 * - 0 QRs: Clean monogram 'C' empty state with quick setup action.
 * - 1 QR: Ultra-compact horizontal pipeline (~220px) eliminating vertical waste.
 * - 2-5 QRs: Balanced converging signal network.
 * - 6+ QRs: Clustered topology with overview / detailed density toggle.
 */
export function CampaignMap({
  campaign,
  qrAssets,
  destinations,
  routesCount,
  orgSlug,
  onSelectQr,
  onSelectDestination,
  onSelectCampaign,
  onSelectRouting,
  onAddQrs,
  className,
}: CampaignMapProps) {
  const [density, setDensity] = React.useState<"overview" | "detailed">("overview");
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null);

  const totalQrs = qrAssets.length;

  // Render 0-QR True Empty State
  if (totalQrs === 0) {
    return (
      <div
        className={cn(
          "relative rounded-xl border border-dashed border-border/80 bg-surface/60 p-8 sm:p-10 shadow-2xs text-center flex flex-col items-center justify-center",
          className
        )}
      >
        {/* QR Module Monogram 'C' */}
        <div className="relative w-14 h-14 rounded-2xl bg-surface-elevated border border-primary/20 flex items-center justify-center mb-4 shadow-xs">
          <div className="font-mono text-2xl font-black text-primary select-none">
            C
          </div>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary/40" />
        </div>

        <h3 className="text-sm font-bold text-foreground">
          This campaign is ready for its first QR
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mt-1.5 leading-relaxed">
          Add an existing QR code or connect new dynamic links to visualize routing paths, track scan signals, and monitor destination endpoints.
        </p>

        <div className="flex items-center gap-2.5 mt-5">
          <Button
            size="sm"
            onClick={onAddQrs}
            className="text-xs h-8 px-4 gap-1.5 bg-primary hover:bg-[#CC3A05] text-white font-semibold shadow-xs"
          >
            <NxtqrIcon icon="solar:add-circle-bold" size={13} />
            <span>Add QR Codes</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3.5 bg-surface border-border text-foreground hover:bg-muted"
          >
            <Link href={`/${orgSlug}/studio`}>
              <span>Create New QR</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // 1-QR Horizontal Topology Pipeline (~220px tall)
  if (totalQrs === 1) {
    const singleQr = qrAssets[0];
    const singleDest = destinations[0] || {
      domain: singleQr.destinationUrl
        ? singleQr.destinationUrl.replace(/^https?:\/\//, "").split("/")[0]
        : "Direct Resolver",
      count: singleQr.totalScans,
      qrCount: 1,
    };

    return (
      <div
        className={cn(
          "relative rounded-xl border border-border/80 bg-surface/70 backdrop-blur-xs p-4 sm:p-5 shadow-2xs overflow-hidden",
          className
        )}
      >
        {/* Header Toolbar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <NxtqrIcon icon="solar:route-bold" size={12} />
            </div>
            <span className="text-xs font-semibold text-foreground tracking-tight">
              Campaign Map
            </span>
            <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.2 rounded-md bg-muted/60 border border-border/60">
              1 QR Pipeline
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{routesCount} {routesCount === 1 ? "Active Route" : "Active Routes"}</span>
            </span>
          </div>
        </div>

        {/* 1-QR Horizontal Pipeline Flow */}
        <div className="py-2 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-2">
          {/* 1. QR Asset Node */}
          <button
            type="button"
            onClick={() => onSelectQr(singleQr)}
            onMouseEnter={() => setHoveredNode("qr")}
            onMouseLeave={() => setHoveredNode(null)}
            className={cn(
              "w-full md:w-64 p-3 rounded-xl border border-border/80 bg-surface-elevated/80 shadow-xs text-left cursor-pointer transition-all duration-200",
              "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 group",
              hoveredNode === "qr" && "border-primary/60 ring-2 ring-primary/10"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 bg-white p-1 rounded-lg border border-border/60 shadow-2xs">
                <QrThumbnail
                  name={singleQr.name}
                  slug={singleQr.slug}
                  qrType={singleQr.qrType}
                  design={singleQr.design}
                  className="w-full h-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {singleQr.name}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-muted rounded text-muted-foreground shrink-0">
                    {singleQr.qrType || "URL"}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
                  /{singleQr.slug}
                </div>
                <div className="text-[10px] font-mono font-medium text-foreground mt-1">
                  {singleQr.totalScans} <span className="text-muted-foreground font-normal">scans</span>
                </div>
              </div>
            </div>
          </button>

          {/* Connector 1: QR -> Campaign */}
          <div className="hidden md:flex items-center flex-1 max-w-[80px] px-1">
            <div className="w-full h-px bg-gradient-to-r from-border via-primary/50 to-primary relative">
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/20" />
            </div>
          </div>
          <div className="md:hidden flex flex-col items-center h-4">
            <div className="w-px h-full bg-primary/60" />
          </div>

          {/* 2. Campaign Core Node */}
          <button
            type="button"
            onClick={onSelectCampaign}
            onMouseEnter={() => setHoveredNode("campaign")}
            onMouseLeave={() => setHoveredNode(null)}
            className={cn(
              "w-full md:w-60 p-3 rounded-xl border border-primary/30 bg-[#FFF8E0]/40 dark:bg-[#202020]/80 shadow-xs text-left cursor-pointer transition-all duration-200",
              "hover:border-primary hover:shadow-md hover:-translate-y-0.5 group",
              hoveredNode === "campaign" && "border-primary ring-2 ring-primary/20"
            )}
          >
            <div className="flex items-center gap-3">
              <CampaignIdentity name={campaign.name} emoji={campaign.emoji} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider">
                    Hub
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  >
                    Active
                  </Badge>
                </div>
                <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors mt-0.5">
                  {campaign.name}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground truncate">
                  1 QR connected
                </div>
              </div>
            </div>
          </button>

          {/* Connector 2: Campaign -> Route */}
          <div className="hidden md:flex items-center flex-1 max-w-[80px] px-1">
            <div className="w-full h-px bg-gradient-to-r from-primary via-primary/50 to-border relative">
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-border" />
            </div>
          </div>
          <div className="md:hidden flex flex-col items-center h-4">
            <div className="w-px h-full bg-border" />
          </div>

          {/* 3. Route Engine Node */}
          <button
            type="button"
            onClick={onSelectRouting}
            onMouseEnter={() => setHoveredNode("route")}
            onMouseLeave={() => setHoveredNode(null)}
            className={cn(
              "w-full md:w-56 p-3 rounded-xl border border-border/80 bg-surface-elevated/70 shadow-xs text-left cursor-pointer transition-all duration-200",
              "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 group",
              hoveredNode === "route" && "border-primary/60 ring-2 ring-primary/10"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <NxtqrIcon icon="solar:tuning-bold" size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-mono uppercase text-muted-foreground">
                  Routing Rule
                </div>
                <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  Direct Default
                </div>
                <div className="text-[10px] font-mono text-muted-foreground truncate">
                  Standard Resolution
                </div>
              </div>
            </div>
          </button>

          {/* Connector 3: Route -> Destination */}
          <div className="hidden md:flex items-center flex-1 max-w-[80px] px-1">
            <div className="w-full h-px bg-gradient-to-r from-border via-border to-emerald-500/80 relative">
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
          <div className="md:hidden flex flex-col items-center h-4">
            <div className="w-px h-full bg-emerald-500/60" />
          </div>

          {/* 4. Target Destination Node */}
          <button
            type="button"
            onClick={() => onSelectDestination(singleDest)}
            onMouseEnter={() => setHoveredNode("dest")}
            onMouseLeave={() => setHoveredNode(null)}
            className={cn(
              "w-full md:w-60 p-3 rounded-xl border border-border/80 bg-surface-elevated/80 shadow-xs text-left cursor-pointer transition-all duration-200",
              "hover:border-emerald-500/50 hover:shadow-md hover:-translate-y-0.5 group",
              hoveredNode === "dest" && "border-emerald-500 ring-2 ring-emerald-500/10"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <NxtqrIcon icon="solar:link-square-bold" size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold">
                    Endpoint
                  </span>
                  <NxtqrIcon
                    icon="solar:arrow-right-up-bold"
                    size={11}
                    className="text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-foreground transition-all"
                  />
                </div>
                <div className="text-xs font-bold text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {singleDest.domain}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground truncate">
                  {singleDest.count} scans routed
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Multi-QR Mode (2-5 or 6+ clustered)
  const displayQrs =
    density === "overview" && totalQrs > 5 ? qrAssets.slice(0, 5) : qrAssets;
  const overflowCount = Math.max(0, totalQrs - displayQrs.length);

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/80 bg-surface/70 backdrop-blur-xs p-4 sm:p-5 shadow-2xs overflow-hidden",
        className
      )}
    >
      {/* Header Toolbar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <NxtqrIcon icon="solar:route-bold" size={12} />
          </div>
          <span className="text-xs font-semibold text-foreground tracking-tight">
            Campaign Map
          </span>
          <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.2 rounded-md bg-muted/60 border border-border/60">
            {totalQrs} {totalQrs === 1 ? "asset" : "assets"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {totalQrs > 5 && (
            <div className="flex items-center border border-border rounded-lg p-0.5 bg-surface-elevated/60 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setDensity("overview")}
                className={cn(
                  "px-2 py-0.5 rounded font-medium transition-colors",
                  density === "overview"
                    ? "bg-surface text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setDensity("detailed")}
                className={cn(
                  "px-2 py-0.5 rounded font-medium transition-colors",
                  density === "detailed"
                    ? "bg-surface text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Detailed
              </button>
            </div>
          )}

          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1.5 hidden sm:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Active Topology</span>
          </span>
        </div>
      </div>

      {/* Multi-Node Converging Topology */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left: QR Assets (Cols 1-5) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
            Origin QR Codes ({displayQrs.length})
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {displayQrs.map((qr) => (
              <button
                key={qr.id}
                type="button"
                onClick={() => onSelectQr(qr)}
                className="w-full p-2.5 rounded-xl border border-border/70 bg-surface-elevated/70 hover:border-primary/50 hover:bg-muted/30 transition-all text-left flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 shrink-0 bg-white p-0.5 rounded-md border border-border/60">
                    <QrThumbnail
                      name={qr.name}
                      slug={qr.slug}
                      qrType={qr.qrType}
                      design={qr.design}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {qr.name}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground truncate">
                      /{qr.slug}
                    </div>
                  </div>
                </div>

                <div className="font-mono text-right shrink-0">
                  <div className="text-xs font-semibold text-foreground">
                    {qr.totalScans}
                  </div>
                  <div className="text-[9px] text-muted-foreground">scans</div>
                </div>
              </button>
            ))}

            {overflowCount > 0 && (
              <button
                type="button"
                onClick={() => setDensity("detailed")}
                className="w-full p-2 rounded-xl border border-dashed border-border/70 text-center text-xs font-mono text-primary hover:bg-primary/5 transition-colors cursor-pointer"
              >
                +{overflowCount} more assets (show all)
              </button>
            )}
          </div>
        </div>

        {/* Center: Campaign Core Hub (Cols 6-8) */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center p-3 text-center">
          <button
            type="button"
            onClick={onSelectCampaign}
            className="p-4 rounded-2xl border border-primary/30 bg-[#FFF8E0]/60 dark:bg-[#202020]/90 shadow-sm hover:border-primary hover:scale-105 transition-all text-center flex flex-col items-center cursor-pointer group w-full max-w-[200px]"
          >
            <CampaignIdentity name={campaign.name} emoji={campaign.emoji} size="md" />
            <div className="text-xs font-bold text-foreground mt-2 truncate w-full group-hover:text-primary transition-colors">
              {campaign.name}
            </div>
            <div className="text-[9px] font-mono uppercase tracking-wider text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10 mt-1">
              Campaign Core
            </div>
          </button>
        </div>

        {/* Right: Destinations (Cols 9-12) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
            Target Endpoints ({destinations.length})
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {destinations.map((dest) => (
              <button
                key={dest.domain}
                type="button"
                onClick={() => onSelectDestination(dest)}
                className="w-full p-2.5 rounded-xl border border-border/70 bg-surface-elevated/70 hover:border-emerald-500/50 hover:bg-muted/30 transition-all text-left flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <NxtqrIcon icon="solar:link-square-bold" size={13} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {dest.domain}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground truncate">
                      {dest.qrCount} {dest.qrCount === 1 ? "QR" : "QRs"} resolving
                    </div>
                  </div>
                </div>

                <div className="font-mono text-right shrink-0">
                  <div className="text-xs font-semibold text-foreground">
                    {dest.count}
                  </div>
                  <div className="text-[9px] text-muted-foreground">scans</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
