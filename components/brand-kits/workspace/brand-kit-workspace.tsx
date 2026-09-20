"use client";

import * as React from "react";
import {
  BrandKitDetailV1,
  BrandColorToken,
  BrandLogoAsset,
  BrandQrPreset,
  BrandGuidelines,
  BrandGovernance,
} from "@nxtqr/contracts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BrandOverview } from "./brand-overview";
import { BrandDna } from "./brand-dna";
import { BrandImpactMap } from "./brand-impact-map";
import { ColorTokenGrid } from "../colors/color-token-grid";
import { ColorRelationshipMap } from "../colors/color-relationship-map";
import { TypographyWorkspace } from "../typography/typography-workspace";
import { LogoLibrary } from "../logos/logo-library";
import { BrandQrPresets } from "../qr/brand-qr-presets";
import { BrandGuidelinesEditor } from "../guidelines/brand-guidelines-editor";
import { BrandGuardrails } from "../governance/brand-guardrails";
import { BrandGovernanceControls } from "../governance/brand-governance-controls";
import { BrandVersionHistory } from "../versions/brand-version-history";
import { BrandTemplates } from "../templates/brand-templates";
import { BrandAssets } from "../assets/brand-assets";
import { BrandSettings } from "../settings/brand-settings";

interface BrandKitWorkspaceProps {
  kit: BrandKitDetailV1;
  orgSlug: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEditIdentity: () => void;
  onPublish: () => void;
  onSelectColorToken: (token: BrandColorToken) => void;
  onAddColorToken: () => void;
  onUploadLogo: () => void;
  onSetPrimaryLogo: (logoId: string) => void;
  onRemoveLogo: (logoId: string) => void;
  onUpdateLogoPadding?: (logoId: string, padding: number) => void;
  onCreatePreset: () => void;
  onSetDefaultPreset: (presetId: string) => void;
  onDeletePreset: (presetId: string) => void;
  onUpdateGuidelines: (guidelines: BrandGuidelines) => void;
  onUpdateGovernance: (governance: BrandGovernance) => void;
  onUpdateIdentity: (updates: {
    name?: string;
    description?: string;
    isDefault?: boolean;
  }) => Promise<void>;
  onArchive: () => void;
  onDelete: () => void;
}

export function BrandKitWorkspace({
  kit,
  orgSlug,
  activeTab,
  onTabChange,
  onEditIdentity,
  onPublish,
  onSelectColorToken,
  onAddColorToken,
  onUploadLogo,
  onSetPrimaryLogo,
  onRemoveLogo,
  onUpdateLogoPadding,
  onCreatePreset,
  onSetDefaultPreset,
  onDeletePreset,
  onUpdateGuidelines,
  onUpdateGovernance,
  onUpdateIdentity,
  onArchive,
  onDelete,
}: BrandKitWorkspaceProps) {
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        {/* Navigation Tab Bar */}
        <div className="overflow-x-auto pb-1 no-scrollbar">
          <TabsList className="h-10 bg-surface/80 border border-border/80 p-1 rounded-xl flex items-center gap-1 w-max">
            <TabsTrigger value="overview" className="text-xs px-3 cursor-pointer">
              Overview
            </TabsTrigger>
            <TabsTrigger value="colors" className="text-xs px-3 cursor-pointer">
              Colors ({kit.colors.length})
            </TabsTrigger>
            <TabsTrigger value="typography" className="text-xs px-3 cursor-pointer">
              Typography
            </TabsTrigger>
            <TabsTrigger value="logos" className="text-xs px-3 cursor-pointer">
              Logos ({kit.logos.length})
            </TabsTrigger>
            <TabsTrigger value="qr" className="text-xs px-3 cursor-pointer">
              QR Styles ({kit.qrPresets.length})
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs px-3 cursor-pointer">
              Templates
            </TabsTrigger>
            <TabsTrigger value="assets" className="text-xs px-3 cursor-pointer">
              Assets ({kit.logos.length})
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="text-xs px-3 cursor-pointer">
              Guidelines
            </TabsTrigger>
            <TabsTrigger value="governance" className="text-xs px-3 cursor-pointer">
              Governance
            </TabsTrigger>
            <TabsTrigger value="impact" className="text-xs px-3 cursor-pointer">
              Impact Map
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs px-3 cursor-pointer">
              Revisions
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs px-3 cursor-pointer">
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <BrandOverview
            kit={kit}
            onEditIdentity={onEditIdentity}
            onPublish={onPublish}
            onNavigateTab={onTabChange}
          />
          <BrandDna kit={kit} />
        </TabsContent>

        {/* 2. Colors Tab */}
        <TabsContent value="colors" className="space-y-6 mt-4">
          <ColorTokenGrid
            tokens={kit.colors}
            onSelectToken={onSelectColorToken}
            onAddToken={onAddColorToken}
          />
          <ColorRelationshipMap tokens={kit.colors} />
        </TabsContent>

        {/* 3. Typography Tab */}
        <TabsContent value="typography" className="space-y-6 mt-4">
          <TypographyWorkspace
            typography={kit.typography}
            primaryColor={kit.primaryColor}
          />
        </TabsContent>

        {/* 4. Logos Tab */}
        <TabsContent value="logos" className="space-y-6 mt-4">
          <LogoLibrary
            logos={kit.logos}
            onUploadLogo={onUploadLogo}
            onSetPrimary={onSetPrimaryLogo}
            onRemoveLogo={onRemoveLogo}
            onUpdateLogoPadding={onUpdateLogoPadding}
          />
        </TabsContent>

        {/* 5. QR Presets Tab */}
        <TabsContent value="qr" className="space-y-6 mt-4">
          <BrandQrPresets
            presets={kit.qrPresets}
            primaryColor={kit.primaryColor}
            onCreatePreset={onCreatePreset}
            onSetDefaultPreset={onSetDefaultPreset}
            onDeletePreset={onDeletePreset}
          />
        </TabsContent>

        {/* 6. Templates Tab */}
        <TabsContent value="templates" className="space-y-6 mt-4">
          <BrandTemplates kit={kit} orgSlug={orgSlug} />
        </TabsContent>

        {/* 7. Assets Tab */}
        <TabsContent value="assets" className="space-y-6 mt-4">
          <BrandAssets
            kit={kit}
            orgSlug={orgSlug}
            onUploadAsset={onUploadLogo}
            onRemoveAsset={onRemoveLogo}
          />
        </TabsContent>

        {/* 8. Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-6 mt-4">
          <BrandGuidelinesEditor
            guidelines={kit.guidelines}
            onUpdateGuidelines={onUpdateGuidelines}
          />
        </TabsContent>

        {/* 9. Governance Tab */}
        <TabsContent value="governance" className="space-y-6 mt-4">
          <BrandGuardrails governance={kit.governance} />
          <BrandGovernanceControls
            governance={kit.governance}
            onUpdateGovernance={onUpdateGovernance}
          />
        </TabsContent>

        {/* 10. Impact Tab */}
        <TabsContent value="impact" className="space-y-6 mt-4">
          <BrandImpactMap kit={kit} orgSlug={orgSlug} />
        </TabsContent>

        {/* 11. History Tab */}
        <TabsContent value="history" className="space-y-6 mt-4">
          <BrandVersionHistory brandKitId={kit.id} />
        </TabsContent>

        {/* 12. Settings Tab */}
        <TabsContent value="settings" className="space-y-6 mt-4">
          <BrandSettings
            kit={kit}
            onUpdateIdentity={onUpdateIdentity}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
