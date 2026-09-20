"use client";

import * as React from "react";
import { BrandKitDetailV1 } from "@nxtqr/contracts";
import {
  Calendar,
  Edit2,
  CheckCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BrandOverviewProps {
  kit: BrandKitDetailV1;
  onEditIdentity: () => void;
  onPublish: () => void;
  onNavigateTab: (tab: string) => void;
}

export function BrandOverview({
  kit,
  onEditIdentity,
  onPublish,
  onNavigateTab,
}: BrandOverviewProps) {
  const primaryColor = kit.primaryColor || "#FA520F";
  const primaryLogo = kit.logos.find((l) => l.isPrimary) || kit.logos[0];
  const activePreset = kit.qrPresets.find((p) => p.isDefault) || kit.qrPresets[0];

  return (
    <div className="space-y-6">
      {/* 1. Brand Identity Hero Canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-surface via-surface-elevated/40 to-surface p-5 sm:p-7 lg:p-8 shadow-xs">
        {/* Subtle geometric background motif */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#FA520F]/5 blur-3xl pointer-events-none" />
        <div className="absolute right-6 top-6 opacity-10 pointer-events-none font-mono text-[9px] text-right hidden lg:block select-none">
          <div>REV_{kit.publishedRevision}.00</div>
          <div>ROUTING_TIER_1</div>
          <div>ORGANIZATION_BOUND</div>
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Logo & Identity Summary */}
          <div className="flex items-start gap-3.5 sm:gap-4.5 min-w-0 flex-1">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl shrink-0 border border-border flex items-center justify-center p-2 shadow-sm overflow-hidden bg-white dark:bg-black/40"
              style={{ borderColor: primaryColor }}
            >
              {primaryLogo?.url || kit.logoUrl ? (
                <img
                  src={primaryLogo?.url || kit.logoUrl || ""}
                  alt={kit.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span
                  className="text-xl sm:text-2xl font-bold font-mono"
                  style={{ color: primaryColor }}
                >
                  {kit.name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground font-display tracking-tight truncate max-w-full">
                  {kit.name}
                </h2>
                {kit.isDefault && (
                  <Badge
                    variant="secondary"
                    className="px-2 py-0.5 text-[10px] font-semibold bg-[#FA520F]/15 text-[#FA520F] border border-[#FA520F]/20 shrink-0"
                  >
                    Default Identity
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="px-2 py-0.5 text-[10px] font-mono shrink-0"
                >
                  Revision {kit.publishedRevision}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                {kit.description || "Authoritative brand identity system governing dynamic QR experiences."}
              </p>

              {/* Timestamp metadata */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-mono pt-0.5">
                <span className="flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3 text-muted-foreground/70" />
                  Created {new Date(kit.createdAt).toLocaleDateString()}
                </span>
                <span className="hidden sm:inline text-muted-foreground/40">•</span>
                <span className="flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-muted-foreground/70" />
                  Updated {new Date(kit.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 sm:gap-2 shrink-0 pt-2 lg:pt-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onEditIdentity}
              className="h-9 sm:h-8 text-xs gap-1.5 cursor-pointer border-border flex-1 sm:flex-initial justify-center"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Identity</span>
            </Button>

            <Button
              size="sm"
              onClick={onPublish}
              className="h-9 sm:h-8 text-xs gap-1.5 bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium cursor-pointer shadow-xs flex-1 sm:flex-initial justify-center"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Publish Revision</span>
            </Button>
          </div>
        </div>

        {/* Brand Tokens Matrix Strip — Fully Responsive 1 / 2 / 4 Columns */}
        <div className="mt-6 sm:mt-7 pt-5 sm:pt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          {/* Colors quick glance */}
          <div
            onClick={() => onNavigateTab("colors")}
            className="p-3.5 rounded-xl border border-border/60 bg-surface/50 hover:border-border cursor-pointer transition-colors flex flex-col justify-between group overflow-hidden"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between gap-1 min-w-0">
              <span className="truncate">COLOR PALETTE</span>
              <span className="font-mono shrink-0 bg-surface border border-border/70 px-1.5 py-0.2 rounded text-[9px]">
                {kit.colors.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap overflow-hidden pt-0.5">
              {kit.colors.slice(0, 5).map((col) => (
                <div
                  key={col.id}
                  className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-md border border-border/80 shadow-2xs shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: col.hex }}
                  title={`${col.name} (${col.hex})`}
                />
              ))}
              {kit.colors.length > 5 && (
                <span className="text-[10px] font-mono text-muted-foreground shrink-0 pl-0.5">
                  +{kit.colors.length - 5}
                </span>
              )}
            </div>
          </div>

          {/* Typography quick glance */}
          <div
            onClick={() => onNavigateTab("typography")}
            className="p-3.5 rounded-xl border border-border/60 bg-surface/50 hover:border-border cursor-pointer transition-colors flex flex-col justify-between group overflow-hidden"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center justify-between gap-1 min-w-0">
              <span className="truncate shrink-0">TYPOGRAPHY</span>
              <span className="font-mono text-[9px] text-muted-foreground/80 truncate">DISPLAY + UI</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">
                {kit.typography?.display?.label || "Instrument Serif"}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                {kit.typography?.ui?.label || "Inter"}
              </div>
            </div>
          </div>

          {/* QR Style quick glance */}
          <div
            onClick={() => onNavigateTab("qr")}
            className="p-3.5 rounded-xl border border-border/60 bg-surface/50 hover:border-border cursor-pointer transition-colors flex flex-col justify-between group overflow-hidden"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center justify-between gap-1 min-w-0">
              <span className="truncate shrink-0">QR PRESET</span>
              <span className="font-mono shrink-0 bg-surface border border-border/70 px-1.5 py-0.2 rounded text-[9px]">
                {kit.qrPresets.length}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">
                {activePreset?.name || "Standard Geometry"}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                {activePreset?.design?.moduleStyle || "squares"} modules
              </div>
            </div>
          </div>

          {/* Governance quick glance */}
          <div
            onClick={() => onNavigateTab("governance")}
            className="p-3.5 rounded-xl border border-border/60 bg-surface/50 hover:border-border cursor-pointer transition-colors flex flex-col justify-between group overflow-hidden"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center justify-between gap-1 min-w-0">
              <span className="truncate shrink-0">GUARDRAILS</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#FA520F] shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">
                {kit.governance?.lockedFields?.length || 0} Locked Fields
              </div>
              <div className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                Scanability: {kit.governance?.enforceScanabilityLevel || "warning"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
