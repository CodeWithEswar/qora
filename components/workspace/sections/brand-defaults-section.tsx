"use client";

import * as React from "react";
import Link from "next/link";
import { Palette, Check, ChevronsUpDown, ExternalLink, Sparkles, Layers, QrCode, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { WorkspaceControlPlaneOverview } from "@nxtqr/contracts";

interface BrandDefaultsSectionProps {
  overview: WorkspaceControlPlaneOverview;
  onSetDefaultBrandKit: (brandKitId: string | null) => Promise<void>;
  isSaving: boolean;
}

export function BrandDefaultsSection({
  overview,
  onSetDefaultBrandKit,
  isSaving,
}: BrandDefaultsSectionProps) {
  const { identity, brandDefaults, availableBrandKits, userPermissions, stats } = overview;
  const [open, setOpen] = React.useState(false);
  const [brandSearch, setBrandSearch] = React.useState("");

  const selectedKit = availableBrandKits.find(
    (b) => b.id === brandDefaults.defaultBrandKitId
  );

  const filteredBrandKits = availableBrandKits.filter((kit) =>
    kit.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold font-display">Brand Kit Defaults</CardTitle>
          </div>
          <Link
            href={`/${identity.slug}/brand`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
          >
            <span>Manage Brand Kits</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <CardDescription className="text-xs">
          Select an authoritative Brand Kit to automatically apply brand colors, typography tokens, and logos to new resources.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Brand Kit Picker */}
        <div className="p-4 rounded-xl border border-border/60 bg-surface/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-foreground block">
                Workspace Default Brand Kit
              </span>
              <p className="text-[11px] text-muted-foreground max-w-md">
                Pre-selected in QR Studio, Bulk Creator, and Destination Studio for all workspace members.
              </p>
            </div>

            {userPermissions.canUpdate && (
              <div className="flex items-center gap-2">
                <Popover
                  open={open}
                  onOpenChange={(next) => {
                    setOpen(next);
                    if (!next) setBrandSearch("");
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSaving}
                      className="min-w-[200px] justify-between text-xs h-9 border-border/80"
                    >
                      <span className="truncate">
                        {selectedKit ? selectedKit.name : "Select default kit..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[260px] p-2 space-y-2" align="end">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search brand kits..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="h-8 pl-8 text-xs bg-surface/50 border-border/70"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSetDefaultBrandKit(null);
                          setOpen(false);
                          setBrandSearch("");
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface text-left transition-colors"
                      >
                        <Check
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            !brandDefaults.defaultBrandKitId ? "opacity-100 text-primary" : "opacity-0"
                          )}
                        />
                        <span className="text-muted-foreground">No default brand kit</span>
                      </button>
                      {filteredBrandKits.length === 0 ? (
                        <div className="py-3 text-center text-xs text-muted-foreground">
                          No matching brand kits found
                        </div>
                      ) : (
                        filteredBrandKits.map((kit) => (
                          <button
                            key={kit.id}
                            type="button"
                            onClick={() => {
                              onSetDefaultBrandKit(kit.id);
                              setOpen(false);
                              setBrandSearch("");
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-surface text-left transition-colors"
                          >
                            <Check
                              className={cn(
                                "h-3.5 w-3.5 shrink-0",
                                brandDefaults.defaultBrandKitId === kit.id
                                  ? "opacity-100 text-primary"
                                  : "opacity-0"
                              )}
                            />
                            <span className="truncate">{kit.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {brandDefaults.defaultBrandKitId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetDefaultBrandKit(null)}
                    disabled={isSaving}
                    className="text-xs h-9 text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Active Default Summary Card / True Empty State */}
          {selectedKit ? (
            <div className="mt-3 p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono text-xs font-bold">
                  B
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    {selectedKit.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    slug: {selectedKit.slug} • Authoritative default
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ACTIVE DEFAULT
              </span>
            </div>
          ) : (
            <div className="mt-3 p-3 rounded-lg border border-dashed border-border/80 bg-background/40 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground/60">B</span>
                <span>No default brand kit configured for this workspace.</span>
              </div>
              <Link
                href={`/${identity.slug}/brand`}
                className="text-primary hover:underline font-mono text-[11px]"
              >
                Create brand kit →
              </Link>
            </div>
          )}
        </div>

        {/* Signature Feature: Brand Propagation Preview */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground font-display flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>DEFAULT PROPAGATION PREVIEW</span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Real workspace inheritance targets
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase">QR Codes</span>
                <QrCode className="h-3 w-3 text-muted-foreground/60" />
              </div>
              <span className="text-base font-bold text-foreground block">
                {stats.qrCount}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                Inherit default styling
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase">Templates</span>
                <Layers className="h-3 w-3 text-muted-foreground/60" />
              </div>
              <span className="text-base font-bold text-foreground block">
                {stats.templateCount}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                Design preset library
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase">Landing Pages</span>
                <FileText className="h-3 w-3 text-muted-foreground/60" />
              </div>
              <span className="text-base font-bold text-foreground block">
                {stats.landingPageCount}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                Destination studio pages
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
            <strong>Propagation Rule:</strong> Changing the default brand kit applies immediately to all newly initiated drafts. Existing published QR codes and landing pages preserve their immutable version snapshots to guarantee visual stability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
