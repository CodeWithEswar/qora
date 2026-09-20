"use client";

import React from "react";
import Link from "next/link";
import type { FileUsageV1 } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface AssetConstellationProps {
  fileName: string;
  usages: FileUsageV1[];
  orgSlug: string;
}

export function AssetConstellation({
  fileName,
  usages = [],
  orgSlug,
}: AssetConstellationProps) {
  const safeUsages = Array.isArray(usages) ? usages : [];
  const hasUsages = safeUsages.length > 0;

  return (
    <div className="w-full rounded-2xl border border-border/70 bg-muted/20 p-4 select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <NxtqrIcon icon="solar:transmission-bold" size={15} className="text-[#FA520F]" />
          <span>Asset Constellation</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          {safeUsages.length} Connection{safeUsages.length === 1 ? "" : "s"}
        </span>
      </div>

      {!hasUsages ? (
        <div className="py-6 px-3 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border/60 bg-card/50">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-1.5">
            <NxtqrIcon icon="solar:link-broken-linear" size={16} />
          </div>
          <span className="text-xs font-medium text-foreground">Not currently used</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            Attach this asset inside QR Studio, Landing Pages, or Campaigns.
          </span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Central Root Node */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/80 shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-[#FA520F]/15 flex items-center justify-center text-[#FA520F] shrink-0">
              <NxtqrIcon icon="solar:file-bold" size={13} />
            </div>
            <div className="flex flex-col min-w-0 flex-1 text-left">
              <span className="text-xs font-bold text-foreground truncate">{fileName}</span>
              <span className="text-[10px] font-mono text-muted-foreground">Source Asset Binary</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#FA520F] animate-pulse" />
          </div>

          {/* Connection Lines & Dependent Leaves */}
          <div className="pl-3.5 border-l-2 border-dashed border-border/80 ml-3 space-y-2 py-1">
            {safeUsages.map((usage) => {
              const isLandingPage = usage.resourceType === "LANDING_PAGE";
              const isQrCode = usage.resourceType === "QR_CODE";
              const isCampaign = usage.resourceType === "CAMPAIGN";
              const isBrand = usage.resourceType === "BRAND_KIT";

              return (
                <div
                  key={usage.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/60 shadow-xs hover:border-border transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center shrink-0",
                        isLandingPage && "bg-purple-500/15 text-purple-600 dark:text-purple-400",
                        isQrCode && "bg-[#FA520F]/15 text-[#FA520F]",
                        isCampaign && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                        isBrand && "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      <NxtqrIcon
                        icon={
                          isLandingPage
                            ? "solar:document-text-bold"
                            : isQrCode
                            ? "solar:qr-code-bold"
                            : isCampaign
                            ? "solar:flag-bold"
                            : "solar:pallete-2-bold"
                        }
                        size={12}
                      />
                    </div>

                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-xs font-semibold text-foreground truncate group-hover:underline">
                        {usage.resourceName}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {usage.resourceType.replace("_", " ")} · {usage.usageRole.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {usage.resourceHref && (
                    <Link
                      href={usage.resourceHref}
                      className="p-1 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100 transition-opacity"
                      title="Open Resource"
                    >
                      <NxtqrIcon icon="solar:arrow-right-up-linear" size={13} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
