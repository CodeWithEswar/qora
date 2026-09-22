"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  QrDesignV1,
  CANONICAL_QR_DESIGN_DEFAULTS,
  renderQrSvg,
  evaluateScanability,
} from "@nxtqr/qr-core";
import {
  QrTemplateDetail,
  CreateTemplateInput,
} from "@/lib/domains/templates/types";
import { SUPPORTED_COMPATIBILITY_TYPES } from "@/lib/domains/templates/compatibility";
import { SUPPORTED_LOCKED_FIELDS } from "@/lib/domains/templates/governance";
import { DesignInspector } from "@/components/qr-studio/design/design-inspector";
import { ThemeSwitcher } from "@/components/shell/theme-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

interface TemplateForgeProps {
  orgSlug: string;
  brandKits?: Array<{
    id: string;
    name: string;
    primary_color?: string;
    logo_url?: string;
  }>;
  existingTemplate?: QrTemplateDetail | null;
}

export function TemplateForge({
  orgSlug,
  brandKits = [],
  existingTemplate = null,
}: TemplateForgeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = Boolean(existingTemplate);

  // 1. Template Identity & Governance
  const [name, setName] = useState(existingTemplate?.name || "");
  const [description, setDescription] = useState(existingTemplate?.description || "");
  const [brandKitId, setBrandKitId] = useState<string>(
    existingTemplate?.brand_kit_id || searchParams.get("brandKitId") || "none"
  );
  const [compatibility, setCompatibility] = useState<string[]>(
    existingTemplate?.compatibility || ["UNIVERSAL"]
  );
  const [isBrandLocked, setIsBrandLocked] = useState(
    existingTemplate?.is_brand_locked ?? false
  );
  const [lockedFields, setLockedFields] = useState<string[]>(
    existingTemplate?.locked_fields || ["colors", "logo"]
  );

  // 2. Active Design Configuration
  const [design, setDesign] = useState<QrDesignV1>(
    existingTemplate?.design_json || CANONICAL_QR_DESIGN_DEFAULTS
  );

  // 3. Canvas Environment
  const [surface, setSurface] = useState<"light" | "cream" | "dark">("light");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 4. Mobile Responsiveness State
  const [mobileTab, setMobileTab] = useState<"governance" | "design">("governance");
  const [isMobilePreviewExpanded, setIsMobilePreviewExpanded] = useState(true);
  const [isFullscreenPreviewOpen, setIsFullscreenPreviewOpen] = useState(false);

  // Track changes
  const handleDesignChange = (nextDesign: QrDesignV1) => {
    setDesign(nextDesign);
    setHasUnsavedChanges(true);
  };

  // Inherit Brand Kit if selected
  const handleBrandKitChange = (id: string) => {
    setBrandKitId(id);
    setHasUnsavedChanges(true);

    if (id !== "none") {
      const bk = brandKits.find((b) => b.id === id);
      if (bk?.primary_color) {
        setDesign((prev) => ({
          ...prev,
          fgColor: bk.primary_color!,
        }));
        toast.info(`Inherited primary brand color ${bk.primary_color} from "${bk.name}"`);
      }
    }
  };

  const toggleCompatibilityType = (typeKey: string) => {
    setHasUnsavedChanges(true);
    if (typeKey === "UNIVERSAL") {
      setCompatibility(["UNIVERSAL"]);
      return;
    }

    setCompatibility((prev) => {
      const withoutUniversal = prev.filter((k) => k !== "UNIVERSAL");
      if (withoutUniversal.includes(typeKey)) {
        const next = withoutUniversal.filter((k) => k !== typeKey);
        return next.length > 0 ? next : ["UNIVERSAL"];
      } else {
        return [...withoutUniversal, typeKey];
      }
    });
  };

  const toggleLockedField = (fieldKey: string) => {
    setHasUnsavedChanges(true);
    setLockedFields((prev) =>
      prev.includes(fieldKey) ? prev.filter((f) => f !== fieldKey) : [...prev, fieldKey]
    );
  };

  // Pure mathematical scanability evaluation
  const scanResult = useMemo(() => {
    return evaluateScanability("https://nxtqr.vercel.app/preview", design);
  }, [design]);

  // Deterministic SVG rendering
  const svgPreview = useMemo(() => {
    try {
      return renderQrSvg({
        content: "https://nxtqr.vercel.app/preview",
        design,
        moduleSize: 10,
      });
    } catch {
      return `<svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#f4f4f5" /><text x="100" y="100" text-anchor="middle" font-size="12" fill="#71717a">Rendering...</text></svg>`;
    }
  }, [design]);

  // Save Pipeline
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please provide a name for this template.");
      return;
    }

    try {
      setSaveStatus("saving");

      const payload: CreateTemplateInput = {
        name: name.trim(),
        description: description.trim() || undefined,
        brand_kit_id: brandKitId !== "none" ? brandKitId : null,
        compatibility,
        is_brand_locked: isBrandLocked,
        locked_fields: isBrandLocked ? lockedFields : [],
        design,
        change_summary: isEditing
          ? `Updated in Template Forge (v${(existingTemplate?.current_version || 1) + 1})`
          : "Initial creation in Template Forge",
      };

      const url = isEditing && existingTemplate
        ? `/api/v1/templates/${existingTemplate.id}`
        : `/api/v1/templates`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to persist template");
      }

      setSaveStatus("saved");
      setHasUnsavedChanges(false);
      toast.success(
        isEditing
          ? `Template "${name}" updated (v${data.data.current_version})`
          : `Template "${name}" created successfully`
      );

      // Navigate back to library
      router.push(`/${orgSlug}/templates`);
    } catch (err: unknown) {
      setSaveStatus("error");
      toast.error(err instanceof Error ? err.message : "Failed to persist template");
    }
  };

  // Reusable Surface Switcher
  const renderSurfaceSwitcher = () => (
    <div className="flex items-center gap-0.5 bg-background/60 p-0.5 rounded-md border border-border/50 text-[11px] font-mono">
      <button
        type="button"
        onClick={() => setSurface("light")}
        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
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
        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
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
        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
          surface === "dark"
            ? "bg-[#111111] text-white shadow-xs font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Dark
      </button>
    </div>
  );

  // Reusable Specimen Physical Board
  const renderSpecimenBoard = (sizeClass = "w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 xl:w-64 xl:h-64 max-h-[35vh] max-w-[35vh]") => (
    <div
      className={`relative flex items-center justify-center p-4 sm:p-6 md:p-8 rounded-2xl border transition-all shadow-md shrink-0 aspect-square ${
        surface === "light"
          ? "bg-white border-zinc-200"
          : surface === "cream"
          ? "bg-[#FFF8E0] border-[#E6D5A8]"
          : "bg-[#141414] border-zinc-800"
      }`}
    >
      {/* Corner crosshairs */}
      <div className="absolute top-2.5 left-2.5 text-zinc-400/60 pointer-events-none">
        <Icon icon="tabler:plus" className="h-3 w-3" />
      </div>
      <div className="absolute top-2.5 right-2.5 text-zinc-400/60 pointer-events-none">
        <Icon icon="tabler:plus" className="h-3 w-3" />
      </div>
      <div className="absolute bottom-2.5 left-2.5 text-zinc-400/60 pointer-events-none">
        <Icon icon="tabler:plus" className="h-3 w-3" />
      </div>
      <div className="absolute bottom-2.5 right-2.5 text-zinc-400/60 pointer-events-none">
        <Icon icon="tabler:plus" className="h-3 w-3" />
      </div>

      {/* Crisp Vector Render */}
      <div
        className={`${sizeClass} aspect-square flex items-center justify-center drop-shadow-sm [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full`}
        dangerouslySetInnerHTML={{ __html: svgPreview }}
      />
    </div>
  );

  // Reusable Governance Form Controls
  const renderGovernanceForm = () => (
    <div className="space-y-5 pb-6 text-xs">
      {/* Template Name & Description */}
      <div className="space-y-1.5">
        <Label htmlFor="forge-name" className="text-xs">
          Template Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="forge-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setHasUnsavedChanges(true);
          }}
          placeholder="e.g. Ember Standard Product"
          className="text-xs h-8"
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="forge-desc" className="text-xs">
          Description
        </Label>
        <Textarea
          id="forge-desc"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setHasUnsavedChanges(true);
          }}
          placeholder="Governed QR identity for product packaging and marketing materials..."
          className="text-xs resize-none h-16"
          maxLength={500}
        />
      </div>

      {/* Brand Kit Selector */}
      <div className="space-y-1.5">
        <Label htmlFor="forge-bk" className="text-xs">
          Inherit from Brand Kit
        </Label>
        <Select value={brandKitId} onValueChange={handleBrandKitChange}>
          <SelectTrigger id="forge-bk" className="text-xs h-8">
            <SelectValue placeholder="No Brand Kit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Platform Standard (No Kit)</SelectItem>
            {brandKits.map((bk) => (
              <SelectItem key={bk.id} value={bk.id}>
                {bk.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">
          Inherit corporate palette tokens, primary logo assets, and design constraints.
        </p>
      </div>

      {/* QR Payload Compatibility */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <Label className="text-xs block">Payload Compatibility</Label>
        <div className="flex flex-wrap gap-1.5">
          {SUPPORTED_COMPATIBILITY_TYPES.map((type) => {
            const isSelected =
              compatibility.includes("UNIVERSAL") ||
              compatibility.includes(type.key);

            return (
              <button
                key={type.key}
                type="button"
                onClick={() => toggleCompatibilityType(type.key)}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-mono border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-primary/50 text-primary font-semibold"
                    : "bg-muted/30 border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon icon={type.icon} className="h-3 w-3" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Governance & Locks */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="forge-lock" className="text-xs font-medium cursor-pointer">
              Brand Lock
            </Label>
            <p className="text-[10px] text-muted-foreground">
              Prevent downstream QR creators from altering locked fields.
            </p>
          </div>
          <Switch
            id="forge-lock"
            checked={isBrandLocked}
            onCheckedChange={(c) => {
              setIsBrandLocked(c);
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        {isBrandLocked && (
          <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5">
            <span className="font-mono text-[10px] uppercase font-semibold text-amber-500 block">
              Locked Fields
            </span>
            <div className="space-y-1.5">
              {SUPPORTED_LOCKED_FIELDS.map((field) => {
                const isLocked = lockedFields.includes(field.key);
                return (
                  <label
                    key={field.key}
                    className="flex items-center gap-2 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={isLocked}
                      onChange={() => toggleLockedField(field.key)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-foreground">{field.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 h-full w-full min-h-0 overflow-hidden">
      {/* 1. Header Toolbar (Mobile & Desktop Adaptive) */}
      <div className="flex items-center justify-between border-b border-border/80 px-3 sm:px-6 py-2 bg-card/60 backdrop-blur-md shrink-0 h-13 sm:h-14">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("nxtqr:open-mobile-sidebar"))}
            className="inline-flex md:hidden h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Icon icon="lucide:menu" className="h-4 w-4" />
          </button>

          <Button asChild variant="ghost" size="sm" className="h-8 px-2 sm:px-3 gap-1 text-xs shrink-0">
            <Link href={`/${orgSlug}/templates`}>
              <Icon icon="tabler:arrow-left" className="h-4 w-4" />
              <span className="hidden sm:inline">Templates Library</span>
            </Link>
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="min-w-0">
            <span className="font-mono text-[9px] sm:text-[10px] uppercase font-semibold text-primary block leading-none truncate">
              {isEditing ? `Editing v${existingTemplate?.current_version}` : "Template Forge"}
            </span>
            <span className="font-serif font-medium text-xs sm:text-sm text-foreground truncate max-w-[110px] xs:max-w-[160px] sm:max-w-none block">
              {name.trim() || "Untitled Design Template"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {hasUnsavedChanges && (
            <span className="hidden md:inline-flex font-mono text-[11px] text-amber-500 items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes
            </span>
          )}

          <ThemeSwitcher />

          <Button
            onClick={handleSave}
            disabled={saveStatus === "saving" || !name.trim()}
            size="sm"
            className="h-8 px-2.5 sm:px-3 gap-1.5 text-xs font-medium shrink-0"
          >
            {saveStatus === "saving" ? (
              <Icon icon="tabler:loader" className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Icon icon="tabler:device-floppy" className="h-3.5 w-3.5" />
            )}
            <span className="hidden xs:inline">{isEditing ? "Update" : "Save"}</span>
            <span className="hidden sm:inline">Template</span>
          </Button>
        </div>
      </div>

      {/* =========================================================================
          DESKTOP VIEW (hidden lg:grid): 3-Column Studio Workstation
         ========================================================================= */}
      <div className="hidden lg:grid flex-1 min-h-0 lg:grid-cols-12 lg:grid-rows-1 h-full overflow-hidden bg-background">
        {/* COLUMN 1: Design System & Governance (3 cols) */}
        <div className="lg:col-span-3 lg:row-span-1 border-r border-border/70 flex flex-col h-full min-h-0 overflow-hidden bg-card/20">
          <div className="h-12 px-4 border-b border-border/60 bg-muted/20 flex items-center justify-between shrink-0">
            <h2 className="font-serif text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon icon="tabler:adjustments-horizontal" className="h-4 w-4 text-primary" />
              System Identity & Governance
            </h2>
            <span className="font-mono text-[10px] text-muted-foreground uppercase font-medium tracking-wider">
              PANEL 01
            </span>
          </div>

          <ScrollArea className="flex-1 min-h-0 h-full p-4">
            {renderGovernanceForm()}
          </ScrollArea>
        </div>

        {/* COLUMN 2: Live QR Specimen Canvas (5 cols) */}
        <div className="lg:col-span-5 lg:row-span-1 border-r border-border/70 flex flex-col h-full min-h-0 bg-gradient-to-b from-muted/5 via-background to-muted/10 overflow-hidden">
          {/* Surface & Canvas Controls */}
          <div className="h-12 px-4 border-b border-border/60 bg-muted/20 flex items-center justify-between shrink-0">
            <span className="font-mono text-xs uppercase font-semibold text-muted-foreground flex items-center gap-2">
              <Icon icon="tabler:eye" className="h-3.5 w-3.5 text-primary" />
              Live Specimen View
            </span>

            {renderSurfaceSwitcher()}
          </div>

          {/* Canvas Center */}
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {/* Architectural Alignment Guides */}
            <div className="absolute top-4 left-4 text-border/60 font-mono text-[10px] select-none">
              NXTQR · SPECIMEN 01
            </div>
            <div className="absolute bottom-4 left-4 text-border/60 font-mono text-[10px] select-none">
              PAYLOAD · PREVIEW
            </div>
            <div className="absolute bottom-4 right-4 text-border/60 font-mono text-[10px] select-none">
              RES: 1000×1000
            </div>

            {renderSpecimenBoard()}
          </div>

          {/* Bottom Live Scanability Diagnostic Rail */}
          <div className="mt-auto p-3 sm:p-3.5 border-t border-border/70 bg-card/40 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase font-semibold text-foreground">
                  Scanability Score:
                </span>
                <span
                  className={`font-mono text-xs font-bold ${
                    scanResult.score && scanResult.score >= 80
                      ? "text-emerald-500"
                      : "text-amber-500"
                  }`}
                >
                  {scanResult.score ?? 100}% ({scanResult.status.toUpperCase()})
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                Level {design.errorCorrection} Reed-Solomon
              </span>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Design Controls Inspector (4 cols) */}
        <div className="lg:col-span-4 lg:row-span-1 flex flex-col h-full min-h-0 overflow-hidden bg-card/20">
          <div className="h-12 px-4 border-b border-border/60 bg-muted/20 flex items-center justify-between shrink-0">
            <h2 className="font-serif text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon icon="tabler:palette" className="h-4 w-4 text-primary" />
              Design Parameters
            </h2>
            <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-border/70 text-muted-foreground">
              SCHEMA V1
            </Badge>
          </div>

          <ScrollArea className="flex-1 min-h-0 h-full">
            <div className="p-2 sm:p-4 pb-8">
              <DesignInspector
                design={design}
                onChange={handleDesignChange}
                orgSlug={orgSlug}
              />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* =========================================================================
          MOBILE & TABLET VIEW (lg:hidden): Dedicated Responsive Studio
         ========================================================================= */}
      <div className="lg:hidden flex flex-col flex-1 min-h-0 h-full overflow-hidden bg-background">
        {/* 1. Mobile Live Specimen Header Card */}
        <div className="border-b border-border/70 bg-card/40 shrink-0">
          <div className="px-3 py-2 flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[11px] uppercase font-bold text-foreground flex items-center gap-1.5 truncate">
                <Icon icon="tabler:eye" className="h-3.5 w-3.5 text-primary shrink-0" />
                Live Specimen
              </span>
              <span
                className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                  scanResult.score && scanResult.score >= 80
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
                    : "text-amber-500 bg-amber-500/10 border-amber-500/30"
                }`}
              >
                {scanResult.score ?? 100}% {scanResult.status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {renderSurfaceSwitcher()}

              {/* Toggle expand/collapse */}
              <button
                type="button"
                onClick={() => setIsMobilePreviewExpanded(!isMobilePreviewExpanded)}
                className="h-7 w-7 rounded border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                title={isMobilePreviewExpanded ? "Collapse preview" : "Expand preview"}
              >
                <Icon
                  icon={isMobilePreviewExpanded ? "tabler:chevron-up" : "tabler:chevron-down"}
                  className="h-3.5 w-3.5"
                />
              </button>
            </div>
          </div>

          {/* Collapsible Canvas Center */}
          {isMobilePreviewExpanded && (
            <div className="p-3 flex items-center justify-center bg-gradient-to-b from-muted/5 via-background to-muted/10 relative">
              <div className="absolute top-2 left-3 text-border/60 font-mono text-[9px] select-none">
                NXTQR · SPECIMEN 01
              </div>
              <div className="absolute bottom-2 right-3 text-border/60 font-mono text-[9px] select-none">
                Level {design.errorCorrection} RS
              </div>

              {renderSpecimenBoard("w-36 h-36 xs:w-40 xs:h-40 sm:w-44 sm:h-44")}
            </div>
          )}
        </div>

        {/* 2. Mobile Tabs */}
        <Tabs
          value={mobileTab}
          onValueChange={(v) => setMobileTab(v as any)}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="px-3 py-1.5 border-b border-border/60 bg-muted/20 shrink-0">
            <TabsList className="grid grid-cols-2 w-full h-8 text-xs">
              <TabsTrigger value="governance" className="gap-1.5 text-xs font-semibold cursor-pointer">
                <Icon icon="tabler:adjustments-horizontal" className="h-3.5 w-3.5 text-primary" />
                <span>1. Governance</span>
              </TabsTrigger>
              <TabsTrigger value="design" className="gap-1.5 text-xs font-semibold cursor-pointer">
                <Icon icon="tabler:palette" className="h-3.5 w-3.5 text-primary" />
                <span>2. Design & Style</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="governance" className="flex-1 flex flex-col min-h-0 m-0 data-[state=inactive]:hidden overflow-hidden">
            <ScrollArea className="flex-1 min-h-0 h-full">
              <div className="p-3 sm:p-4 pb-4">
                {renderGovernanceForm()}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="design" className="flex-1 flex flex-col min-h-0 m-0 data-[state=inactive]:hidden overflow-hidden">
            <ScrollArea className="flex-1 min-h-0 h-full">
              <div className="p-3 pb-4">
                <DesignInspector
                  design={design}
                  onChange={handleDesignChange}
                  orgSlug={orgSlug}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* 3. Sticky Bottom Mobile Action Bar */}
        <div className="border-t border-border/80 bg-card/95 backdrop-blur-md px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-2 shrink-0 z-20 shadow-lg">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreenPreviewOpen(true)}
            className="h-8 gap-1.5 text-xs flex-1 border-border/70"
          >
            <Icon icon="tabler:arrows-maximize" className="h-3.5 w-3.5" />
            <span>Full Specimen</span>
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saveStatus === "saving" || !name.trim()}
            size="sm"
            className="h-8 gap-1.5 text-xs flex-1 font-semibold bg-primary hover:bg-primary/90 text-white shadow-xs"
          >
            {saveStatus === "saving" ? (
              <Icon icon="tabler:loader" className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Icon icon="tabler:device-floppy" className="h-3.5 w-3.5" />
            )}
            <span>{isEditing ? "Update" : "Save"}</span>
          </Button>
        </div>
      </div>

      {/* 3. Fullscreen Specimen Preview Modal (Mobile & Tablet) */}
      <Dialog open={isFullscreenPreviewOpen} onOpenChange={setIsFullscreenPreviewOpen}>
        <DialogContent className="sm:max-w-md p-4 sm:p-6 bg-card border-border">
          <DialogHeader className="pb-2 border-b border-border/60">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon icon="tabler:scan" className="h-4 w-4 text-primary" />
                Live Specimen Preview
              </DialogTitle>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                  scanResult.score && scanResult.score >= 80
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
                    : "text-amber-500 bg-amber-500/10 border-amber-500/30"
                }`}
              >
                {scanResult.score ?? 100}% {scanResult.status.toUpperCase()}
              </span>
            </div>
          </DialogHeader>

          <div className="py-4 flex flex-col items-center justify-center gap-4">
            {renderSpecimenBoard("w-56 h-56 xs:w-64 xs:h-64 sm:w-72 sm:h-72")}

            {/* Surface switcher in modal */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60 text-xs font-mono">
              <button
                type="button"
                onClick={() => setSurface("light")}
                className={`px-3 py-1 rounded transition-colors ${
                  surface === "light"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Light Surface
              </button>
              <button
                type="button"
                onClick={() => setSurface("cream")}
                className={`px-3 py-1 rounded transition-colors ${
                  surface === "cream"
                    ? "bg-[#FFF8E0] text-[#1F1F1F] shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Cream Surface
              </button>
              <button
                type="button"
                onClick={() => setSurface("dark")}
                className={`px-3 py-1 rounded transition-colors ${
                  surface === "dark"
                    ? "bg-[#111111] text-white shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dark Surface
              </button>
            </div>

            <div className="w-full text-center text-[11px] font-mono text-muted-foreground">
              Level {design.errorCorrection} Reed-Solomon · Schema v1
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
