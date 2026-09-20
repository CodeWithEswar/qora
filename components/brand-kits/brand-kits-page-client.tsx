"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BrandKitSummaryV1,
  BrandKitDetailV1,
  BrandKitPulseMetrics,
  BrandColorToken,
  BrandLogoAsset,
  BrandQrPreset,
  BrandGuidelines,
  BrandGovernance,
  CreateBrandKitRequestV1,
} from "@nxtqr/contracts";
import { BrandKitsHeader } from "./brand-kits-header";
import { BrandKitsPulse } from "./brand-kits-pulse";
import { BrandKitLibrary } from "./brand-kit-library";
import { BrandKitWorkspace } from "./workspace/brand-kit-workspace";
import { LiveBrandPreview } from "./preview/live-brand-preview";
import { BrandKitsEmpty } from "./states/brand-kits-empty";
import { BrandKitsLoading } from "./states/brand-kits-loading";
import { BrandKitWorkspaceSkeleton } from "./states/brand-kit-workspace-skeleton";
import { LiveBrandPreviewSkeleton } from "./states/live-brand-preview-skeleton";
import { BrandKitsError } from "./states/brand-kits-error";

// Dialogs
import { CreateBrandKitDialog } from "./dialogs/create-brand-kit-dialog";
import { EditBrandKitDialog } from "./dialogs/edit-brand-kit-dialog";
import { DuplicateBrandKitDialog } from "./dialogs/duplicate-brand-kit-dialog";
import { PublishBrandKitDialog } from "./dialogs/publish-brand-kit-dialog";
import { AddColorDialog } from "./colors/add-color-dialog";
import { ColorInspectorSheet } from "./colors/color-inspector-sheet";
import { UploadLogoDialog } from "./logos/upload-logo-dialog";
import { CreateQrPresetDialog } from "./qr/create-qr-preset-dialog";
import { toast } from "sonner";

interface BrandKitsPageClientProps {
  orgSlug: string;
  initialKits: BrandKitSummaryV1[];
  initialPulse: BrandKitPulseMetrics;
  initialSelectedKit?: BrandKitDetailV1 | null;
}

export function BrandKitsPageClient({
  orgSlug,
  initialKits,
  initialPulse,
  initialSelectedKit,
}: BrandKitsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Primary Workspace State
  const [kits, setKits] = React.useState<BrandKitSummaryV1[]>(initialKits);
  const [pulse, setPulse] = React.useState<BrandKitPulseMetrics>(initialPulse);
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "archived">("active");

  // Determine initial selected kit: search param > default kit > first active kit
  const initialSelectedId = React.useMemo(() => {
    if (initialSelectedKit) return initialSelectedKit.id;
    const urlKit = searchParams.get("kit");
    if (urlKit) {
      const found = initialKits.find((k) => k.id === urlKit || k.slug === urlKit);
      if (found) return found.id;
    }
    const defaultKit = initialKits.find((k) => k.isDefault && k.status === "ACTIVE");
    if (defaultKit) return defaultKit.id;
    const firstActive = initialKits.find((k) => k.status === "ACTIVE");
    return firstActive ? firstActive.id : initialKits[0]?.id || null;
  }, [initialKits, initialSelectedKit, searchParams]);

  const [selectedKitId, setSelectedKitId] = React.useState<string | null>(initialSelectedId);
  const [selectedKit, setSelectedKit] = React.useState<BrandKitDetailV1 | null>(initialSelectedKit || null);
  const [activeTab, setActiveTab] = React.useState<string>(searchParams.get("tab") || "overview");
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editKit, setEditKit] = React.useState<BrandKitDetailV1 | null>(null);
  const [duplicateKit, setDuplicateKit] = React.useState<BrandKitSummaryV1 | null>(null);
  const [publishKit, setPublishKit] = React.useState<BrandKitDetailV1 | null>(null);

  // Workspace sub-inspectors
  const [isAddColorOpen, setIsAddColorOpen] = React.useState(false);
  const [inspectingColorToken, setInspectingColorToken] = React.useState<BrandColorToken | null>(null);
  const [isUploadLogoOpen, setIsUploadLogoOpen] = React.useState(false);
  const [isCreatePresetOpen, setIsCreatePresetOpen] = React.useState(false);

  // Load detail whenever selectedKitId changes
  const loadKitDetail = React.useCallback(
    async (kitId: string) => {
      setIsLoadingDetail(true);
      try {
        const res = await fetch(`/api/v1/brand-kits/${kitId}?orgSlug=${encodeURIComponent(orgSlug)}`, {
          headers: { "x-organization-slug": orgSlug },
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.success !== false && json.data) {
          setSelectedKit(json.data);
        } else {
          const errMsg = json.error?.message || json.message || (typeof json.error === "string" ? json.error : "") || `Could not load Brand Kit details (${res.status})`;
          toast.error(errMsg);
        }
      } catch (err: any) {
        console.error("Failed to load Brand Kit detail:", err);
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [orgSlug]
  );

  React.useEffect(() => {
    if (selectedKitId) {
      loadKitDetail(selectedKitId);
    } else {
      setSelectedKit(null);
    }
  }, [selectedKitId, loadKitDetail]);

  // Refresh list and pulse from server
  const refreshKitsList = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/brand-kits?status=all&orgSlug=${encodeURIComponent(orgSlug)}`, {
        headers: { "x-organization-slug": orgSlug },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success !== false && json.data) {
        setKits(json.data);
        if (json.meta?.pulse) {
          setPulse(json.meta.pulse);
        }
      }
    } catch (err) {
      console.error("Failed to refresh brand kits list:", err);
    }
  }, [orgSlug]);

  // Helper to persist partial updates to active selected kit
  const patchSelectedKit = async (updates: Partial<BrandKitDetailV1>) => {
    if (!selectedKit) return;
    try {
      const res = await fetch(`/api/v1/brand-kits/${selectedKit.id}?orgSlug=${encodeURIComponent(orgSlug)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-organization-slug": orgSlug,
        },
        body: JSON.stringify(updates),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success !== false && json.data) {
        setSelectedKit(json.data);
        await refreshKitsList();
      } else {
        const errMsg = json.error?.message || json.message || (typeof json.error === "string" ? json.error : "") || `Failed to save changes (${res.status})`;
        throw new Error(errMsg);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
      throw err;
    }
  };

  // 1. Create Brand Kit
  const handleCreateKit = async (payload: CreateBrandKitRequestV1) => {
    const res = await fetch(`/api/v1/brand-kits?orgSlug=${encodeURIComponent(orgSlug)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-organization-slug": orgSlug,
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      const errMsg = json.error?.message || json.message || (typeof json.error === "string" ? json.error : "") || `Failed to create Brand Kit (${res.status})`;
      throw new Error(errMsg);
    }

    await refreshKitsList();
    if (json.data?.id) {
      setSelectedKitId(json.data.id);
    }
  };

  // 2. Update Identity Info (Name, Desc, Default)
  const handleUpdateIdentity = async (updates: {
    name?: string;
    description?: string;
    primaryColor?: string;
    isDefault?: boolean;
  }) => {
    if (!selectedKit) return;
    await patchSelectedKit(updates);
  };

  // 3. Duplicate Brand Kit
  const handleDuplicateKit = async (kitId: string, newName: string) => {
    const res = await fetch(`/api/v1/brand-kits/${kitId}/duplicate?orgSlug=${encodeURIComponent(orgSlug)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-organization-slug": orgSlug,
      },
      body: JSON.stringify({ name: newName }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      const errMsg = json.error?.message || json.message || (typeof json.error === "string" ? json.error : "") || `Failed to duplicate Brand Kit (${res.status})`;
      throw new Error(errMsg);
    }

    await refreshKitsList();
    if (json.data?.id) {
      setSelectedKitId(json.data.id);
    }
  };

  // 4. Set Default Brand Kit
  const handleSetDefault = async (kitId: string) => {
    try {
      const res = await fetch(`/api/v1/brand-kits/${kitId}/default?orgSlug=${encodeURIComponent(orgSlug)}`, {
        method: "POST",
        headers: { "x-organization-slug": orgSlug },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success !== false) {
        toast.success("Designated as organization default Brand Kit.");
        await refreshKitsList();
        if (selectedKitId === kitId) {
          loadKitDetail(kitId);
        }
      } else {
        const errMsg = json.error?.message || json.message || (typeof json.error === "string" ? json.error : "") || `Failed to set default Brand Kit (${res.status})`;
        toast.error(errMsg);
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error while setting default Brand Kit");
    }
  };

  // 5. Archive Brand Kit
  const handleArchiveKit = async (kitId: string) => {
    try {
      const res = await fetch(`/api/v1/brand-kits/${kitId}?action=archive&orgSlug=${encodeURIComponent(orgSlug)}`, {
        method: "DELETE",
        headers: { "x-organization-slug": orgSlug },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success !== false) {
        toast.success("Brand Kit archived.");
        await refreshKitsList();
        // Select another active kit
        const nextKit = kits.find((k) => k.id !== kitId && k.status === "ACTIVE");
        setSelectedKitId(nextKit ? nextKit.id : null);
      } else {
        const errMsg = json.error?.message || json.message || (typeof json.error === "string" ? json.error : "") || `Failed to archive Brand Kit (${res.status})`;
        toast.error(errMsg);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to archive Brand Kit");
    }
  };

  // 6. Delete Brand Kit Permanently
  const handleDeleteKit = async (kitId: string) => {
    try {
      const res = await fetch(`/api/v1/brand-kits/${kitId}?action=delete&orgSlug=${encodeURIComponent(orgSlug)}`, {
        method: "DELETE",
        headers: { "x-organization-slug": orgSlug },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success !== false) {
        toast.success("Brand Kit permanently removed. Linked QRs were safely preserved.");
        await refreshKitsList();
        const nextKit = kits.find((k) => k.id !== kitId);
        setSelectedKitId(nextKit ? nextKit.id : null);
      } else {
        const errMsg = json.error?.message || json.message || (typeof json.error === "string" ? json.error : "") || `Failed to delete Brand Kit (${res.status})`;
        toast.error(errMsg);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete Brand Kit");
    }
  };

  // 7. Publish Revision
  const handlePublishRevision = async (kitId: string, changeSummary: string) => {
    const res = await fetch(`/api/v1/brand-kits/${kitId}/publish?orgSlug=${encodeURIComponent(orgSlug)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-organization-slug": orgSlug,
      },
      body: JSON.stringify({ changeSummary }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      const errMsg = json.error?.message || json.message || (typeof json.error === "string" ? json.error : "") || `Failed to publish revision (${res.status})`;
      throw new Error(errMsg);
    }

    await loadKitDetail(kitId);
    await refreshKitsList();
  };

  // 8. Color Token Actions
  const handleAddColorToken = async (token: BrandColorToken) => {
    if (!selectedKit) return;
    const updated = [...selectedKit.colors, token];
    await patchSelectedKit({ colors: updated });
    toast.success(`Color token '${token.name}' added.`);
  };

  const handleSaveColorToken = async (token: BrandColorToken) => {
    if (!selectedKit) return;
    const updated = selectedKit.colors.map((c) => (c.id === token.id ? token : c));
    await patchSelectedKit({ colors: updated });
    toast.success(`Color token '${token.name}' updated.`);
  };

  const handleDeleteColorToken = async (tokenId: string) => {
    if (!selectedKit) return;
    const updated = selectedKit.colors.filter((c) => c.id !== tokenId);
    await patchSelectedKit({ colors: updated });
    toast.success("Color token removed.");
  };

  // 9. Logo Actions
  const handleAddLogo = async (logo: BrandLogoAsset) => {
    if (!selectedKit) return;
    // If marked primary, unmark others
    const existing = logo.isPrimary
      ? selectedKit.logos.map((l) => ({ ...l, isPrimary: false }))
      : selectedKit.logos;
    const updated = [...existing, logo];
    await patchSelectedKit({ logos: updated });
    toast.success(`Logo mark '${logo.name}' registered.`);
  };

  const handleSetPrimaryLogo = async (logoId: string) => {
    if (!selectedKit) return;
    const target = selectedKit.logos.find((l) => l.id === logoId);
    const updated = selectedKit.logos.map((l) => ({
      ...l,
      isPrimary: l.id === logoId,
    }));
    await patchSelectedKit({
      logos: updated,
      logoUrl: target ? target.url : selectedKit.logoUrl,
    });
    toast.success("Designated as primary brand logo.");
  };

  const handleRemoveLogo = async (logoId: string) => {
    if (!selectedKit) return;
    const updated = selectedKit.logos.filter((l) => l.id !== logoId);
    await patchSelectedKit({ logos: updated });
    toast.success("Brand asset removed.");
  };

  const handleUpdateLogoPadding = async (logoId: string, padding: number) => {
    if (!selectedKit) return;
    const updated = selectedKit.logos.map((l) =>
      l.id === logoId ? { ...l, safeAreaPadding: padding } : l
    );
    await patchSelectedKit({ logos: updated });
  };

  // 10. QR Style Presets
  const handleCreatePreset = async (preset: BrandQrPreset) => {
    if (!selectedKit) return;
    const updated = [...selectedKit.qrPresets, preset];
    await patchSelectedKit({ qrPresets: updated });
    toast.success(`QR preset '${preset.name}' created.`);
  };

  const handleSetDefaultPreset = async (presetId: string) => {
    if (!selectedKit) return;
    const updated = selectedKit.qrPresets.map((p) => ({
      ...p,
      isDefault: p.id === presetId,
    }));
    await patchSelectedKit({ qrPresets: updated });
    toast.success("Preset designated as Brand Kit default.");
  };

  const handleDeletePreset = async (presetId: string) => {
    if (!selectedKit) return;
    const updated = selectedKit.qrPresets.filter((p) => p.id !== presetId);
    await patchSelectedKit({ qrPresets: updated });
    toast.success("QR preset deleted.");
  };

  // 11. Guidelines & Governance
  const handleUpdateGuidelines = async (guidelines: BrandGuidelines) => {
    await patchSelectedKit({ guidelines });
    toast.success("Brand guidelines updated.");
  };

  const handleUpdateGovernance = async (governance: BrandGovernance) => {
    await patchSelectedKit({ governance });
    toast.success("Brand governance rules updated.");
  };

  // Zero Brand Kits in Workspace: Show Authentic Empty State
  if (kits.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <BrandKitsHeader
          orgSlug={orgSlug}
          onCreateNew={() => setIsCreateOpen(true)}
        />
        <BrandKitsPulse pulse={pulse} />
        <BrandKitsEmpty onCreate={() => setIsCreateOpen(true)} />

        <CreateBrandKitDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateKit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Page Header */}
      <BrandKitsHeader
        orgSlug={orgSlug}
        onCreateNew={() => setIsCreateOpen(true)}
      />

      {/* 2. Real Database Pulse Strip */}
      <BrandKitsPulse pulse={pulse} />

      {/* 3. Signature 3-Zone Identity Operating System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ZONE 1: Brand Kit Library (Left Rail: 3 cols on lg, 3 cols on xl) */}
        <div className="lg:col-span-4 xl:col-span-3 h-[750px] sticky top-4">
          <BrandKitLibrary
            kits={kits}
            selectedKitId={selectedKitId}
            onSelectKit={(id) => {
              setSelectedKitId(id);
              // Update URL quietly
              const params = new URLSearchParams(window.location.search);
              params.set("kit", id);
              router.replace(`/${orgSlug}/brand?${params.toString()}`, { scroll: false });
            }}
            onSetDefault={handleSetDefault}
            onDuplicate={(kit) => setDuplicateKit(kit)}
            onRename={(kit) => {
              if (selectedKit && selectedKit.id === kit.id) {
                setEditKit(selectedKit);
              } else {
                fetch(`/api/v1/brand-kits/${kit.id}?orgSlug=${encodeURIComponent(orgSlug)}`, {
                  headers: { "x-organization-slug": orgSlug },
                })
                  .then((r) => r.json())
                  .then((d) => d?.data && setEditKit(d.data))
                  .catch(() => {});
              }
            }}
            onArchive={(kit) => handleArchiveKit(kit.id)}
            onDelete={(kit) => handleDeleteKit(kit.id)}
            statusFilter={statusFilter}
            onChangeStatusFilter={setStatusFilter}
          />
        </div>

        {/* ZONE 2: Selected Brand Kit Workspace (Center Rail: 8 cols on lg, 6 cols on xl) */}
        <div className="lg:col-span-8 xl:col-span-6 min-w-0">
          {isLoadingDetail || !selectedKit ? (
            <BrandKitWorkspaceSkeleton />
          ) : (
            <BrandKitWorkspace
              kit={selectedKit}
              orgSlug={orgSlug}
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                const params = new URLSearchParams(window.location.search);
                params.set("tab", tab);
                router.replace(`/${orgSlug}/brand?${params.toString()}`, { scroll: false });
              }}
              onEditIdentity={() => setEditKit(selectedKit)}
              onPublish={() => setPublishKit(selectedKit)}
              onSelectColorToken={(token) => setInspectingColorToken(token)}
              onAddColorToken={() => setIsAddColorOpen(true)}
              onUploadLogo={() => setIsUploadLogoOpen(true)}
              onSetPrimaryLogo={handleSetPrimaryLogo}
              onRemoveLogo={handleRemoveLogo}
              onUpdateLogoPadding={handleUpdateLogoPadding}
              onCreatePreset={() => setIsCreatePresetOpen(true)}
              onSetDefaultPreset={handleSetDefaultPreset}
              onDeletePreset={handleDeletePreset}
              onUpdateGuidelines={handleUpdateGuidelines}
              onUpdateGovernance={handleUpdateGovernance}
              onUpdateIdentity={handleUpdateIdentity}
              onArchive={() => handleArchiveKit(selectedKit.id)}
              onDelete={() => handleDeleteKit(selectedKit.id)}
            />
          )}
        </div>

        {/* ZONE 3: Live Brand Preview (Right Rail: hidden on <xl or rendered in 3 cols on xl+) */}
        <div className="hidden xl:block xl:col-span-3 h-[750px] sticky top-4">
          {isLoadingDetail ? (
            <LiveBrandPreviewSkeleton />
          ) : selectedKit ? (
            <LiveBrandPreview kit={selectedKit} orgSlug={orgSlug} />
          ) : (
            <div className="h-full rounded-2xl border border-dashed border-border/80 bg-surface/30 flex items-center justify-center p-6 text-center text-xs text-muted-foreground">
              Select a Brand Kit to activate live vector preview
            </div>
          )}
        </div>
      </div>

      {/* DIALOGS */}
      <CreateBrandKitDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateKit}
      />

      <EditBrandKitDialog
        open={Boolean(editKit)}
        onOpenChange={(open) => !open && setEditKit(null)}
        kit={editKit}
        onSave={async (id, updates) => {
          await patchSelectedKit(updates);
        }}
      />

      <DuplicateBrandKitDialog
        open={Boolean(duplicateKit)}
        onOpenChange={(open) => !open && setDuplicateKit(null)}
        kit={duplicateKit}
        onDuplicate={handleDuplicateKit}
      />

      <PublishBrandKitDialog
        open={Boolean(publishKit)}
        onOpenChange={(open) => !open && setPublishKit(null)}
        kit={publishKit}
        onPublish={handlePublishRevision}
      />

      <AddColorDialog
        isOpen={isAddColorOpen}
        onClose={() => setIsAddColorOpen(false)}
        onAddToken={handleAddColorToken}
      />

      <ColorInspectorSheet
        isOpen={Boolean(inspectingColorToken)}
        onClose={() => setInspectingColorToken(null)}
        token={inspectingColorToken}
        onSaveToken={handleSaveColorToken}
        onDeleteToken={handleDeleteColorToken}
      />

      <UploadLogoDialog
        isOpen={isUploadLogoOpen}
        onClose={() => setIsUploadLogoOpen(false)}
        onAddLogo={handleAddLogo}
      />

      {selectedKit && (
        <CreateQrPresetDialog
          isOpen={isCreatePresetOpen}
          onClose={() => setIsCreatePresetOpen(false)}
          brandColors={selectedKit.colors}
          primaryColor={selectedKit.primaryColor}
          onCreatePreset={handleCreatePreset}
        />
      )}
    </div>
  );
}
