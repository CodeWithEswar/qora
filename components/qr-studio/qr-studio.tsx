"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  QrContentV1,
  QrDesignV1,
  CANONICAL_QR_DESIGN_DEFAULTS,
  encodeQrContent,
  evaluateScanability,
  exportQrSvg,
  exportQrPdf,
  ScanabilityTargetControl,
  ScanabilityResultV1,
} from "@nxtqr/qr-core";
import { QrStudioHeader, AutosaveStatus } from "./qr-studio-header";
import { ContentPanel } from "./content/content-panel";
import { PreviewWorkspace } from "./preview/preview-workspace";
import { DesignInspector } from "./design/design-inspector";
import { VersionHistorySheet, VersionItem } from "./versions/version-history-sheet";
import { ExportDialog } from "./export/export-dialog";
import { PublishDialog } from "./publish/publish-dialog";
import { StudioLoadingSkeleton } from "./states/studio-loading";
import { StudioError } from "./states/studio-error";
import { StudioEmpty } from "./states/studio-empty";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, Save, Download, Send } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { buildQrResolverUrl } from "@nxtqr/config";
import { useSearchParams } from "next/navigation";

interface QrStudioProps {
  orgSlug: string;
  qrId?: string;
}

export function QrStudio({ orgSlug, qrId }: QrStudioProps) {
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get("templateId");

  // 1. Core State
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [activeQrId, setActiveQrId] = React.useState<string | null>(qrId || null);
  const [qrName, setQrName] = React.useState("Untitled QR Asset");
  const [qrSlug, setQrSlug] = React.useState("");
  const [status, setStatus] = React.useState("DRAFT");
  const [isDynamic, setIsDynamic] = React.useState(false);

  const [content, setContent] = React.useState<QrContentV1>({
    type: "url",
    url: "",
    isDynamic: false,
  });
  const [design, setDesign] = React.useState<QrDesignV1>(CANONICAL_QR_DESIGN_DEFAULTS);

  // 2. Concurrency & Versioning
  const [draftVersion, setDraftVersion] = React.useState(1);
  const [versionNumber, setVersionNumber] = React.useState(1);
  const [versions, setVersions] = React.useState<VersionItem[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = React.useState(false);

  // 3. Autosave Engine (Rules 57-61)
  const [isDirty, setIsDirty] = React.useState(false);
  const [autosaveStatus, setAutosaveStatus] = React.useState<AutosaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const autosaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // 4. Modal Triggers & Focused Inspector Control
  const [focusedTarget, setFocusedTarget] = React.useState<string | null>(null);
  const [isFullscreenPreviewOpen, setIsFullscreenPreviewOpen] = React.useState(false);
  const [isVersionsSheetOpen, setIsVersionsSheetOpen] = React.useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);
  const [exportInitialFormat, setExportInitialFormat] = React.useState<"svg" | "png" | "pdf">("svg");
  const [isPublishDialogOpen, setIsPublishDialogOpen] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [isSavingVersion, setIsSavingVersion] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  // Mobile active tab
  const [mobileTab, setMobileTab] = React.useState<"content" | "design">("content");

  // Load Real Data from D1 (Rules 0 & 1)
  const fetchStudioData = React.useCallback(async () => {
    if (!activeQrId) {
      if (templateIdParam) {
        try {
          const tRes = await fetch(`/api/v1/templates/${templateIdParam}`);
          if (tRes.ok) {
            const tJson = await tRes.json();
            if (tJson.data?.design_json) {
              setDesign(tJson.data.design_json);
              setQrName(`New QR (${tJson.data.name})`);
              toast.info(`Applied template design: "${tJson.data.name}"`);
            }
          }
        } catch (e) {
          console.warn("[QrStudio] Could not load template:", e);
        }
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const res = await fetch(`/api/v1/qrs/${activeQrId}/draft`);
      if (!res.ok) {
        if (res.status === 404) {
          setLoadError("The requested QR asset does not exist or has been archived.");
        } else {
          setLoadError(`Failed to load QR Studio from database (Status ${res.status}).`);
        }
        setIsLoading(false);
        return;
      }

      const json = await res.json();
      const data = json.data;

      const dynamicFlag = Boolean(data.isDynamic !== undefined ? data.isDynamic : data.content?.isDynamic);
      setQrName(data.qrName || "Untitled QR Asset");
      setQrSlug(data.slug || "");
      setStatus(data.status || "DRAFT");
      setIsDynamic(dynamicFlag);
      setDraftVersion(data.draftVersion || 1);
      if (data.content) setContent({ ...data.content, isDynamic: dynamicFlag });
      if (data.design) setDesign(data.design);
      if (data.updatedAt) {
        const d = new Date(data.updatedAt);
        setLastSavedAt(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
      setAutosaveStatus("saved");
      setIsDirty(false);
    } catch (err: any) {
      setLoadError(err.message || "Network error loading QR Studio.");
    } finally {
      setIsLoading(false);
    }
  }, [activeQrId]);

  React.useEffect(() => {
    fetchStudioData();
  }, [fetchStudioData]);

  // Load Versions List
  const fetchVersions = React.useCallback(async () => {
    if (!activeQrId) return;
    setIsLoadingVersions(true);
    try {
      const res = await fetch(`/api/v1/qrs/${activeQrId}/versions`);
      if (res.ok) {
        const json = await res.json();
        const list = json.data?.versions || [];
        setVersions(list);
        if (list.length > 0) {
          setVersionNumber(list[0].versionNumber);
        }
      }
    } catch {
      // Handled cleanly
    } finally {
      setIsLoadingVersions(false);
    }
  }, [activeQrId]);

  React.useEffect(() => {
    if (isVersionsSheetOpen) {
      fetchVersions();
    }
  }, [isVersionsSheetOpen, fetchVersions]);

  // Synchronized state refs to eliminate stale closure bugs during debounce
  const draftVersionRef = React.useRef(draftVersion);
  draftVersionRef.current = draftVersion;
  const contentRef = React.useRef(content);
  contentRef.current = content;
  const designRef = React.useRef(design);
  designRef.current = design;
  const qrNameRef = React.useRef(qrName);
  qrNameRef.current = qrName;
  const isDynamicRef = React.useRef(isDynamic);
  isDynamicRef.current = isDynamic;

  // Real Debounced Autosave to D1 (Rule 58 & 59)
  const triggerAutosave = React.useCallback(
    (
      nextContent?: QrContentV1,
      nextDesign?: QrDesignV1,
      nextName?: string,
      nextDynamic?: boolean
    ) => {
      if (!activeQrId) return;

      setIsDirty(true);
      setAutosaveStatus("unsaved");

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      const saveContent = nextContent || contentRef.current;
      const saveDesign = nextDesign || designRef.current;
      const saveName = nextName !== undefined ? nextName : qrNameRef.current;
      const saveDynamic = nextDynamic !== undefined ? nextDynamic : isDynamicRef.current;

      autosaveTimerRef.current = setTimeout(async () => {
        setAutosaveStatus("saving");
        try {
          const res = await fetch(`/api/v1/qrs/${activeQrId}/draft`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              expectedDraftVersion: draftVersionRef.current,
              name: saveName,
              isDynamic: saveDynamic,
              content: { ...saveContent, isDynamic: saveDynamic },
              design: saveDesign,
            }),
          });

          if (res.ok) {
            const json = await res.json();
            draftVersionRef.current = json.data.draftVersion;
            setDraftVersion(json.data.draftVersion);
            const d = new Date(json.data.updatedAt);
            setLastSavedAt(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
            setAutosaveStatus("saved");
            setIsDirty(false);
          } else if (res.status === 409) {
            // Concurrency sync: refresh current version from server
            const refreshRes = await fetch(`/api/v1/qrs/${activeQrId}/draft`);
            if (refreshRes.ok) {
              const freshJson = await refreshRes.json();
              draftVersionRef.current = freshJson.data.draftVersion;
              setDraftVersion(freshJson.data.draftVersion);
            }
            setAutosaveStatus("unsaved");
          } else {
            setAutosaveStatus("error");
          }
        } catch {
          setAutosaveStatus("error");
        }
      }, 1200); // 1.2s debounce
    },
    [activeQrId]
  );

  // Content change wrapper
  const handleContentChange = (next: QrContentV1) => {
    const synchronizedContent = { ...next, isDynamic };
    setContent(synchronizedContent);
    triggerAutosave(synchronizedContent, design, qrName, isDynamic);
  };

  // Design change wrapper (Updates local preview immediately! Rule 98)
  const handleDesignChange = (next: QrDesignV1) => {
    setDesign(next);
    triggerAutosave(content, next, qrName, isDynamic);
  };

  // Name change wrapper (Persists renamed QR to D1)
  const handleQrNameChange = (nextName: string) => {
    setQrName(nextName);
    triggerAutosave(content, design, nextName, isDynamic);
  };

  // Dynamic mode change wrapper (Persists dynamic routing flag to D1)
  const handleDynamicChange = (dynamic: boolean) => {
    setIsDynamic(dynamic);
    const updatedContent = { ...content, isDynamic: dynamic };
    setContent(updatedContent);
    triggerAutosave(updatedContent, design, qrName, dynamic);
  };

  // Raw string for encoder
  const rawEncodedString = React.useMemo(() => {
    // Only web-routable destinations (url, platform_link, app, file) can use the dynamic redirect resolver.
    // Plain text, Wi-Fi, and contact cards (vCard) are offline standards encoded directly into the QR matrix.
    const isDynamicCapable =
      content.type === "url" ||
      content.type === "platform_link" ||
      content.type === "app" ||
      content.type === "file";
    if (isDynamic && isDynamicCapable && qrSlug) {
      return buildQrResolverUrl(qrSlug);
    }
    return encodeQrContent(content);
  }, [isDynamic, qrSlug, content]);

  // Deterministic scanability
  const scanability = React.useMemo(() => {
    return evaluateScanability(rawEncodedString, design);
  }, [rawEncodedString, design]);

  // Jump to Inspector Control (Rule 50)
  const handleJumpToControl = React.useCallback((target: ScanabilityTargetControl) => {
    setFocusedTarget(null);
    setTimeout(() => setFocusedTarget(target), 20);
    if (target.startsWith("design.")) {
      setMobileTab("design");
    } else if (target.startsWith("content.")) {
      setMobileTab("content");
    }
  }, []);

  // Apply Deterministic Recommended Fix (Rule 52)
  const handleApplySuggestedFix = React.useCallback(
    (fixValue: any, targetControl?: ScanabilityTargetControl) => {
      if (targetControl === "design.colors" && fixValue) {
        handleDesignChange({
          ...design,
          fgColor: fixValue.fgColor || design.fgColor,
          bgColor: fixValue.bgColor || design.bgColor,
        });
        toast.success("Applied recommended contrast colors.");
      } else if (targetControl === "design.quietZone" && typeof fixValue === "number") {
        handleDesignChange({
          ...design,
          quietZone: fixValue,
        });
        toast.success(`Set quiet zone to ${fixValue} modules.`);
      } else if (targetControl === "design.logo.size" && fixValue?.scale) {
        handleDesignChange({
          ...design,
          logo: design.logo ? { ...design.logo, scale: fixValue.scale } : undefined,
        });
        toast.success("Adjusted logo scale to safe operational threshold.");
      } else if (targetControl === "design.errorCorrection" && typeof fixValue === "string") {
        handleDesignChange({
          ...design,
          errorCorrection: fixValue as "L" | "M" | "Q" | "H",
        });
        toast.success(`Upgraded error correction to Level ${fixValue}.`);
      }
    },
    [design, handleDesignChange]
  );

  // Save Immutable Version Checkpoint (Rules 54-56, 63)
  const handleSaveVersion = async () => {
    if (!activeQrId) return;
    setIsSavingVersion(true);
    try {
      const res = await fetch(`/api/v1/qrs/${activeQrId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changeSummary: `Version checkpoint created at ${new Date().toLocaleTimeString()}`,
          content,
          design,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setVersionNumber(json.data.versionNumber);
        toast.success(`Immutable Version v${json.data.versionNumber} checkpoint created.`);
        fetchVersions();
      } else {
        toast.error("Failed to save version checkpoint.");
      }
    } catch {
      toast.error("Network error while saving version.");
    } finally {
      setIsSavingVersion(false);
    }
  };

  // Restore Version as New Draft (Rule 67)
  const handleRestoreVersion = async (targetVer: number) => {
    if (!activeQrId) return;
    try {
      const res = await fetch(`/api/v1/qrs/${activeQrId}/versions/${targetVer}/restore`, {
        method: "POST",
      });

      if (res.ok) {
        const json = await res.json();
        setContent(json.data.content);
        setDesign(json.data.design);
        setDraftVersion(json.data.newDraftVersion);
        toast.success(`Restored v${targetVer} into a new working draft.`);
        setIsDirty(false);
      } else {
        toast.error("Failed to restore version.");
      }
    } catch {
      toast.error("Network error restoring version.");
    }
  };

  // Publish to Production Edge (Rules 70-72)
  const handlePublish = async (summary: string) => {
    if (!activeQrId) return;
    setIsPublishing(true);
    try {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        await fetch(`/api/v1/qrs/${activeQrId}/draft`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expectedDraftVersion: draftVersionRef.current,
            name: qrNameRef.current,
            isDynamic: isDynamicRef.current,
            content: { ...contentRef.current, isDynamic: isDynamicRef.current },
            design: designRef.current,
          }),
        });
      }

      const res = await fetch(`/api/v1/qrs/${activeQrId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changeSummary: summary,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setStatus("ACTIVE");
        setVersionNumber(json.data.publishedVersion || versionNumber);
        toast.success("QR successfully published and deployed to Edge resolvers!");
      } else {
        const errJson = await res.json().catch(() => ({}));
        toast.error(errJson?.error?.message || "Failed to publish QR to edge.");
      }
    } catch {
      toast.error("Network error publishing QR.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Real Binary Exports (Rules 76-85)
  const handleTriggerExport = async (format: "svg" | "png" | "pdf", presetId?: string, size = 1024) => {
    setIsExporting(true);
    try {
      const baseFileName = `nxtqr-${qrSlug || "asset"}`;

      if (format === "svg") {
        const { svgString, fileName } = exportQrSvg({
          content: rawEncodedString,
          design,
          moduleSize: 16,
          fileName: baseFileName,
        });

        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${fileName}`);
      } else if (format === "pdf") {
        const { pdfBuffer, fileName } = exportQrPdf({
          content: rawEncodedString,
          design,
          presetId: presetId || "sticker",
          fileName: baseFileName,
        });

        const blob = new Blob([pdfBuffer as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${fileName}`);
      } else if (format === "png") {
        // High-resolution Canvas Rasterization
        const { svgString, fileName } = exportQrSvg({
          content: rawEncodedString,
          design,
          moduleSize: 20,
          fileName: baseFileName,
        });

        const img = new Image();
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, size, size);
            canvas.toBlob((blob) => {
              if (blob) {
                const pngUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = pngUrl;
                a.download = `${baseFileName}.png`;
                a.click();
                URL.revokeObjectURL(pngUrl);
                toast.success(`Exported ${baseFileName}.png (${size}x${size})`);
              }
            }, "image/png");
          }
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }
    } catch {
      toast.error("Failed to generate export file.");
    } finally {
      setIsExporting(false);
    }
  };

  // State guards
  if (isLoading) {
    return <StudioLoadingSkeleton />;
  }

  if (loadError) {
    return <StudioError message={loadError} onRetry={fetchStudioData} orgSlug={orgSlug} />;
  }

  if (!activeQrId) {
    return <StudioEmpty orgSlug={orgSlug} />;
  }

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-3.5rem)] pb-16 lg:pb-8">
      {/* 1. Flagship Topbar Header */}
      <QrStudioHeader
        orgSlug={orgSlug}
        qrName={qrName}
        onQrNameChange={handleQrNameChange}
        status={status}
        autosaveStatus={autosaveStatus}
        lastSavedAt={lastSavedAt}
        versionNumber={versionNumber}
        isDirty={isDirty}
        onOpenPreview={() => setIsFullscreenPreviewOpen(true)}
        onOpenVersions={() => setIsVersionsSheetOpen(true)}
        onOpenExport={(fmt) => {
          if (fmt) setExportInitialFormat(fmt);
          setIsExportDialogOpen(true);
        }}
        onSaveVersion={handleSaveVersion}
        onOpenPublish={() => setIsPublishDialogOpen(true)}
        isPublishing={isPublishing}
        isSavingVersion={isSavingVersion}
      />

      {/* 2. Workspace Body: Desktop 3-Column Layout vs Mobile Tabbed Layout */}
      <div className="w-full p-4 sm:p-6 flex-1">
        {/* =========================================================================
            DESKTOP VIEW: 3-Column Designer Workspace (Rules 4, 102)
           ========================================================================= */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 xl:gap-6 items-start">
          {/* Left Column: Content & Destinations */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            <ContentPanel
              content={content}
              onChange={handleContentChange}
              orgSlug={orgSlug}
              isDynamic={isDynamic}
              onDynamicChange={handleDynamicChange}
              shortSlug={qrSlug}
            />
          </div>

          {/* Center Column: Live Vector Preview & Signal Integrity Map */}
          <div className="lg:col-span-4 xl:col-span-6 space-y-4">
            <PreviewWorkspace
              rawContent={rawEncodedString}
              design={design}
              isFullscreenOpen={isFullscreenPreviewOpen}
              onCloseFullscreen={() => setIsFullscreenPreviewOpen(false)}
              onOpenFullscreen={() => setIsFullscreenPreviewOpen(true)}
              onJumpToControl={handleJumpToControl}
              onApplyFix={handleApplySuggestedFix}
            />
          </div>

          {/* Right Column: Design Inspector */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            <DesignInspector
              design={design}
              onChange={handleDesignChange}
              orgSlug={orgSlug}
              focusedTarget={focusedTarget}
            />
          </div>
        </div>

        {/* =========================================================================
            MOBILE & TABLET VIEW: Preview + Tabbed Inspectors (Rules 100, 101)
           ========================================================================= */}
        <div className="lg:hidden space-y-4">
          {/* Preview at top */}
          <PreviewWorkspace
            rawContent={rawEncodedString}
            design={design}
            isFullscreenOpen={isFullscreenPreviewOpen}
            onCloseFullscreen={() => setIsFullscreenPreviewOpen(false)}
            onOpenFullscreen={() => setIsFullscreenPreviewOpen(true)}
            onJumpToControl={handleJumpToControl}
            onApplyFix={handleApplySuggestedFix}
          />

          {/* Mobile Tabs: Content vs Design */}
          <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-2 w-full h-9">
              <TabsTrigger value="content" className="text-xs font-semibold">
                1. Content & Type
              </TabsTrigger>
              <TabsTrigger value="design" className="text-xs font-semibold">
                2. Design & Style
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-3">
              <ContentPanel
                content={content}
                onChange={handleContentChange}
                orgSlug={orgSlug}
                isDynamic={isDynamic}
                onDynamicChange={handleDynamicChange}
                shortSlug={qrSlug}
              />
            </TabsContent>

            <TabsContent value="design" className="mt-3">
              <DesignInspector
                design={design}
                onChange={handleDesignChange}
                orgSlug={orgSlug}
                focusedTarget={focusedTarget}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 3. Sticky Bottom Mobile Action Bar (Rule 100) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-surface/95 backdrop-blur-md p-2.5 flex items-center justify-between gap-2 shadow-lg">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreenPreviewOpen(true)}
          className="h-9 flex-1 gap-1 text-xs"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Preview</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExportDialogOpen(true)}
          className="h-9 flex-1 gap-1 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </Button>
        <Button
          size="sm"
          onClick={() => setIsPublishDialogOpen(true)}
          className="h-9 flex-1 gap-1 text-xs bg-primary hover:bg-[#cc3a05] text-white"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Publish</span>
        </Button>
      </div>

      {/* 4. Modals & Sheets */}
      <VersionHistorySheet
        isOpen={isVersionsSheetOpen}
        onClose={() => setIsVersionsSheetOpen(false)}
        qrId={activeQrId}
        versions={versions}
        isLoading={isLoadingVersions}
        onRestoreVersion={handleRestoreVersion}
      />

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        qrId={activeQrId}
        content={rawEncodedString}
        design={design}
        initialFormat={exportInitialFormat}
        onTriggerExport={handleTriggerExport}
        isExporting={isExporting}
      />

      <PublishDialog
        isOpen={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        qrName={qrName}
        slug={qrSlug}
        destinationUrl={content.type === "url" ? content.url : "Dynamic Routing"}
        isDynamic={isDynamic}
        scanability={scanability}
        onConfirmPublish={handlePublish}
        isPublishing={isPublishing}
      />
    </div>
  );
}
