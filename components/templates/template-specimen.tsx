"use client";

import React, { useMemo } from "react";
import { QrTemplateSummary } from "@/lib/domains/templates/types";
import { renderQrSvg } from "@nxtqr/qr-core";
import { DesignFingerprint } from "./design-fingerprint";
import { ScanabilitySignal } from "./scanability-signal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";

interface TemplateSpecimenProps {
  template: QrTemplateSummary;
  onUse: (template: QrTemplateSummary) => void;
  onInspect: (template: QrTemplateSummary) => void;
  onEdit: (template: QrTemplateSummary) => void;
  onDuplicate: (template: QrTemplateSummary) => void;
  onExport: (template: QrTemplateSummary) => void;
  onDelete: (template: QrTemplateSummary) => void;
  className?: string;
}

export function TemplateSpecimen({
  template,
  onUse,
  onInspect,
  onEdit,
  onDuplicate,
  onExport,
  onDelete,
  className = "",
}: TemplateSpecimenProps) {
  // Render deterministic SVG preview
  const svgPreview = useMemo(() => {
    try {
      return renderQrSvg({
        content: "https://nxtqr.vercel.app/preview",
        design: template.design_json,
        moduleSize: 6,
      });
    } catch {
      return `<svg viewBox="0 0 150 150"><rect width="150" height="150" fill="#f4f4f5" /><text x="75" y="75" text-anchor="middle" font-size="10" fill="#71717a">Specimen</text></svg>`;
    }
  }, [template.design_json]);

  return (
    <div
      onClick={() => onInspect(template)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card/60 transition-all duration-200 hover:border-primary/50 hover:bg-card/90 hover:shadow-md cursor-pointer ${className}`}
    >
      {/* 1. Header / Brand Ribbon */}
      <div className="flex items-center justify-between border-b border-border/50 px-3.5 py-2.5 bg-muted/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[10px] uppercase font-semibold text-muted-foreground truncate">
            {template.brand_kit_name || "NXTQR CORE"}
          </span>
          {template.is_brand_locked && (
            <Badge
              variant="outline"
              className="gap-1 font-mono text-[9px] px-1.5 py-0 border-amber-500/40 text-amber-500 bg-amber-500/10"
            >
              <Icon icon="tabler:lock" className="h-2.5 w-2.5" />
              LOCKED
            </Badge>
          )}
        </div>

        <span className="font-mono text-[10px] text-muted-foreground">
          v{template.current_version}
        </span>
      </div>

      {/* 2. Physical Design Specimen / Material Canvas */}
      <div className="relative flex items-center justify-center p-6 bg-gradient-to-b from-muted/10 via-background to-muted/20 overflow-hidden">
        {/* Registration Marks / Corner Crosshairs */}
        <div className="absolute top-2 left-2 text-border/60 pointer-events-none select-none">
          <Icon icon="tabler:plus" className="h-2.5 w-2.5" />
        </div>
        <div className="absolute top-2 right-2 text-border/60 pointer-events-none select-none">
          <Icon icon="tabler:plus" className="h-2.5 w-2.5" />
        </div>
        <div className="absolute bottom-2 left-2 text-border/60 pointer-events-none select-none">
          <Icon icon="tabler:plus" className="h-2.5 w-2.5" />
        </div>
        <div className="absolute bottom-2 right-2 text-border/60 pointer-events-none select-none">
          <Icon icon="tabler:plus" className="h-2.5 w-2.5" />
        </div>

        {/* Vector QR Hero */}
        <div
          className="relative transition-transform duration-200 group-hover:scale-105 shrink-0 w-36 h-36 flex items-center justify-center drop-shadow-sm"
          dangerouslySetInnerHTML={{ __html: svgPreview }}
        />
      </div>

      {/* 3. Content Metadata & DNA */}
      <div className="p-3.5 space-y-2.5 bg-card/40">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-serif font-medium text-sm text-foreground truncate">
              {template.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground mt-0.5">
            <span>{template.compatibility[0] || "UNIVERSAL"}</span>
            {template.compatibility.length > 1 && (
              <span>+{template.compatibility.length - 1} types</span>
            )}
            <span>·</span>
            <span>{template.usage_count} uses</span>
          </div>
        </div>

        {/* Design Fingerprint Strip */}
        <div className="pt-1 border-t border-border/40">
          <DesignFingerprint design={template.design_json} />
        </div>

        {/* Scanability & Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <ScanabilitySignal design={template.design_json} compact />

          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="default"
              onClick={() => onUse(template)}
              className="h-7 text-xs px-2.5 gap-1 font-medium"
            >
              <Icon icon="tabler:wand" className="h-3 w-3" />
              Use
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                  <Icon icon="tabler:dots" className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 text-xs">
                <DropdownMenuItem onClick={() => onInspect(template)} className="gap-2">
                  <Icon icon="tabler:eye" className="h-3.5 w-3.5" />
                  Inspect DNA
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(template)} className="gap-2">
                  <Icon icon="tabler:edit" className="h-3.5 w-3.5" />
                  Edit in Forge
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(template)} className="gap-2">
                  <Icon icon="tabler:copy" className="h-3.5 w-3.5" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport(template)} className="gap-2">
                  <Icon icon="tabler:download" className="h-3.5 w-3.5" />
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(template)}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Icon icon="tabler:trash" className="h-3.5 w-3.5" />
                  Delete Template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
