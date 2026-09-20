"use client";

import React from "react";
import type { LandingPageDocumentV1 } from "@nxtqr/contracts";
import { LandingPageRenderer } from "../renderer/landing-page-renderer";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface DeviceCanvasProps {
  document: LandingPageDocumentV1;
  device: "phone" | "tablet" | "desktop";
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string | null) => void;
  onMoveBlock: (blockId: string, direction: "up" | "down") => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
}

export function DeviceCanvas({
  document,
  device,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
}: DeviceCanvasProps) {
  const isPhone = device === "phone";
  const isTablet = device === "tablet";
  const isDesktop = device === "desktop";

  return (
    <main
      className="flex-1 h-full bg-[#121212]/5 dark:bg-[#0A0A0A] overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-start relative select-none"
      onClick={() => onSelectBlock(null)}
    >
      {/* Technical Viewport Spec Header */}
      <div className="mb-3 text-[11px] font-mono text-muted-foreground flex items-center gap-2 select-none">
        <NxtqrIcon
          icon={
            isPhone
              ? "solar:smartphone-linear"
              : isTablet
              ? "solar:tablet-linear"
              : "solar:laptop-linear"
          }
          size={13}
          className="text-[#FA520F]"
        />
        <span>
          {isPhone
            ? "390 × 844 (Mobile-First Viewport)"
            : isTablet
            ? "768 × 1024 (Tablet Viewport)"
            : "Responsive Desktop (100%)"}
        </span>
      </div>

      {/* Frame Container */}
      <div
        className={cn(
          "transition-all duration-300 w-full flex flex-col items-center",
          isPhone && "max-w-[390px] min-h-[780px]",
          isTablet && "max-w-[768px] min-h-[820px]",
          isDesktop && "w-full max-w-5xl min-h-[820px]"
        )}
      >
        <div
          className={cn(
            "w-full rounded-[36px] bg-card border-[6px] border-[#222222] dark:border-[#1E1E1E] shadow-2xl overflow-hidden flex flex-col transition-all",
            isDesktop && "rounded-2xl border-2 border-border/80 shadow-xl"
          )}
          style={{ minHeight: isPhone ? "780px" : "800px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Speaker / Camera Notch for phone */}
          {isPhone && (
            <div className="h-6 w-full flex items-center justify-center shrink-0 bg-transparent z-20 pt-1.5">
              <div className="w-20 h-4 rounded-full bg-black/80 dark:bg-black/90 flex items-center justify-end px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>
          )}

          {/* Desktop minimal browser chrome */}
          {isDesktop && (
            <div className="h-8 border-b border-border/40 bg-muted/40 px-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex-1 text-center text-[10px] font-mono text-muted-foreground truncate">
                nxtqr.vercel.app/p/{document.seo?.title ? document.seo.title.toLowerCase().replace(/\s+/g, "-") : "destination"}
              </div>
            </div>
          )}

          {/* Render Active Document */}
          <div className="flex-1 w-full overflow-y-auto">
            <LandingPageRenderer
              document={document}
              device={device}
              mode="editor"
              selectedBlockId={selectedBlockId}
              onSelectBlock={onSelectBlock}
              onMoveBlock={onMoveBlock}
              onDuplicateBlock={onDuplicateBlock}
              onDeleteBlock={onDeleteBlock}
            />
          </div>

          {/* Bottom Home Indicator on phone */}
          {isPhone && (
            <div className="h-5 w-full flex items-center justify-center shrink-0 bg-transparent z-20 pb-1">
              <div className="w-28 h-1 rounded-full bg-black/20 dark:bg-white/20" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
