"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  WorkspaceControlPlaneOverview,
  UpdateWorkspaceGeneralRequest,
  UpdateWorkspaceQrDefaultsRequest,
  UpdateWorkspaceCollaborationRequest,
  UpdateWorkspaceNotificationsRequest,
} from "@nxtqr/contracts";

import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceIdentityStrip } from "./workspace-identity-strip";
import { WorkspaceArchitectureMap } from "./workspace-architecture-map";
import { WorkspaceNavigationRail, WORKSPACE_SECTIONS } from "./workspace-navigation-rail";
import { WorkspaceScopeIndicator } from "./workspace-scope-indicator";
import { ContextImpactPanel } from "./context-impact-panel";

// Sections
import { GeneralSettingsSection } from "./sections/general-settings-section";
import { IdentitySettingsSection } from "./sections/identity-settings-section";
import { BrandDefaultsSection } from "./sections/brand-defaults-section";
import { QrDefaultsSection } from "./sections/qr-defaults-section";
import { CollaborationSection } from "./sections/collaboration-section";
import { NotificationsSection } from "./sections/notifications-section";
import { DataStorageSection } from "./sections/data-storage-section";
import { DomainsSummarySection } from "./sections/domains-summary-section";
import { CapabilitiesSection } from "./sections/capabilities-section";
import { LifecycleDangerSection } from "./sections/lifecycle-danger-section";

// Dialogs
import { WorkspaceSearchDialog } from "./dialogs/workspace-search-dialog";
import { IdentityPreviewDialog } from "./dialogs/identity-preview-dialog";
import { LogoEditorDialog } from "./dialogs/logo-editor-dialog";
import { SlugChangeDialog } from "./dialogs/slug-change-dialog";
import { TransferOwnershipDialog } from "./dialogs/transfer-ownership-dialog";
import { ArchiveWorkspaceDialog } from "./dialogs/archive-workspace-dialog";
import { DeleteWorkspaceAlertDialog } from "./dialogs/delete-workspace-alert-dialog";
import { DataExportDialog } from "./dialogs/data-export-dialog";

interface WorkspaceControlPlaneClientProps {
  initialOverview: WorkspaceControlPlaneOverview;
}

export function WorkspaceControlPlaneClient({
  initialOverview,
}: WorkspaceControlPlaneClientProps) {
  const router = useRouter();
  const [overview, setOverview] = React.useState<WorkspaceControlPlaneOverview>(initialOverview);
  const [activeSection, setActiveSection] = React.useState<string>("general");
  const [isSaving, setIsSaving] = React.useState(false);

  // Dialog states
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [identityPreviewOpen, setIdentityPreviewOpen] = React.useState(false);
  const [logoDialogOpen, setLogoDialogOpen] = React.useState(false);
  const [slugDialogOpen, setSlugDialogOpen] = React.useState(false);
  const [pendingSlug, setPendingSlug] = React.useState("");
  const [transferOwnershipOpen, setTransferOwnershipOpen] = React.useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);

  const orgSlug = overview.identity.slug;

  // Keyboard shortcut: Cmd+K / Ctrl+K to find settings
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Refresh overview data helper
  const refreshOverview = async () => {
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/workspace`);
      if (res.ok) {
        const json = await res.json();
        setOverview(json.data);
      }
    } catch {
      // Keep existing memory state
    }
  };

  // 1. General Settings Save Handler
  const handleSaveGeneral = async (payload: UpdateWorkspaceGeneralRequest) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/workspace/general`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to save general settings.");
      }

      toast.success("Workspace general settings saved.");
      setOverview((prev) => ({
        ...prev,
        identity: json.data,
      }));

      // If slug changed, navigate to new URL
      if (json.data.slug && json.data.slug !== orgSlug) {
        router.push(`/${json.data.slug}/settings/workspace`);
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update workspace settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Slug Change Confirmation Handler
  const handleConfirmSlugChange = async () => {
    if (!pendingSlug) return;
    await handleSaveGeneral({ slug: pendingSlug });
    setSlugDialogOpen(false);
  };

  // 3. Brand Default Kit Handler
  const handleSetDefaultBrandKit = async (brandKitId: string | null) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/workspace/brand-defaults`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultBrandKitId: brandKitId }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update brand defaults.");
      }

      toast.success(
        brandKitId ? "Default Brand Kit assigned successfully." : "Default Brand Kit cleared."
      );
      setOverview((prev) => ({
        ...prev,
        brandDefaults: json.data,
        availableBrandKits: prev.availableBrandKits.map((b) => ({
          ...b,
          isDefault: b.id === brandKitId,
        })),
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to change default brand kit.");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. QR Defaults Save Handler
  const handleSaveQrDefaults = async (payload: UpdateWorkspaceQrDefaultsRequest) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/workspace/qr-defaults`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update QR defaults.");
      }

      toast.success("Workspace QR defaults updated successfully.");
      setOverview((prev) => ({
        ...prev,
        qrDefaults: json.data,
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to save QR defaults.");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Collaboration Policy Save Handler
  const handleSaveCollaboration = async (payload: UpdateWorkspaceCollaborationRequest) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/workspace/collaboration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update collaboration policies.");
      }

      toast.success("Workspace collaboration policies updated.");
      setOverview((prev) => ({
        ...prev,
        collaborationPolicy: json.data,
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to save collaboration policies.");
    } finally {
      setIsSaving(false);
    }
  };

  // 6. Notification Preferences Save Handler
  const handleSaveNotifications = async (payload: UpdateWorkspaceNotificationsRequest) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/workspace/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update notification routing.");
      }

      toast.success("Workspace notification routing updated.");
      setOverview((prev) => ({
        ...prev,
        notificationPreferences: json.data,
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to save notification preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  // 7. Logo removal handler
  const handleRemoveLogo = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/workspace/logo`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to remove logo.");
      }

      toast.success("Workspace logo removed.");
      setOverview((prev) => ({
        ...prev,
        identity: { ...prev.identity, logoUrl: null },
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to remove logo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto select-text">
      {/* Layer 01: Header */}
      <WorkspaceHeader
        overview={overview}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenIdentityPreview={() => setIdentityPreviewOpen(true)}
        onOpenArchive={() => setArchiveDialogOpen(true)}
      />

      {/* Layer 02: Workspace Identity Strip */}
      <WorkspaceIdentityStrip
        overview={overview}
        onEditLogo={() => setLogoDialogOpen(true)}
      />

      {/* Layer 03: Workspace Architecture Map */}
      <WorkspaceArchitectureMap
        overview={overview}
        onSelectSection={setActiveSection}
        activeSection={activeSection}
      />

      {/* Main Operational Surface: 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column: Navigator Rail (3 cols on lg, 2 cols on xl) */}
        <aside className="lg:col-span-3 xl:col-span-3">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-xl border border-border/70 bg-surface/30 p-2 shadow-2xs">
              <WorkspaceNavigationRail
                activeSection={activeSection}
                onSelectSection={setActiveSection}
              />
            </div>
          </div>
        </aside>

        {/* Center Column: Configuration Workspace (6 cols on lg, 6 cols on xl) */}
        <main className="lg:col-span-6 xl:col-span-6 space-y-4 min-w-0">
          <WorkspaceScopeIndicator
            workspaceName={overview.identity.name}
            slug={overview.identity.slug}
            isOwner={overview.userPermissions.isOwner}
          />

          {/* Render Active Configuration Section */}
          <div className="transition-all duration-200">
            {activeSection === "general" && (
              <GeneralSettingsSection
                overview={overview}
                onSave={handleSaveGeneral}
                onOpenSlugImpactDialog={(slug) => {
                  setPendingSlug(slug);
                  setSlugDialogOpen(true);
                }}
                isSaving={isSaving}
              />
            )}

            {activeSection === "identity" && (
              <IdentitySettingsSection
                overview={overview}
                onOpenLogoDialog={() => setLogoDialogOpen(true)}
                onRemoveLogo={handleRemoveLogo}
                onOpenIdentityPreview={() => setIdentityPreviewOpen(true)}
                isSaving={isSaving}
              />
            )}

            {activeSection === "brand" && (
              <BrandDefaultsSection
                overview={overview}
                onSetDefaultBrandKit={handleSetDefaultBrandKit}
                isSaving={isSaving}
              />
            )}

            {activeSection === "qr" && (
              <QrDefaultsSection
                overview={overview}
                onSave={handleSaveQrDefaults}
                isSaving={isSaving}
              />
            )}

            {activeSection === "collaboration" && (
              <CollaborationSection
                overview={overview}
                onSave={handleSaveCollaboration}
                isSaving={isSaving}
              />
            )}

            {activeSection === "notifications" && (
              <NotificationsSection
                overview={overview}
                onSave={handleSaveNotifications}
                isSaving={isSaving}
              />
            )}

            {activeSection === "storage" && (
              <DataStorageSection
                overview={overview}
                onOpenExportDialog={() => setExportDialogOpen(true)}
              />
            )}

            {activeSection === "domains" && (
              <DomainsSummarySection overview={overview} />
            )}

            {activeSection === "capabilities" && (
              <CapabilitiesSection overview={overview} />
            )}

            {activeSection === "lifecycle" && (
              <LifecycleDangerSection
                overview={overview}
                onOpenTransferOwnership={() => setTransferOwnershipOpen(true)}
                onOpenArchiveDialog={() => setArchiveDialogOpen(true)}
                onOpenDeleteDialog={() => setDeleteDialogOpen(true)}
              />
            )}
          </div>
        </main>

        {/* Right Column: Context & Impact Rail (3 cols on lg, 3 cols on xl) */}
        <aside className="lg:col-span-3 xl:col-span-3">
          <div className="sticky top-6">
            <ContextImpactPanel
              activeSection={activeSection}
              overview={overview}
            />
          </div>
        </aside>
      </div>

      {/* Interactive Modal Dialogs */}
      <WorkspaceSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelectSection={setActiveSection}
      />

      <IdentityPreviewDialog
        open={identityPreviewOpen}
        onOpenChange={setIdentityPreviewOpen}
        overview={overview}
      />

      <LogoEditorDialog
        open={logoDialogOpen}
        onOpenChange={setLogoDialogOpen}
        orgSlug={orgSlug}
        currentLogoUrl={overview.identity.logoUrl || null}
        onSuccess={(newLogoUrl) => {
          setOverview((prev) => ({
            ...prev,
            identity: { ...prev.identity, logoUrl: newLogoUrl },
          }));
        }}
      />

      <SlugChangeDialog
        open={slugDialogOpen}
        onOpenChange={setSlugDialogOpen}
        currentSlug={overview.identity.slug}
        newSlug={pendingSlug}
        onConfirm={handleConfirmSlugChange}
        isSaving={isSaving}
      />

      <TransferOwnershipDialog
        open={transferOwnershipOpen}
        onOpenChange={setTransferOwnershipOpen}
        workspaceName={overview.identity.name}
        orgSlug={orgSlug}
        eligibleMembers={overview.eligibleTransferMembers}
        onSuccess={refreshOverview}
      />

      <ArchiveWorkspaceDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        workspaceName={overview.identity.name}
        orgSlug={orgSlug}
        onSuccess={refreshOverview}
      />

      <DeleteWorkspaceAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        workspaceName={overview.identity.name}
        orgSlug={orgSlug}
        stats={{
          qrCodes: overview.stats.qrCount,
          campaigns: overview.stats.campaignCount,
          brandKits: overview.stats.brandKitCount,
          domains: overview.stats.domainCount,
          files: overview.stats.fileCount,
          members: overview.stats.memberCount,
          teams: overview.stats.teamCount,
          landingPages: overview.stats.landingPageCount,
          templates: overview.stats.templateCount,
        }}
      />

      <DataExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        orgSlug={orgSlug}
        workspaceName={overview.identity.name}
      />
    </div>
  );
}
