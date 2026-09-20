"use client";

import React from "react";
import type { LandingPageDocumentV1, LandingPageBlockV1 } from "@nxtqr/contracts";
import { HeroBlock } from "./blocks/hero-block";
import { TextBlock } from "./blocks/text-block";
import { ImageBlock } from "./blocks/image-block";
import { ButtonBlock } from "./blocks/button-block";
import { LinkListBlock } from "./blocks/link-list-block";
import { SocialLinksBlock } from "./blocks/social-links-block";
import { ContactCardBlock } from "./blocks/contact-card-block";
import { FileDownloadBlock } from "./blocks/file-download-block";
import { DividerBlock } from "./blocks/divider-block";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface LandingPageRendererProps {
  document: LandingPageDocumentV1;
  device?: "phone" | "tablet" | "desktop";
  mode?: "editor" | "preview" | "public";
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
  onActionClick?: (actionId: string, actionType: string) => void;
  onMoveBlock?: (blockId: string, direction: "up" | "down") => void;
  onDuplicateBlock?: (blockId: string) => void;
  onDeleteBlock?: (blockId: string) => void;
  className?: string;
}

export function LandingPageRenderer({
  document,
  device,
  mode = "public",
  selectedBlockId,
  onSelectBlock,
  onActionClick,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  className,
}: LandingPageRendererProps) {
  const { theme, blocks = [] } = document;
  const isEditor = mode === "editor";

  // Filter visible blocks for public/preview
  const renderedBlocks = isEditor
    ? blocks
    : blocks.filter((b) => b.visible !== false);

  const fontStyle =
    theme.fontPairing === "serif" || theme.fontPairing === "editorial"
      ? "font-serif"
      : theme.fontPairing === "mono" || theme.fontPairing === "terminal"
      ? "font-mono"
      : "font-sans";

  const bg = theme.backgroundColor || theme.background || "#FFFDF7";
  const fg = theme.foregroundColor || theme.text || "#1F1F1F";

  return (
    <div
      className={cn(
        "min-h-full w-full flex flex-col items-center select-text transition-colors duration-200",
        fontStyle,
        className
      )}
      style={{
        backgroundColor: bg,
        color: fg,
      }}
    >
      <div
        className={cn(
          "w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto flex flex-col py-6 sm:py-8 md:py-12 transition-all duration-300",
          isEditor && "px-3 sm:px-4"
        )}
      >
        {renderedBlocks.length === 0 ? (
          <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center opacity-40">
            <NxtqrIcon icon="solar:widget-add-linear" size={32} className="mb-2" />
            <p className="text-sm font-medium">Your destination starts here</p>
            <p className="text-xs mt-1">Add a block from the left panel to begin building</p>
          </div>
        ) : (
          renderedBlocks.map((block, index) => {
            const isSelected = isEditor && selectedBlockId === block.id;

            return (
              <div
                key={block.id}
                onClick={(e) => {
                  if (isEditor) {
                    e.stopPropagation();
                    onSelectBlock?.(block.id);
                  }
                }}
                className={cn(
                  "relative group/block transition-all",
                  isEditor && "cursor-pointer my-1 rounded-2xl",
                  isSelected && "ring-2 ring-inset ring-[#FA520F] shadow-sm z-20"
                )}
              >
                {/* Floating Editor Controls Toolbar */}
                {isSelected && (
                  <div
                    className={cn(
                      "absolute right-2 z-30 flex items-center gap-1 bg-zinc-900/95 backdrop-blur-md text-white px-2 py-1 rounded-lg shadow-xl ring-1 ring-white/15 text-xs font-mono select-none",
                      index === 0 ? "top-2" : "-top-8.5"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] text-zinc-400 uppercase mr-1">
                      {block.type.replace("_", " ")}
                    </span>
                    <button
                      type="button"
                      title="Move Up"
                      disabled={index === 0}
                      onClick={() => onMoveBlock?.(block.id, "up")}
                      className="p-1 hover:text-[#FA520F] disabled:opacity-30 transition-colors"
                    >
                      <NxtqrIcon icon="solar:arrow-up-linear" size={14} />
                    </button>
                    <button
                      type="button"
                      title="Move Down"
                      disabled={index === renderedBlocks.length - 1}
                      onClick={() => onMoveBlock?.(block.id, "down")}
                      className="p-1 hover:text-[#FA520F] disabled:opacity-30 transition-colors"
                    >
                      <NxtqrIcon icon="solar:arrow-down-linear" size={14} />
                    </button>
                    <button
                      type="button"
                      title="Duplicate Block"
                      onClick={() => onDuplicateBlock?.(block.id)}
                      className="p-1 hover:text-[#FA520F] transition-colors"
                    >
                      <NxtqrIcon icon="solar:copy-linear" size={14} />
                    </button>
                    <button
                      type="button"
                      title="Delete Block"
                      onClick={() => onDeleteBlock?.(block.id)}
                      className="p-1 hover:text-red-400 transition-colors text-red-500"
                    >
                      <NxtqrIcon icon="solar:trash-bin-trash-linear" size={14} />
                    </button>
                  </div>
                )}

                {/* Render Block by Type */}
                {renderBlockContent(block, theme, device, onActionClick)}
              </div>
            );
          })
        )}

        {/* Minimal Footer Badge on public / preview */}
        <div className="w-full mt-8 pt-6 pb-4 flex items-center justify-center text-center opacity-40 hover:opacity-80 transition-opacity">
          <a
            href="https://nxtqr.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wider"
            style={{ color: fg }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#FA520F]" />
            <span>POWERED BY NXTQR</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function renderBlockContent(
  block: LandingPageBlockV1,
  theme: LandingPageDocumentV1["theme"],
  device?: "phone" | "tablet" | "desktop",
  onActionClick?: (actionId: string, actionType: string) => void
) {
  switch (block.type) {
    case "hero":
      return <HeroBlock props={block.props as any} theme={theme} onActionClick={onActionClick} />;
    case "text":
      return <TextBlock props={block.props as any} theme={theme} />;
    case "image":
      return <ImageBlock props={block.props as any} theme={theme} />;
    case "button":
      return <ButtonBlock props={block.props as any} theme={theme} onActionClick={onActionClick} />;
    case "link_list":
      return <LinkListBlock props={block.props as any} theme={theme} device={device} onActionClick={onActionClick} />;
    case "social_links":
      return <SocialLinksBlock props={block.props as any} theme={theme} onActionClick={onActionClick} />;
    case "contact_card":
      return <ContactCardBlock props={block.props as any} theme={theme} onActionClick={onActionClick} />;
    case "file_download":
      return <FileDownloadBlock props={block.props as any} theme={theme} onActionClick={onActionClick} />;
    case "divider":
      return <DividerBlock props={block.props as any} theme={theme} />;
    default:
      return null;
  }
}
