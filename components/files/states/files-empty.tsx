"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";

interface FilesEmptyProps {
  onUploadClick: () => void;
}

export function FilesEmpty({ onUploadClick }: FilesEmptyProps) {
  return (
    <div className="w-full py-20 px-4 flex flex-col items-center justify-center text-center select-none">
      {/* Signature NXTQR "F" QR-Module Monogram */}
      <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
        {/* Module Matrix assembling the letter "F" */}
        <div className="grid grid-cols-5 grid-rows-5 gap-1.5 p-3 rounded-2xl bg-muted/40 border border-border/60 shadow-inner">
          {/* Row 1: Full top bar */}
          <div className="w-3 h-3 rounded-xs bg-[#FA520F] animate-pulse" />
          <div className="w-3 h-3 rounded-xs bg-[#FA520F]" />
          <div className="w-3 h-3 rounded-xs bg-[#FA520F]" />
          <div className="w-3 h-3 rounded-xs bg-[#FA520F]" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/30" />

          {/* Row 2: Stem only */}
          <div className="w-3 h-3 rounded-xs bg-[#FA520F]" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />

          {/* Row 3: Mid bar */}
          <div className="w-3 h-3 rounded-xs bg-[#FA520F]" />
          <div className="w-3 h-3 rounded-xs bg-[#FA520F]" />
          <div className="w-3 h-3 rounded-xs bg-[#FA520F]" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />

          {/* Row 4: Stem only */}
          <div className="w-3 h-3 rounded-xs bg-[#FA520F]" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />

          {/* Row 5: Stem bottom */}
          <div className="w-3 h-3 rounded-xs bg-[#FA520F]" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />
          <div className="w-3 h-3 rounded-xs bg-muted-foreground/15" />
        </div>

        {/* Ambient Signal Ring */}
        <div className="absolute inset-0 rounded-3xl border border-[#FA520F]/20 animate-ping opacity-30 pointer-events-none" />
      </div>

      <h3 className="text-xl font-bold font-serif tracking-tight text-foreground sm:text-2xl">
        Your asset infrastructure starts here.
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mt-2 mb-6">
        Upload images, brand logos, documents, and media to connect seamlessly across your QR codes, landing pages, and campaigns.
      </p>

      <Button
        onClick={onUploadClick}
        className="bg-[#FA520F] hover:bg-[#FA520F]/90 text-white gap-2 font-medium shadow-md transition-all hover:shadow-lg active:scale-95"
      >
        <NxtqrIcon icon="solar:upload-track-linear" size={17} />
        <span>Upload Files</span>
      </Button>
    </div>
  );
}
