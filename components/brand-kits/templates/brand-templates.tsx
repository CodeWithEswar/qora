"use client";

import * as React from "react";
import Link from "next/link";
import { BrandKitDetailV1 } from "@nxtqr/contracts";
import { LayoutTemplate, Plus, ExternalLink, Sparkles, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BrandTemplatesProps {
  kit: BrandKitDetailV1;
  orgSlug: string;
}

export function BrandTemplates({ kit, orgSlug }: BrandTemplatesProps) {
  // In NXTQR, templates are real database records.
  // When no templates are assigned to this brand kit, render the authentic empty state.
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#FA520F] mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Design Blueprints</span>
          </div>
          <h3 className="text-lg font-bold text-foreground font-display">
            BRANDED TEMPLATES
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reusable QR styles, campaign packaging, and landing designs pre-configured with this Brand Kit.
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="h-9 gap-1.5 text-xs bg-[#FA520F] hover:bg-[#E0480C] text-white font-medium cursor-pointer"
        >
          <Link href={`/${orgSlug}/qr/studio?brandKitId=${kit.id}&templateMode=true`}>
            <Plus className="h-3.5 w-3.5" />
            <span>Create Template</span>
          </Link>
        </Button>
      </div>

      {/* Authentic Empty State — Strict Zero Fake Data */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-xl border border-dashed border-border/80 bg-surface/40 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl border border-border bg-surface-elevated flex items-center justify-center text-[#FA520F] shadow-xs">
          <LayoutTemplate className="w-6 h-6" />
        </div>

        <div className="space-y-1 max-w-sm">
          <h4 className="text-sm font-semibold text-foreground">
            No Branded Templates Yet
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Create reusable QR presets or destination layouts pre-wired with {kit.name}&apos;s color tokens and brand marks.
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5 border-border hover:border-[#FA520F] cursor-pointer"
        >
          <Link href={`/${orgSlug}/qr/studio?brandKitId=${kit.id}`}>
            <Layers className="w-3 h-3 text-[#FA520F]" />
            <span>Open in QR Studio to Save Template</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
