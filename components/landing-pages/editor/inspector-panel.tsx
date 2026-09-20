"use client";

import React, { useState } from "react";
import type {
  LandingPageDocumentV1,
  LandingPageBlockV1,
  HeroBlockProps,
  TextBlockProps,
  ImageBlockProps,
  ButtonBlockProps,
  LinkListBlockProps,
  SocialLinksBlockProps,
  ContactCardBlockProps,
  FileDownloadBlockProps,
  DividerBlockProps,
  LandingPageActionType,
} from "@nxtqr/contracts";
import { AssetPickerDialog } from "./asset-picker-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface InspectorPanelProps {
  document: LandingPageDocumentV1;
  selectedBlockId: string | null;
  onUpdateBlockProps: (blockId: string, props: any) => void;
  onUpdateMetadata: (metadata: Record<string, any>) => void;
  onUpdateSeo: (seo: Partial<LandingPageDocumentV1["seo"]>) => void;
  onClose: () => void;
  orgSlug: string;
}

export function InspectorPanel({
  document,
  selectedBlockId,
  onUpdateBlockProps,
  onUpdateMetadata,
  onUpdateSeo,
  onClose,
  orgSlug,
}: InspectorPanelProps) {
  const [assetPickerTarget, setAssetPickerTarget] = useState<string | null>(null);

  const selectedBlock = document.blocks?.find((b) => b.id === selectedBlockId);

  return (
    <aside className="w-80 h-full border-l border-border/60 bg-card flex flex-col shrink-0 select-none overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-border/60 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <NxtqrIcon
            icon={selectedBlock ? "solar:slider-vertical-bold" : "solar:settings-bold"}
            size={16}
            className="text-[#FA520F]"
          />
          <span className="font-bold text-xs uppercase tracking-wider text-foreground">
            {selectedBlock ? `${selectedBlock.type.replace("_", " ")} Inspector` : "Destination Settings"}
          </span>
        </div>

        {selectedBlock && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <NxtqrIcon icon="solar:close-circle-linear" size={16} />
          </Button>
        )}
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {selectedBlock ? (
          renderBlockInspector(
            selectedBlock,
            (newProps) => onUpdateBlockProps(selectedBlock.id, newProps),
            () => setAssetPickerTarget(selectedBlock.id)
          )
        ) : (
          /* Page Level SEO & Metadata Settings when no block selected */
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground">Destination Metadata</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Configure browser tab titles and social media card previews.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">SEO Title</Label>
              <Input
                value={document.seo?.title || ""}
                onChange={(e) => onUpdateSeo({ title: e.target.value })}
                placeholder="Title shown on social previews & bookmarks"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">SEO Description</Label>
              <Textarea
                value={document.seo?.description || ""}
                onChange={(e) => onUpdateSeo({ description: e.target.value })}
                placeholder="Short summary for links shared on WhatsApp, iMessage, and social networks..."
                className="text-xs min-h-[80px]"
              />
            </div>

            <div className="pt-3 border-t border-border/40">
              <div className="rounded-xl border border-border/40 bg-muted/20 p-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold block">Search Indexing</span>
                  <span className="text-[11px] text-muted-foreground block">
                    Allow search engines to index this destination
                  </span>
                </div>
                <Switch
                  checked={!document.seo?.noindex}
                  onCheckedChange={(checked) => onUpdateSeo({ noindex: !checked })}
                />
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-semibold block mb-1">Canvas Tip:</strong>
              Click any section on the device canvas to customize its content, layout, actions, and media.
            </div>
          </div>
        )}
      </div>

      {/* Asset Picker Dialog */}
      <AssetPickerDialog
        open={Boolean(assetPickerTarget)}
        onOpenChange={(open) => !open && setAssetPickerTarget(null)}
        orgSlug={orgSlug}
        onSelectAsset={(url, fileName, fileSize, mimeType) => {
          if (!selectedBlock) return;
          if (selectedBlock.type === "image") {
            onUpdateBlockProps(selectedBlock.id, {
              ...selectedBlock.props,
              url,
            });
          } else if (selectedBlock.type === "hero") {
            onUpdateBlockProps(selectedBlock.id, {
              ...selectedBlock.props,
              imageUrl: url,
            });
          } else if (selectedBlock.type === "file_download") {
            onUpdateBlockProps(selectedBlock.id, {
              ...selectedBlock.props,
              downloadUrl: url,
              fileName: fileName || "Attachment",
              fileSize: fileSize || "File",
              mimeType: mimeType || "application/octet-stream",
            });
          } else if (selectedBlock.type === "contact_card") {
            onUpdateBlockProps(selectedBlock.id, {
              ...selectedBlock.props,
              avatarUrl: url,
            });
          }
        }}
      />
    </aside>
  );
}

function renderBlockInspector(
  block: LandingPageBlockV1,
  updateProps: (props: any) => void,
  openAssetPicker: () => void
) {
  const p = block.props as any;

  switch (block.type) {
    case "hero":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Eyebrow Tag</Label>
            <Input
              value={p.eyebrow || ""}
              onChange={(e) => updateProps({ ...p, eyebrow: e.target.value })}
              placeholder="e.g. SPECIAL OFFER"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Headline Title</Label>
            <Input
              value={p.title || ""}
              onChange={(e) => updateProps({ ...p, title: e.target.value })}
              placeholder="Welcome"
              className="text-xs h-9 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={p.description || ""}
              onChange={(e) => updateProps({ ...p, description: e.target.value })}
              placeholder="Detailed intro..."
              className="text-xs min-h-[70px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Layout Style</Label>
            <Select
              value={p.layout || "centered"}
              onValueChange={(val) => updateProps({ ...p, layout: val })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="centered">Centered</SelectItem>
                <SelectItem value="editorial">Editorial (Left Aligned)</SelectItem>
                <SelectItem value="image-first">Image First</SelectItem>
                <SelectItem value="split">Split Row</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Hero Image</Label>
            <div className="flex gap-2">
              <Input
                value={p.imageUrl || ""}
                onChange={(e) => updateProps({ ...p, imageUrl: e.target.value })}
                placeholder="https://..."
                className="text-xs h-9"
              />
              <Button type="button" variant="outline" size="sm" onClick={openAssetPicker} className="h-9 px-2 shrink-0">
                <NxtqrIcon icon="solar:gallery-linear" size={14} />
              </Button>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 border-t border-border/40 space-y-2">
            <span className="text-[11px] font-mono uppercase text-muted-foreground">Primary Action</span>
            <Input
              value={p.primaryAction?.label || ""}
              onChange={(e) =>
                updateProps({
                  ...p,
                  primaryAction: { ...(p.primaryAction || {}), label: e.target.value },
                })
              }
              placeholder="Button Label (e.g. Shop Now)"
              className="text-xs h-9"
            />
            <div className="flex gap-2">
              <Input
                value={p.primaryAction?.url || ""}
                onChange={(e) =>
                  updateProps({
                    ...p,
                    primaryAction: { ...(p.primaryAction || {}), url: e.target.value },
                  })
                }
                placeholder="Target URL or Phone"
                className="text-xs h-9 flex-1"
              />
              <Select
                value={p.primaryAction?.actionType || "url"}
                onValueChange={(val) =>
                  updateProps({
                    ...p,
                    primaryAction: { ...(p.primaryAction || {}), actionType: val },
                  })
                }
              >
                <SelectTrigger className="w-24 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">Link</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );

    case "text":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Content Text</Label>
            <Textarea
              value={p.content || ""}
              onChange={(e) => updateProps({ ...p, content: e.target.value })}
              placeholder="Enter text..."
              className="text-xs min-h-[140px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Alignment</Label>
            <Select
              value={p.alignment || "left"}
              onValueChange={(val) => updateProps({ ...p, alignment: val })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Font Size</Label>
            <Select
              value={p.size || "base"}
              onValueChange={(val) => updateProps({ ...p, size: val })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="base">Regular</SelectItem>
                <SelectItem value="lg">Large Heading</SelectItem>
                <SelectItem value="xl">Extra Large Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Image URL</Label>
            <div className="flex gap-2">
              <Input
                value={p.url || ""}
                onChange={(e) => updateProps({ ...p, url: e.target.value })}
                placeholder="https://..."
                className="text-xs h-9"
              />
              <Button type="button" variant="outline" size="sm" onClick={openAssetPicker} className="h-9 px-2 shrink-0">
                <NxtqrIcon icon="solar:gallery-linear" size={14} />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Caption</Label>
            <Input
              value={p.caption || ""}
              onChange={(e) => updateProps({ ...p, caption: e.target.value })}
              placeholder="Optional photo caption..."
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Aspect Ratio</Label>
            <Select
              value={p.aspectRatio || "auto"}
              onValueChange={(val) => updateProps({ ...p, aspectRatio: val })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto / Natural</SelectItem>
                <SelectItem value="1:1">Square (1:1)</SelectItem>
                <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                <SelectItem value="4:3">Classic (4:3)</SelectItem>
                <SelectItem value="3:2">Photo (3:2)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "button":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Button Label</Label>
            <Input
              value={p.label || ""}
              onChange={(e) => updateProps({ ...p, label: e.target.value })}
              placeholder="e.g. Visit Website"
              className="text-xs h-9 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Action Type</Label>
            <Select
              value={p.actionType || "url"}
              onValueChange={(val) => updateProps({ ...p, actionType: val })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">Website / URL</SelectItem>
                <SelectItem value="call">Phone Call</SelectItem>
                <SelectItem value="whatsapp">WhatsApp Message</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Target Destination</Label>
            <Input
              value={p.url || ""}
              onChange={(e) => updateProps({ ...p, url: e.target.value })}
              placeholder="https://... or phone number"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Visual Variant</Label>
            <Select
              value={p.variant || "primary"}
              onValueChange={(val) => updateProps({ ...p, variant: val })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Accent Filled (Primary)</SelectItem>
                <SelectItem value="secondary">Surface Filled (Secondary)</SelectItem>
                <SelectItem value="outline">Outlined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "link_list":
      const items = p.items || [];
      return (
        <div className="space-y-4">
          {/* Columns & Alignment Controls */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl border border-border/40 bg-muted/20">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground font-mono">Columns</Label>
              <Select
                value={p.columns || "auto"}
                onValueChange={(val) => updateProps({ ...p, columns: val })}
              >
                <SelectTrigger className="h-7 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Responsive)</SelectItem>
                  <SelectItem value="1">1 Column (List)</SelectItem>
                  <SelectItem value="2">2 Columns (Grid)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground font-mono">Alignment</Label>
              <Select
                value={p.alignment || "left"}
                onValueChange={(val) => updateProps({ ...p, alignment: val })}
              >
                <SelectTrigger className="h-7 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left (Standard)</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Links ({items.length})</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newItem = {
                  id: `link_${Date.now()}`,
                  label: "New Link Destination",
                  url: "https://",
                  icon: "solar:link-linear",
                  enabled: true,
                };
                updateProps({ ...p, items: [...items, newItem] });
              }}
              className="h-7 text-xs gap-1"
            >
              <NxtqrIcon icon="solar:add-circle-linear" size={13} />
              <span>Add</span>
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item: any, idx: number) => (
              <div key={item.id} className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    value={item.label}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].label = e.target.value;
                      updateProps({ ...p, items: updated });
                    }}
                    placeholder="Link Label"
                    className="text-xs h-8 font-semibold"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      updateProps({ ...p, items: items.filter((_: any, i: number) => i !== idx) });
                    }}
                    className="h-7 w-7 text-destructive shrink-0"
                  >
                    <NxtqrIcon icon="solar:trash-bin-trash-linear" size={14} />
                  </Button>
                </div>

                <Input
                  value={item.url}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx].url = e.target.value;
                    updateProps({ ...p, items: updated });
                  }}
                  placeholder="https://..."
                  className="text-xs h-8"
                />

                <Input
                  value={item.description || ""}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx].description = e.target.value;
                    updateProps({ ...p, items: updated });
                  }}
                  placeholder="Description (optional)"
                  className="text-[11px] h-7"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "contact_card":
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Full Name</Label>
            <Input
              value={p.name || ""}
              onChange={(e) => updateProps({ ...p, name: e.target.value })}
              className="text-xs h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Role / Title</Label>
            <Input
              value={p.role || ""}
              onChange={(e) => updateProps({ ...p, role: e.target.value })}
              className="text-xs h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Company / Org</Label>
            <Input
              value={p.company || ""}
              onChange={(e) => updateProps({ ...p, company: e.target.value })}
              className="text-xs h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Phone Number</Label>
            <Input
              value={p.phone || ""}
              onChange={(e) => updateProps({ ...p, phone: e.target.value })}
              className="text-xs h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email Address</Label>
            <Input
              value={p.email || ""}
              onChange={(e) => updateProps({ ...p, email: e.target.value })}
              className="text-xs h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Website</Label>
            <Input
              value={p.website || ""}
              onChange={(e) => updateProps({ ...p, website: e.target.value })}
              className="text-xs h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Location</Label>
            <Input
              value={p.location || ""}
              onChange={(e) => updateProps({ ...p, location: e.target.value })}
              className="text-xs h-9"
            />
          </div>
        </div>
      );

    case "file_download":
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Display File Name</Label>
            <Input
              value={p.fileName || ""}
              onChange={(e) => updateProps({ ...p, fileName: e.target.value })}
              className="text-xs h-9 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Download URL</Label>
            <div className="flex gap-2">
              <Input
                value={p.downloadUrl || ""}
                onChange={(e) => updateProps({ ...p, downloadUrl: e.target.value })}
                placeholder="https://..."
                className="text-xs h-9"
              />
              <Button type="button" variant="outline" size="sm" onClick={openAssetPicker} className="h-9 px-2 shrink-0">
                <NxtqrIcon icon="solar:folder-linear" size={14} />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">File Size Text</Label>
            <Input
              value={p.fileSize || ""}
              onChange={(e) => updateProps({ ...p, fileSize: e.target.value })}
              placeholder="e.g. 2.4 MB"
              className="text-xs h-9"
            />
          </div>
        </div>
      );

    case "divider":
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Line Style</Label>
            <Select
              value={p.style || "solid"}
              onValueChange={(val) => updateProps({ ...p, style: val })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid Line</SelectItem>
                <SelectItem value="dashed">Dashed Line</SelectItem>
                <SelectItem value="dotted">Dotted Line</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Vertical Spacing</Label>
            <Select
              value={p.spacing || "md"}
              onValueChange={(val) => updateProps({ ...p, spacing: val })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    default:
      return null;
  }
}
