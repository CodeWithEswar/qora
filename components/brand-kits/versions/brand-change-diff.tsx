"use client";

import * as React from "react";
import { BrandKitDetailV1, BrandKitVersionV1 } from "@nxtqr/contracts";
import { ArrowRight, Check, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BrandChangeDiffProps {
  kit: BrandKitDetailV1;
  latestVersion: BrandKitVersionV1 | null;
}

export function BrandChangeDiff({ kit, latestVersion }: BrandChangeDiffProps) {
  if (!latestVersion) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface/40">
        <p className="text-xs text-muted-foreground">
          No previous published version found to compare.
        </p>
      </div>
    );
  }

  const snapshot = latestVersion.snapshot || {};
  const prevColors = Array.isArray(snapshot.colors) ? snapshot.colors : [];
  const prevPrimaryColor = prevColors.find((c: any) => c.role === "primary")?.hex || snapshot.primaryColor || "#FA520F";

  const isColorChanged = kit.primaryColor !== prevPrimaryColor;
  const isPresetsChanged = kit.qrPresets.length !== (snapshot.qrPresets?.length || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
          CHANGE IMPACT & REVISION DIFF
        </h4>
        <Badge variant="outline" className="text-[10px] font-mono">
          DRAFT vs REV {latestVersion.versionNumber}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Previous Version Box */}
        <div className="p-4 rounded-xl border border-border/70 bg-surface/50 space-y-3">
          <div className="text-[11px] font-mono uppercase font-bold text-muted-foreground">
            PUBLISHED (REVISION {latestVersion.versionNumber})
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Primary Hex:</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span
                  className="w-3.5 h-3.5 rounded border border-border"
                  style={{ backgroundColor: prevPrimaryColor }}
                />
                <span>{prevPrimaryColor}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tokens:</span>
              <span className="font-mono">{prevColors.length} configured</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">QR Presets:</span>
              <span className="font-mono">{snapshot.qrPresets?.length || 0} presets</span>
            </div>
          </div>
        </div>

        {/* Current Working Draft Box */}
        <div className="p-4 rounded-xl border border-[#FA520F]/40 bg-[#FA520F]/5 space-y-3">
          <div className="text-[11px] font-mono uppercase font-bold text-[#FA520F]">
            CURRENT WORKING DRAFT (REVISION {kit.publishedRevision + 1})
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Primary Hex:</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span
                  className="w-3.5 h-3.5 rounded border border-border"
                  style={{ backgroundColor: kit.primaryColor }}
                />
                <span className={isColorChanged ? "text-[#FA520F] font-bold" : ""}>
                  {kit.primaryColor}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tokens:</span>
              <span className="font-mono">{kit.colors.length} configured</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">QR Presets:</span>
              <span className="font-mono">{kit.qrPresets.length} presets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
