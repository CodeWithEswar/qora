"use client";

import React, { useState } from "react";
import type {
  LandingPageDocumentV1,
  LandingPageBlockV1,
  LandingPageBlockType,
  LandingPageThemePresetName,
} from "@nxtqr/contracts";
import { THEME_PRESET_DEFINITIONS } from "@nxtqr/contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/ui/color-picker";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface StructurePanelProps {
  document: LandingPageDocumentV1;
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string | null) => void;
  onAddBlock: (type: LandingPageBlockType) => void;
  onMoveBlock: (blockId: string, direction: "up" | "down") => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onToggleBlockVisibility: (blockId: string) => void;
  onUpdateTheme: (themeUpdates: Partial<LandingPageDocumentV1["theme"]>) => void;
  onApplyThemePreset: (presetName: LandingPageThemePresetName) => void;
}

const BLOCK_DEFINITIONS: Array<{
  type: LandingPageBlockType;
  label: string;
  category: "Foundation" | "Action" | "Content";
  icon: string;
  description: string;
}> = [
  {
    type: "hero",
    label: "Hero Header",
    category: "Foundation",
    icon: "solar:crown-star-bold",
    description: "Prominent header with headline, eyebrow, actions, and media.",
  },
  {
    type: "text",
    label: "Text & Copy",
    category: "Foundation",
    icon: "solar:text-bold",
    description: "Rich announcement copy, paragraphs, or instructions.",
  },
  {
    type: "image",
    label: "Image Asset",
    category: "Foundation",
    icon: "solar:gallery-bold",
    description: "Visual banner, photo, or brand graphic.",
  },
  {
    type: "button",
    label: "CTA Button",
    category: "Foundation",
    icon: "solar:cursor-square-bold",
    description: "Primary action trigger (URL, Call, Email, WhatsApp).",
  },
  {
    type: "divider",
    label: "Divider",
    category: "Foundation",
    icon: "solar:minimize-square-linear",
    description: "Visual separation line with customizable spacing.",
  },
  {
    type: "link_list",
    label: "Link List",
    category: "Action",
    icon: "solar:link-circle-bold",
    description: "Multi-link navigation cards with Iconify icons.",
  },
  {
    type: "file_download",
    label: "File Attachment",
    category: "Action",
    icon: "solar:file-download-bold",
    description: "Direct document download (PDF, Brochure, Menu).",
  },
  {
    type: "social_links",
    label: "Social Icons",
    category: "Content",
    icon: "solar:share-circle-bold",
    description: "Icon row for Instagram, YouTube, LinkedIn, X, and channels.",
  },
  {
    type: "contact_card",
    label: "Contact Card",
    category: "Content",
    icon: "solar:user-id-bold",
    description: "Executive card with quick call, email, and location.",
  },
];

const PRESETS: LandingPageThemePresetName[] = [
  "Ember Editorial",
  "Warm Paper",
  "Graphite Signal",
  "Midnight Route",
  "Sunlit Minimal",
  "Mono Terminal",
];

export function StructurePanel({
  document,
  selectedBlockId,
  onSelectBlock,
  onAddBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onToggleBlockVisibility,
  onUpdateTheme,
  onApplyThemePreset,
}: StructurePanelProps) {
  const [activeTab, setActiveTab] = useState<"blocks" | "layers" | "theme">("blocks");
  const blocks = document.blocks || [];

  return (
    <aside className="w-80 h-full border-r border-border/60 bg-card flex flex-col shrink-0 select-none overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="flex flex-col h-full"
      >
        <div className="p-2 border-b border-border/60 shrink-0">
          <TabsList className="grid grid-cols-3 w-full h-8 text-xs">
            <TabsTrigger value="blocks" className="gap-1.5 text-xs">
              <NxtqrIcon icon="solar:widget-add-linear" size={14} />
              <span>Blocks</span>
            </TabsTrigger>
            <TabsTrigger value="layers" className="gap-1.5 text-xs">
              <NxtqrIcon icon="solar:layers-linear" size={14} />
              <span>Layers ({blocks.length})</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-1.5 text-xs">
              <NxtqrIcon icon="solar:pallete-2-linear" size={14} />
              <span>Theme</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. BLOCKS LIBRARY */}
        <TabsContent value="blocks" className="flex-1 overflow-y-auto p-4 space-y-5 m-0">
          {(["Foundation", "Action", "Content"] as const).map((cat) => {
            const catBlocks = BLOCK_DEFINITIONS.filter((b) => b.category === cat);
            return (
              <div key={cat} className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {cat}
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {catBlocks.map((b) => (
                    <button
                      key={b.type}
                      type="button"
                      onClick={() => onAddBlock(b.type)}
                      className="w-full p-2.5 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/60 hover:border-primary/40 text-left transition-all flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-background border border-border/60 flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-colors">
                        <NxtqrIcon icon={b.icon} size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            {b.label}
                          </span>
                          <NxtqrIcon
                            icon="solar:add-circle-linear"
                            size={14}
                            className="text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-normal">
                          {b.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* 2. LAYERS / STRUCTURE */}
        <TabsContent value="layers" className="flex-1 overflow-y-auto p-3 space-y-1.5 m-0">
          {blocks.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
              <NxtqrIcon icon="solar:layers-minimalistic-linear" size={24} className="mb-2 opacity-50" />
              <p className="text-xs font-semibold">No sections added yet</p>
              <p className="text-[11px] mt-1">Add blocks from the Blocks tab to build your page.</p>
            </div>
          ) : (
            blocks.map((block, index) => {
              const isSelected = selectedBlockId === block.id;
              const def = BLOCK_DEFINITIONS.find((d) => d.type === block.type);

              return (
                <div
                  key={block.id}
                  onClick={() => onSelectBlock(block.id)}
                  className={cn(
                    "p-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer group",
                    isSelected
                      ? "border-[#FA520F] bg-[#FA520F]/5 text-foreground font-medium"
                      : "border-border/40 hover:bg-muted/40 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-muted-foreground/60 w-4">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <NxtqrIcon
                      icon={def?.icon || "solar:widget-linear"}
                      size={15}
                      className={isSelected ? "text-[#FA520F]" : "text-muted-foreground"}
                    />
                    <span className="text-xs truncate text-foreground">
                      {def?.label || block.type}
                    </span>
                  </div>

                  {/* Reorder & Action Controls */}
                  <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      title="Toggle Visibility"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBlockVisibility(block.id);
                      }}
                      className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                    >
                      <NxtqrIcon
                        icon={block.visible !== false ? "solar:eye-linear" : "solar:eye-closed-linear"}
                        size={13}
                      />
                    </button>

                    <button
                      type="button"
                      title="Move Up"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveBlock(block.id, "up");
                      }}
                      className="p-1 hover:text-foreground disabled:opacity-20 text-muted-foreground transition-colors"
                    >
                      <NxtqrIcon icon="solar:arrow-up-linear" size={13} />
                    </button>

                    <button
                      type="button"
                      title="Move Down"
                      disabled={index === blocks.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveBlock(block.id, "down");
                      }}
                      className="p-1 hover:text-foreground disabled:opacity-20 text-muted-foreground transition-colors"
                    >
                      <NxtqrIcon icon="solar:arrow-down-linear" size={13} />
                    </button>

                    <button
                      type="button"
                      title="Duplicate"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateBlock(block.id);
                      }}
                      className="p-1 hover:text-foreground text-muted-foreground transition-colors"
                    >
                      <NxtqrIcon icon="solar:copy-linear" size={13} />
                    </button>

                    <button
                      type="button"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBlock(block.id);
                      }}
                      className="p-1 hover:text-destructive text-muted-foreground transition-colors"
                    >
                      <NxtqrIcon icon="solar:trash-bin-trash-linear" size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* 3. THEME & PRESETS */}
        <TabsContent value="theme" className="flex-1 overflow-y-auto p-4 space-y-6 m-0">
          {/* Design Presets */}
          <div className="space-y-2.5">
            <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              NXTQR Signature Presets
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => {
                const def = THEME_PRESET_DEFINITIONS[p as keyof typeof THEME_PRESET_DEFINITIONS];
                const isActive = (document.theme.name || document.theme.preset) === p;

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onApplyThemePreset(p)}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 group cursor-pointer",
                      isActive
                        ? "border-[#FA520F] ring-1 ring-[#FA520F] shadow-xs"
                        : "border-border/60 hover:border-border"
                    )}
                    style={{ backgroundColor: def.backgroundColor }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: def.accentColor }}
                        />
                        <div
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: def.surfaceColor }}
                        />
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FA520F]" />
                      )}
                    </div>
                    <span
                      className="text-xs font-bold leading-tight"
                      style={{ color: def.foregroundColor }}
                    >
                      {p}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography Pairings */}
          <div className="space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Font Pairing
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["sans", "serif", "mono"] as const).map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => onUpdateTheme({ fontPairing: font })}
                  className={cn(
                    "py-1.5 px-2 rounded-lg border text-xs capitalize transition-colors font-medium cursor-pointer",
                    document.theme.fontPairing === font
                      ? "border-[#FA520F] bg-[#FA520F]/10 text-[#FA520F]"
                      : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                  )}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          {/* Button Style */}
          <div className="space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Button Corner Style
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["rounded", "pill", "sharp"] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onUpdateTheme({ buttonStyle: style })}
                  className={cn(
                    "py-1.5 px-2 rounded-lg border text-xs capitalize transition-colors font-medium cursor-pointer",
                    document.theme.buttonStyle === style
                      ? "border-[#FA520F] bg-[#FA520F]/10 text-[#FA520F]"
                      : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Overrides */}
          <div className="space-y-3 pt-3 border-t border-border/60">
            <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Palette Colors
            </Label>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block mb-1 font-medium">Background</span>
                <ColorPicker
                  value={document.theme.backgroundColor}
                  onChange={(hex) => onUpdateTheme({ backgroundColor: hex })}
                  className="w-full justify-between"
                />
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block mb-1 font-medium">Foreground</span>
                <ColorPicker
                  value={document.theme.foregroundColor}
                  onChange={(hex) => onUpdateTheme({ foregroundColor: hex })}
                  className="w-full justify-between"
                />
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block mb-1 font-medium">Accent</span>
                <ColorPicker
                  value={document.theme.accentColor}
                  onChange={(hex) => onUpdateTheme({ accentColor: hex })}
                  className="w-full justify-between"
                />
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block mb-1 font-medium">Surface</span>
                <ColorPicker
                  value={document.theme.surfaceColor}
                  onChange={(hex) => onUpdateTheme({ surfaceColor: hex })}
                  className="w-full justify-between"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
