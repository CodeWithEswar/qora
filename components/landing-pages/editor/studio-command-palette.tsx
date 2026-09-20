"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";
import type { LandingPageBlockType } from "@nxtqr/contracts";

interface StudioCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBlock: (type: LandingPageBlockType) => void;
  onSaveNow: () => void;
  onOpenPublish: () => void;
  onOpenPreview: () => void;
  onOpenSettings: () => void;
  onSetDevice: (device: "phone" | "tablet" | "desktop") => void;
}

interface CommandOption {
  id: string;
  category: "Add Block" | "Actions" | "View";
  label: string;
  icon: string;
  action: () => void;
}

export function StudioCommandPalette({
  open,
  onOpenChange,
  onAddBlock,
  onSaveNow,
  onOpenPublish,
  onOpenPreview,
  onOpenSettings,
  onSetDevice,
}: StudioCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const options: CommandOption[] = [
    {
      id: "save",
      category: "Actions",
      label: "Save Draft Now (Cmd+S)",
      icon: "solar:diskette-bold",
      action: onSaveNow,
    },
    {
      id: "publish",
      category: "Actions",
      label: "Review & Publish Destination",
      icon: "solar:upload-track-bold",
      action: onOpenPublish,
    },
    {
      id: "preview",
      category: "Actions",
      label: "Open Fullscreen Preview",
      icon: "solar:eye-bold",
      action: onOpenPreview,
    },
    {
      id: "settings",
      category: "Actions",
      label: "Destination Settings & SEO",
      icon: "solar:settings-bold",
      action: onOpenSettings,
    },
    {
      id: "add_hero",
      category: "Add Block",
      label: "Add Hero Header",
      icon: "solar:crown-star-bold",
      action: () => onAddBlock("hero"),
    },
    {
      id: "add_text",
      category: "Add Block",
      label: "Add Text Content",
      icon: "solar:text-bold",
      action: () => onAddBlock("text"),
    },
    {
      id: "add_image",
      category: "Add Block",
      label: "Add Image Asset",
      icon: "solar:gallery-bold",
      action: () => onAddBlock("image"),
    },
    {
      id: "add_button",
      category: "Add Block",
      label: "Add CTA Button",
      icon: "solar:cursor-square-bold",
      action: () => onAddBlock("button"),
    },
    {
      id: "add_links",
      category: "Add Block",
      label: "Add Link List",
      icon: "solar:link-circle-bold",
      action: () => onAddBlock("link_list"),
    },
    {
      id: "add_social",
      category: "Add Block",
      label: "Add Social Links",
      icon: "solar:share-circle-bold",
      action: () => onAddBlock("social_links"),
    },
    {
      id: "add_contact",
      category: "Add Block",
      label: "Add Contact Card",
      icon: "solar:user-id-bold",
      action: () => onAddBlock("contact_card"),
    },
    {
      id: "add_file",
      category: "Add Block",
      label: "Add File Attachment",
      icon: "solar:file-download-bold",
      action: () => onAddBlock("file_download"),
    },
    {
      id: "add_divider",
      category: "Add Block",
      label: "Add Divider",
      icon: "solar:minimize-square-linear",
      action: () => onAddBlock("divider"),
    },
    {
      id: "view_phone",
      category: "View",
      label: "Switch to Mobile Viewport (390px)",
      icon: "solar:smartphone-linear",
      action: () => onSetDevice("phone"),
    },
    {
      id: "view_tablet",
      category: "View",
      label: "Switch to Tablet Viewport (768px)",
      icon: "solar:tablet-linear",
      action: () => onSetDevice("tablet"),
    },
    {
      id: "view_desktop",
      category: "View",
      label: "Switch to Desktop Viewport",
      icon: "solar:laptop-linear",
      action: () => onSetDevice("desktop"),
    },
  ];

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase().trim())
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg overflow-hidden border-border/80 shadow-2xl rounded-2xl">
        <div className="flex items-center px-4 border-b border-border/60 bg-card">
          <NxtqrIcon icon="solar:magnifer-linear" size={16} className="text-muted-foreground mr-2 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or block name..."
            className="w-full h-12 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/60">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No commands matching &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.action();
                    onOpenChange(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer text-xs",
                    isSelected
                      ? "bg-[#FA520F]/10 text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <NxtqrIcon
                      icon={item.icon}
                      size={16}
                      className={isSelected ? "text-[#FA520F]" : "text-muted-foreground"}
                    />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground/60">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
