"use client";

import * as React from "react";
import Link from "next/link";
import { Globe, ExternalLink, ShieldCheck, Server, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WorkspaceControlPlaneOverview } from "@nxtqr/contracts";

interface DomainsSummarySectionProps {
  overview: WorkspaceControlPlaneOverview;
}

export function DomainsSummarySection({ overview }: DomainsSummarySectionProps) {
  const { identity, domains } = overview;

  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold font-display">Domains & Edge Infrastructure</CardTitle>
          </div>
          <Link
            href={`/${identity.slug}/domains`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
          >
            <span>Manage custom domains</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <CardDescription className="text-xs">
          High-performance edge resolution host configuration, custom domain namespaces, and short link contracts.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Default Platform Domain */}
        <div className="p-4 rounded-xl border border-border/60 bg-surface/30 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Server className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground font-mono">
                  nxtqr.vercel.app
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  MANAGED PLATFORM INFRASTRUCTURE
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Authoritative platform-managed default resolver domain. Available across all workspaces and plans. Cannot be detached or archived.
              </p>
            </div>

            <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded border border-border shrink-0">
              Contract: /s/:slug
            </span>
          </div>
        </div>

        {/* Custom Domains Summary */}
        <div className="p-4 rounded-xl border border-border/60 bg-surface/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 block">
              Organization Custom Domains
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-foreground">
                {domains.customDomainsCount}
              </span>
              <span className="text-xs text-muted-foreground">
                custom vanity host{domains.customDomainsCount === 1 ? "" : "s"} configured
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground max-w-md">
              Custom vanity domains provide organization-owned scan endpoints (e.g. <code>qr.yourbrand.com</code>) with dedicated edge SSL.
            </p>
          </div>

          <Link href={`/${identity.slug}/domains`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 border-border/80 hover:bg-surface">
              <span>Configure domains</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {/* Identity Stability Invariant Notice */}
        <div className="p-3 rounded-lg bg-surface/20 border border-border/40 text-[11px] text-muted-foreground leading-relaxed">
          <strong>Printed QR Stability Invariant:</strong> Connecting or updating a custom domain does not silently rewrite previously printed QR codes. Every dynamic QR code retains its permanent resolver identity to prevent broken physical signage.
        </div>
      </CardContent>
    </Card>
  );
}
