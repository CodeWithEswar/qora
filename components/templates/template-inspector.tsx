"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  QrTemplateSummary,
  QrTemplateDetail,
  TemplateUsageInfo,
} from "@/lib/domains/templates/types";
import { renderQrSvg } from "@nxtqr/qr-core";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScanabilitySignal } from "./scanability-signal";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

interface TemplateInspectorProps {
  template: QrTemplateSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onUse: (template: QrTemplateSummary) => void;
  onEdit: (template: QrTemplateSummary) => void;
  onDuplicate: (template: QrTemplateSummary) => void;
  onExport: (template: QrTemplateSummary) => void;
  onDelete: (template: QrTemplateSummary) => void;
  onVersionRestored?: (updated: QrTemplateDetail) => void;
}

export function TemplateInspector({
  template,
  isOpen,
  onClose,
  onUse,
  onEdit,
  onDuplicate,
  onExport,
  onDelete,
  onVersionRestored,
}: TemplateInspectorProps) {
  const [surface, setSurface] = useState<"light" | "cream" | "dark">("light");
  const [detail, setDetail] = useState<QrTemplateDetail | null>(null);
  const [usage, setUsage] = useState<TemplateUsageInfo | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Fetch full details and usage when opened
  useEffect(() => {
    if (!template || !isOpen) return;

    let isMounted = true;

    Promise.all([
      fetch(`/api/v1/templates/${template.id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/v1/templates/${template.id}/usage`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([detailRes, usageRes]) => {
        if (!isMounted) return;
        if (detailRes?.data) setDetail(detailRes.data);
        if (usageRes?.data) setUsage(usageRes.data);
      })
      .catch((err) => {
        console.error("Failed to load template inspector data:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [template, isOpen]);

  const activeDesign = detail?.design_json || template?.design_json;

  // Render SVG in chosen surface
  const previewSvg = useMemo(() => {
    if (!activeDesign) return "";
    try {
      return renderQrSvg({
        content: "https://nxtqr.vercel.app/preview",
        design: activeDesign,
        moduleSize: 8,
      });
    } catch {
      return `<svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#f4f4f5" /><text x="100" y="100" text-anchor="middle" font-size="12" fill="#71717a">Preview Error</text></svg>`;
    }
  }, [activeDesign]);

  if (!template) return null;

  const handleRestoreVersion = async (versionNumber: number) => {
    if (!template) return;
    try {
      setIsRestoring(true);
      const res = await fetch(`/api/v1/templates/${template.id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: versionNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to restore version");

      toast.success(`Restored revision v${versionNumber} into new version v${data.data.current_version}`);
      setDetail(data.data);
      onVersionRestored?.(data.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to restore version");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-background border-l border-border"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/80 bg-card/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase font-semibold text-primary">
                {template.brand_kit_name || "NXTQR Core"}
              </span>
              {template.is_brand_locked ? (
                <Badge
                  variant="outline"
                  className="gap-1 font-mono text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-500 bg-amber-500/10"
                >
                  <Icon icon="tabler:lock" className="h-3 w-3" />
                  BRAND LOCKED
                </Badge>
              ) : (
                <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 text-muted-foreground">
                  EDITABLE
                </Badge>
              )}
            </div>

            <span className="font-mono text-xs text-muted-foreground">
              v{template.current_version}
            </span>
          </div>

          <SheetTitle className="font-serif text-xl tracking-tight">
            {template.name}
          </SheetTitle>

          {template.description && (
            <SheetDescription className="text-xs text-muted-foreground line-clamp-2">
              {template.description}
            </SheetDescription>
          )}

          {/* Quick Actions Rail */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onUse(template)}
              className="gap-1.5 text-xs font-medium"
            >
              <Icon icon="tabler:wand" className="h-3.5 w-3.5" />
              Use Template
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(template)}
              className="gap-1.5 text-xs"
            >
              <Icon icon="tabler:edit" className="h-3.5 w-3.5" />
              Edit in Forge
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDuplicate(template)}
              className="h-8 w-8 p-0"
              title="Duplicate"
            >
              <Icon icon="tabler:copy" className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onExport(template)}
              className="h-8 w-8 p-0"
              title="Export JSON"
            >
              <Icon icon="tabler:download" className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(template)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Delete Template"
            >
              <Icon icon="tabler:trash" className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Inspector Body */}
        <ScrollArea className="flex-1 px-5 py-4">
          <div className="space-y-6 pb-8">
            {/* 1. Large QR Preview + Surface Toggles */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase font-semibold text-muted-foreground">
                  Specimen Canvas
                </span>
                <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-md border border-border/50 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setSurface("light")}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      surface === "light"
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurface("cream")}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      surface === "cream"
                        ? "bg-[#FFF8E0] text-[#1F1F1F] shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Cream
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurface("dark")}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      surface === "dark"
                        ? "bg-[#111111] text-white shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              <div
                className={`relative flex items-center justify-center p-8 rounded-xl border transition-colors ${
                  surface === "light"
                    ? "bg-white border-zinc-200"
                    : surface === "cream"
                    ? "bg-[#FFF8E0] border-[#E6D5A8]"
                    : "bg-[#141414] border-zinc-800"
                }`}
              >
                <div
                  className="w-48 h-48 drop-shadow-sm flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                />
              </div>
            </div>

            {/* 2. Inspector Tabs */}
            <Tabs defaultValue="dna" className="w-full">
              <TabsList className="grid grid-cols-4 w-full h-8 text-xs font-mono">
                <TabsTrigger value="dna" className="text-xs">DNA</TabsTrigger>
                <TabsTrigger value="scan" className="text-xs">Signal</TabsTrigger>
                <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
                <TabsTrigger value="usage" className="text-xs">Usage</TabsTrigger>
              </TabsList>

              {/* TAB 1: DESIGN DNA */}
              <TabsContent value="dna" className="space-y-4 pt-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-border/70 p-2.5 bg-card/40 space-y-1">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      Module Geometry
                    </span>
                    <p className="font-semibold capitalize text-foreground">
                      {activeDesign?.moduleStyle || "Squares"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/70 p-2.5 bg-card/40 space-y-1">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      Eye Finders
                    </span>
                    <p className="font-semibold capitalize text-foreground">
                      {activeDesign?.eyeOuterStyle || "Square"} ({activeDesign?.eyeInnerStyle || "square"})
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/70 p-2.5 bg-card/40 space-y-1">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      Foreground Color
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-3.5 w-3.5 rounded border border-black/20"
                        style={{ backgroundColor: activeDesign?.fgColor || "#1F1F1F" }}
                      />
                      <span className="font-mono font-medium">{activeDesign?.fgColor}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/70 p-2.5 bg-card/40 space-y-1">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      Background Color
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-3.5 w-3.5 rounded border border-black/20"
                        style={{ backgroundColor: activeDesign?.bgColor || "#FFFFFF" }}
                      />
                      <span className="font-mono font-medium">{activeDesign?.bgColor}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/70 p-2.5 bg-card/40 space-y-1">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      Frame Style
                    </span>
                    <p className="font-semibold capitalize text-foreground">
                      {activeDesign?.frame?.style || "None"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/70 p-2.5 bg-card/40 space-y-1">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      Error Correction
                    </span>
                    <p className="font-semibold font-mono text-foreground">
                      Level {activeDesign?.errorCorrection || "Q"} (Reed-Solomon)
                    </p>
                  </div>
                </div>

                {/* Governance Locks */}
                {template.is_brand_locked && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                      <Icon icon="tabler:shield-lock" className="h-4 w-4" />
                      Brand Governance Active
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Enforced by {template.brand_kit_name || "corporate identity"}. Locked fields:{" "}
                      <span className="font-mono text-foreground font-medium">
                        {template.locked_fields.join(", ") || "All Brand Kit tokens"}
                      </span>
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* TAB 2: SCANABILITY SIGNAL */}
              <TabsContent value="scan" className="space-y-4 pt-3">
                {activeDesign && <ScanabilitySignal design={activeDesign} />}
              </TabsContent>

              {/* TAB 3: IMMUTABLE VERSION HISTORY */}
              <TabsContent value="history" className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    Historical Revisions ({detail?.versions?.length || 1})
                  </span>
                </div>

                <div className="space-y-2">
                  {(detail?.versions || []).map((ver) => {
                    const isCurrent = ver.version === template.current_version;

                    return (
                      <div
                        key={ver.id}
                        className={`rounded-lg border p-3 text-xs space-y-1.5 ${
                          isCurrent
                            ? "border-primary/60 bg-primary/5"
                            : "border-border/60 bg-card/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-foreground">
                              v{ver.version}
                            </span>
                            {isCurrent && (
                              <Badge variant="default" className="text-[9px] px-1 py-0">
                                CURRENT
                              </Badge>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground" suppressHydrationWarning>
                            {new Date(ver.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                          {ver.change_summary || "Revision snapshot"}
                        </p>

                        {!isCurrent && (
                          <div className="pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isRestoring}
                              onClick={() => handleRestoreVersion(ver.version)}
                              className="h-6 text-[11px] px-2 gap-1 font-mono"
                            >
                              <Icon icon="tabler:rotate-clockwise" className="h-3 w-3" />
                              Restore as New Version
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* TAB 4: USAGE */}
              <TabsContent value="usage" className="space-y-3 pt-3">
                <div className="flex items-center justify-between text-xs font-mono border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Referenced QR Codes</span>
                  <span className="font-bold text-foreground">
                    {usage?.totalQrCount || 0}
                  </span>
                </div>

                {usage?.qrCodes && usage.qrCodes.length > 0 ? (
                  <div className="space-y-2">
                    {usage.qrCodes.map((qr) => (
                      <div
                        key={qr.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 p-2.5 text-xs bg-card/40"
                      >
                        <div>
                          <span className="font-medium text-foreground block">{qr.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            /s/{qr.slug}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground" suppressHydrationWarning>
                          {new Date(qr.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-4 text-center">
                    No active QR codes are currently linked to this template.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
