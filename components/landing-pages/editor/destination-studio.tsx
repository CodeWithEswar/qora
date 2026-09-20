"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type {
  LandingPageRecord,
  LandingPageDocumentV1,
  LandingPageBlockV1,
  LandingPageBlockType,
  LandingPageThemePresetName,
} from "@nxtqr/contracts";
import { THEME_PRESET_DEFINITIONS } from "@nxtqr/contracts";
import { EditorHeader, type SaveStatus } from "./editor-header";
import { StructurePanel } from "./structure-panel";
import { DeviceCanvas } from "./device-canvas";
import { InspectorPanel } from "./inspector-panel";
import { PublishReviewDialog } from "./publish-review-dialog";
import { PagePreviewDialog } from "./page-preview-dialog";
import { StudioCommandPalette } from "./studio-command-palette";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { toast } from "sonner";

interface DestinationStudioProps {
  page: LandingPageRecord;
  initialDraft: LandingPageDocumentV1;
  orgSlug: string;
}

export function DestinationStudio({
  page: initialPage,
  initialDraft,
  orgSlug,
}: DestinationStudioProps) {
  const [page, setPage] = useState<LandingPageRecord>(initialPage);
  const [document, setDocument] = useState<LandingPageDocumentV1>(initialDraft);
  const [draftVersion, setDraftVersion] = useState<number>(initialPage.draftVersion || 1);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    initialDraft.blocks?.[0]?.id || null
  );
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">("phone");
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Dialog states
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<"blocks" | "inspector" | null>(null);

  // Debounced autosave ref
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestDocRef = useRef(document);
  latestDocRef.current = document;
  const draftVersionRef = useRef(draftVersion);
  draftVersionRef.current = draftVersion;

  // Real Server Autosave
  const performSave = useCallback(async () => {
    try {
      setSaveStatus("saving");

      const res = await fetch(`/api/v1/landing-pages/${page.id}/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedDraftVersion: draftVersionRef.current,
          document: latestDocRef.current,
        }),
      });

      if (res.status === 409) {
        setSaveStatus("conflict");
        toast.error("Concurrency Conflict", {
          description: "This destination was updated in another session. Please reload to see changes.",
        });
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || "Failed to autosave");
      }

      const { data } = await res.json();
      setDraftVersion(data.draftVersion);
      setSaveStatus("saved");
    } catch (err: any) {
      console.error("[Autosave] Error:", err);
      setSaveStatus("error");
    }
  }, [page.id]);

  const scheduleAutosave = useCallback(() => {
    setSaveStatus("unsaved");
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, 1500);
  }, [performSave]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard Shortcuts (Cmd+S, Cmd+K, Cmd+D, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        performSave();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === "d" && selectedBlockId) {
        e.preventDefault();
        handleDuplicateBlock(selectedBlockId);
      } else if (e.key === "Delete" && selectedBlockId) {
        const activeTag = (typeof window !== "undefined" ? window.document.activeElement?.tagName || "" : "").toLowerCase();
        if (activeTag !== "input" && activeTag !== "textarea") {
          e.preventDefault();
          handleDeleteBlock(selectedBlockId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [performSave, selectedBlockId]);

  // Document Mutation Handlers
  const handleAddBlock = (type: LandingPageBlockType) => {
    const newBlock: LandingPageBlockV1 = {
      id: `${type}_${Date.now()}`,
      type,
      visible: true,
      props: getDefaultBlockProps(type),
    };

    setDocument((prev) => ({
      ...prev,
      blocks: [...(prev.blocks || []), newBlock],
    }));

    setSelectedBlockId(newBlock.id);
    scheduleAutosave();
    toast.success(`Added ${type.replace("_", " ")} section`);
  };

  const handleUpdateBlockProps = (blockId: string, newProps: any) => {
    setDocument((prev) => ({
      ...prev,
      blocks: (prev.blocks || []).map((b) =>
        b.id === blockId ? { ...b, props: newProps } : b
      ),
    }));
    scheduleAutosave();
  };

  const handleMoveBlock = (blockId: string, direction: "up" | "down") => {
    setDocument((prev) => {
      const blocks = [...(prev.blocks || [])];
      const index = blocks.findIndex((b) => b.id === blockId);
      if (index === -1) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= blocks.length) return prev;

      const temp = blocks[index];
      blocks[index] = blocks[targetIndex];
      blocks[targetIndex] = temp;

      return { ...prev, blocks };
    });
    scheduleAutosave();
  };

  const handleDuplicateBlock = (blockId: string) => {
    setDocument((prev) => {
      const blocks = [...(prev.blocks || [])];
      const index = blocks.findIndex((b) => b.id === blockId);
      if (index === -1) return prev;

      const source = blocks[index];
      const clone: LandingPageBlockV1 = {
        ...source,
        id: `${source.type}_${Date.now()}`,
        props: JSON.parse(JSON.stringify(source.props)),
      };

      blocks.splice(index + 1, 0, clone);
      setSelectedBlockId(clone.id);
      return { ...prev, blocks };
    });
    scheduleAutosave();
    toast.success("Section duplicated");
  };

  const handleDeleteBlock = (blockId: string) => {
    setDocument((prev) => {
      const remaining = (prev.blocks || []).filter((b) => b.id !== blockId);
      if (selectedBlockId === blockId) {
        setSelectedBlockId(remaining[0]?.id || null);
      }
      return { ...prev, blocks: remaining };
    });
    scheduleAutosave();
    toast.success("Section removed");
  };

  const handleToggleBlockVisibility = (blockId: string) => {
    setDocument((prev) => ({
      ...prev,
      blocks: (prev.blocks || []).map((b) =>
        b.id === blockId ? { ...b, visible: b.visible === false ? true : false } : b
      ),
    }));
    scheduleAutosave();
  };

  const handleUpdateTheme = (themeUpdates: Partial<LandingPageDocumentV1["theme"]>) => {
    setDocument((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...themeUpdates },
    }));
    scheduleAutosave();
  };

  const handleApplyThemePreset = (presetName: LandingPageThemePresetName) => {
    const preset = THEME_PRESET_DEFINITIONS[presetName as keyof typeof THEME_PRESET_DEFINITIONS];
    if (preset) {
      setDocument((prev) => ({
        ...prev,
        theme: preset,
      }));
      scheduleAutosave();
      toast.success(`Applied ${presetName} theme`);
    }
  };

  const handleUpdateSeo = (seoUpdates: Partial<LandingPageDocumentV1["seo"]>) => {
    setDocument((prev) => ({
      ...prev,
      seo: { ...prev.seo, ...seoUpdates },
    }));
    scheduleAutosave();
  };

  const handlePublishSuccess = (result: { versionNumber: number; publishedVersionId: string }) => {
    setPage((prev: LandingPageRecord) => ({
      ...prev,
      status: "published",
      publishedVersionId: result.publishedVersionId,
      publishedAt: new Date().toISOString(),
    }));
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {/* 1. Editor Header */}
      <EditorHeader
        pageName={page.name}
        pageSlug={page.slug}
        pageStatus={page.status}
        orgSlug={orgSlug}
        saveStatus={saveStatus}
        device={device}
        onDeviceChange={setDevice}
        onOpenPublish={() => setPublishDialogOpen(true)}
        onOpenPreview={() => setPreviewDialogOpen(true)}
        onManualSave={performSave}
        onOpenSettings={() => {
          setSelectedBlockId(null);
          setIsRightPanelOpen(true);
        }}
        isLeftPanelOpen={isLeftPanelOpen}
        isRightPanelOpen={isRightPanelOpen}
        onToggleLeftPanel={() => setIsLeftPanelOpen((prev) => !prev)}
        onToggleRightPanel={() => setIsRightPanelOpen((prev) => !prev)}
      />

      {/* 2. Three-Panel Destination Studio Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Structure Panel (Desktop) */}
        {isLeftPanelOpen && (
          <div className="hidden lg:flex h-full animate-in fade-in-50 duration-150">
            <StructurePanel
              document={document}
              selectedBlockId={selectedBlockId}
              onSelectBlock={(id) => {
                setSelectedBlockId(id);
                if (id) setIsRightPanelOpen(true);
              }}
              onAddBlock={handleAddBlock}
              onMoveBlock={handleMoveBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onDeleteBlock={handleDeleteBlock}
              onToggleBlockVisibility={handleToggleBlockVisibility}
              onUpdateTheme={handleUpdateTheme}
              onApplyThemePreset={handleApplyThemePreset}
            />
          </div>
        )}

        {/* Center Device Canvas */}
        <DeviceCanvas
          document={document}
          device={device}
          selectedBlockId={selectedBlockId}
          onSelectBlock={(id) => {
            setSelectedBlockId(id);
            if (id) {
              setIsRightPanelOpen(true);
              if (window.innerWidth < 1024) {
                setMobileDrawerOpen("inspector");
              }
            }
          }}
          onMoveBlock={handleMoveBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onDeleteBlock={handleDeleteBlock}
        />

        {/* Right Inspector Panel (Desktop) */}
        {isRightPanelOpen && (
          <div className="hidden lg:flex h-full animate-in fade-in-50 duration-150">
            <InspectorPanel
              document={document}
              selectedBlockId={selectedBlockId}
              onUpdateBlockProps={handleUpdateBlockProps}
              onUpdateMetadata={(meta) => {
                setDocument((prev) => ({ ...prev, metadata: { ...(prev.metadata || {}), ...meta } }));
                scheduleAutosave();
              }}
              onUpdateSeo={handleUpdateSeo}
              onClose={() => {
                setIsRightPanelOpen(false);
                setSelectedBlockId(null);
              }}
              orgSlug={orgSlug}
            />
          </div>
        )}
      </div>

      {/* 3. Mobile Dock (visible below lg) */}
      <div className="lg:hidden h-14 border-t border-border/60 bg-card/90 backdrop-blur-md px-4 flex items-center justify-around shrink-0 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileDrawerOpen("blocks")}
          className="flex flex-col items-center gap-1 text-[11px] h-auto py-1"
        >
          <NxtqrIcon icon="solar:widget-add-linear" size={18} />
          <span>Add Blocks</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileDrawerOpen("inspector")}
          className="flex flex-col items-center gap-1 text-[11px] h-auto py-1"
        >
          <NxtqrIcon icon="solar:slider-vertical-linear" size={18} />
          <span>Inspector</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPreviewDialogOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] h-auto py-1"
        >
          <NxtqrIcon icon="solar:eye-linear" size={18} />
          <span>Preview</span>
        </Button>
      </div>

      {/* Mobile Structure Sheet */}
      <Sheet
        open={mobileDrawerOpen === "blocks"}
        onOpenChange={(open) => !open && setMobileDrawerOpen(null)}
      >
        <SheetContent side="left" className="p-0 w-80">
          <StructurePanel
            document={document}
            selectedBlockId={selectedBlockId}
            onSelectBlock={(id) => {
              setSelectedBlockId(id);
              setMobileDrawerOpen(null);
            }}
            onAddBlock={(t) => {
              handleAddBlock(t);
              setMobileDrawerOpen(null);
            }}
            onMoveBlock={handleMoveBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onDeleteBlock={handleDeleteBlock}
            onToggleBlockVisibility={handleToggleBlockVisibility}
            onUpdateTheme={handleUpdateTheme}
            onApplyThemePreset={handleApplyThemePreset}
          />
        </SheetContent>
      </Sheet>

      {/* Mobile Inspector Sheet */}
      <Sheet
        open={mobileDrawerOpen === "inspector"}
        onOpenChange={(open) => !open && setMobileDrawerOpen(null)}
      >
        <SheetContent side="right" className="p-0 w-80">
          <InspectorPanel
            document={document}
            selectedBlockId={selectedBlockId}
            onUpdateBlockProps={handleUpdateBlockProps}
            onUpdateMetadata={(meta) => {
              setDocument((prev) => ({ ...prev, metadata: { ...(prev.metadata || {}), ...meta } }));
              scheduleAutosave();
            }}
            onUpdateSeo={handleUpdateSeo}
            onClose={() => setMobileDrawerOpen(null)}
            orgSlug={orgSlug}
          />
        </SheetContent>
      </Sheet>

      {/* 4. Overlays & Dialogs */}
      <PublishReviewDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        document={document}
        pageId={page.id}
        pageName={page.name}
        pageSlug={page.slug}
        draftVersion={draftVersion}
        qrCount={page.qrCount || 0}
        onPublishSuccess={handlePublishSuccess}
      />

      <PagePreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        document={document}
        pageSlug={page.slug}
      />

      <StudioCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onAddBlock={handleAddBlock}
        onSaveNow={performSave}
        onOpenPublish={() => setPublishDialogOpen(true)}
        onOpenPreview={() => setPreviewDialogOpen(true)}
        onOpenSettings={() => setSelectedBlockId(null)}
        onSetDevice={setDevice}
      />
    </div>
  );
}

function getDefaultBlockProps(type: LandingPageBlockType): any {
  switch (type) {
    case "hero":
      return {
        eyebrow: "FEATURED",
        title: "Welcome to Our Destination",
        description: "Mobile-first experience connected directly to smart QR infrastructure.",
        layout: "centered",
        primaryAction: { label: "Learn More", url: "https://", actionType: "url" },
      };
    case "text":
      return {
        content: "Announce key campaign details, instructions, or information here.",
        alignment: "left",
        size: "base",
      };
    case "image":
      return {
        url: "",
        alt: "Destination Asset",
        aspectRatio: "auto",
      };
    case "button":
      return {
        label: "Take Action",
        url: "https://",
        actionType: "url",
        variant: "primary",
      };
    case "link_list":
      return {
        items: [
          {
            id: "l1",
            label: "Explore Catalog",
            description: "View latest items",
            url: "https://",
            icon: "solar:shop-2-linear",
            enabled: true,
          },
          {
            id: "l2",
            label: "Contact Support",
            description: "Instant chat and assistance",
            url: "https://",
            icon: "solar:chat-round-linear",
            enabled: true,
          },
        ],
      };
    case "social_links":
      return {
        items: [
          { platform: "instagram", url: "https://instagram.com", enabled: true },
          { platform: "x", url: "https://x.com", enabled: true },
          { platform: "youtube", url: "https://youtube.com", enabled: true },
        ],
      };
    case "contact_card":
      return {
        name: "Customer Concierge",
        role: "Brand Experience",
        company: "NXTQR",
        phone: "+1 234 567 8900",
        email: "support@nxtqr.com",
      };
    case "file_download":
      return {
        fileName: "Document_Brochure.pdf",
        fileSize: "1.8 MB",
        mimeType: "application/pdf",
        downloadUrl: "#",
      };
    case "divider":
      return {
        style: "solid",
        spacing: "md",
      };
    default:
      return {};
  }
}
