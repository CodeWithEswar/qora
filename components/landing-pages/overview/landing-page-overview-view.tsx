"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  LandingPageRecord,
  LandingPageConnectedQrV1,
  LandingPageVersionResponseV1,
} from "@nxtqr/contracts";
import { DestinationTrace } from "./destination-trace";
import { ConnectedQrsSection } from "./connected-qrs-section";
import { VersionTimeline } from "./version-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LandingPageOverviewViewProps {
  page: LandingPageRecord;
  connectedQrs: LandingPageConnectedQrV1[];
  versions: LandingPageVersionResponseV1[];
  orgSlug: string;
}

export function LandingPageOverviewView({
  page: initialPage,
  connectedQrs: initialQrs,
  versions: initialVersions,
  orgSlug,
}: LandingPageOverviewViewProps) {
  const router = useRouter();
  const [page, setPage] = useState<LandingPageRecord>(initialPage);
  const [qrs, setQrs] = useState<LandingPageConnectedQrV1[]>(initialQrs);
  const [versions, setVersions] = useState<LandingPageVersionResponseV1[]>(initialVersions);

  const isPublished = page.status === "published";
  const liveVersion = versions.find((v) => v.isLive);
  const publicUrl = `https://nxtqr.vercel.app/p/${page.slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public URL copied to clipboard", { description: publicUrl });
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full pb-16">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
            <Link href={`/${orgSlug}/landing-pages`} className="hover:text-foreground transition-colors">
              Landing Pages
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-[240px]">
              {page.name}
            </span>
          </nav>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {page.name}
            </h1>

            <Badge
              variant={isPublished ? "default" : "secondary"}
              className={cn(
                "text-xs uppercase font-mono px-2 py-0.5",
                isPublished && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              )}
            >
              {page.status}
            </Badge>
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-semibold">/p/{page.slug}</span>
            <span>•</span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="hover:text-primary transition-colors inline-flex items-center gap-1 underline underline-offset-2"
            >
              <NxtqrIcon icon="solar:copy-linear" size={13} />
              <span>Copy Public Link</span>
            </button>
            {isPublished && (
              <>
                <span>•</span>
                <a
                  href={`/p/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <NxtqrIcon icon="solar:arrow-right-up-linear" size={13} />
                  <span>Open Live</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Primary Operational Actions */}
        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold">
            <Link href={`/${orgSlug}/landing-pages/${page.id}/analytics`}>
              <NxtqrIcon icon="solar:chart-2-bold" size={15} />
              <span>Analytics</span>
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold bg-[#FA520F] hover:bg-[#FA520F]/90 text-white shadow-sm"
          >
            <Link href={`/${orgSlug}/landing-pages/${page.id}/edit`}>
              <NxtqrIcon icon="solar:pen-bold" size={15} />
              <span>Open Destination Studio</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Destination Pulse Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
            Publication Status
          </span>
          <div className="mt-2 flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isPublished ? "bg-emerald-500" : "bg-amber-400")} />
            <span className="text-xl font-bold uppercase">{page.status}</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block font-mono">
            {liveVersion ? `Version ${liveVersion.versionNumber} active` : "Draft checkpoint"}
          </span>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
            Connected QRs
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-primary">{qrs.length}</span>
            <span className="text-xs text-muted-foreground">active routes</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block font-mono">
            Direct scan ingress
          </span>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
            Destination Views
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-foreground">
              {(page.viewCount || 0).toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block font-mono">
            Total scan impressions
          </span>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
            CTA Interactions
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {(page.ctaCount || 0).toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block font-mono">
            Action conversions logged
          </span>
        </div>
      </div>

      {/* 3. Destination Trace (Signature Architectural View) */}
      <DestinationTrace
        page={page}
        connectedQrs={qrs}
        publishedVersionNumber={liveVersion?.versionNumber}
      />

      {/* 4. Two-Column Grid: Connected QRs & Version Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Connected QRs */}
        <ConnectedQrsSection
          pageId={page.id}
          pageName={page.name}
          orgSlug={orgSlug}
          initialQrs={qrs}
          onRefresh={handleRefresh}
        />

        {/* Immutable Version Timeline */}
        <VersionTimeline
          pageId={page.id}
          versions={versions}
          orgSlug={orgSlug}
        />
      </div>
    </div>
  );
}
