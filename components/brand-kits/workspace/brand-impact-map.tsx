"use client";

import * as React from "react";
import { BrandKitDetailV1 } from "@nxtqr/contracts";
import { QrCode, Globe, Layers, ArrowUpRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BrandImpactMapProps {
  kit: BrandKitDetailV1;
  orgSlug: string;
}

export function BrandImpactMap({ kit, orgSlug }: BrandImpactMapProps) {
  const [resources, setResources] = React.useState<{
    qrs: Array<{ id: string; name: string; slug: string; status: string; qrType: string }>;
    landingPages: Array<{ id: string; name: string; slug: string; status: string }>;
    campaigns: Array<{ id: string; name: string; slug: string; status: string }>;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/v1/brand-kits/${kit.id}/resources`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setResources(data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load assigned resources:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [kit.id]);

  const totalAssigned =
    (resources?.qrs.length || 0) +
    (resources?.landingPages.length || 0) +
    (resources?.campaigns.length || 0);

  return (
    <div className="rounded-2xl border border-border/80 bg-surface/50 backdrop-blur-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground font-display">
            BRAND IMPACT CONSTELLATION
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Production footprint of this Brand Kit across active campaigns, QR routing codes, and landing destinations.
          </p>
        </div>

        <div className="text-[11px] font-mono text-muted-foreground bg-surface-elevated/60 px-2.5 py-1 rounded-md border border-border/60">
          <span>{totalAssigned} LINKED PRODUCTION RESOURCES</span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Loading assigned resource constellation...
        </div>
      ) : totalAssigned === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-border/70 bg-surface/40">
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No QR codes, landing destinations, or campaigns are currently referencing this Brand Kit. Apply this kit in QR Studio or Destination Studio to establish real governance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Connected QR Codes */}
          <div className="p-4 rounded-xl border border-border/80 bg-surface-elevated/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                <QrCode className="w-3.5 h-3.5 text-[#FA520F]" />
                <span>QR CODES</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#FA520F]">
                {resources?.qrs.length || 0}
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {resources?.qrs.length === 0 ? (
                <div className="text-[11px] text-muted-foreground py-2">No QRs linked yet.</div>
              ) : (
                resources?.qrs.map((qr) => (
                  <Link
                    key={qr.id}
                    href={`/${orgSlug}/qr/${qr.id}`}
                    className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-surface hover:bg-surface-elevated transition-colors text-xs group"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{qr.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">
                        /{qr.slug} • {qr.status}
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* 2. Connected Landing Pages */}
          <div className="p-4 rounded-xl border border-border/80 bg-surface-elevated/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>LANDING PAGES</span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-500">
                {resources?.landingPages.length || 0}
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {resources?.landingPages.length === 0 ? (
                <div className="text-[11px] text-muted-foreground py-2">No landing pages linked yet.</div>
              ) : (
                resources?.landingPages.map((lp) => (
                  <Link
                    key={lp.id}
                    href={`/${orgSlug}/landing-pages/${lp.id}/edit`}
                    className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-surface hover:bg-surface-elevated transition-colors text-xs group"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{lp.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">
                        /{lp.slug} • {lp.status}
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* 3. Connected Campaigns */}
          <div className="p-4 rounded-xl border border-border/80 bg-surface-elevated/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>CAMPAIGNS</span>
              </div>
              <span className="text-xs font-mono font-bold text-purple-500">
                {resources?.campaigns.length || 0}
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {resources?.campaigns.length === 0 ? (
                <div className="text-[11px] text-muted-foreground py-2">No campaigns linked yet.</div>
              ) : (
                resources?.campaigns.map((camp) => (
                  <Link
                    key={camp.id}
                    href={`/${orgSlug}/campaigns/${camp.id}`}
                    className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-surface hover:bg-surface-elevated transition-colors text-xs group"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{camp.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">
                        /{camp.slug} • {camp.status}
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
