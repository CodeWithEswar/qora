"use client";

import React from "react";
import type { ImageBlockProps, LandingPageThemeV1 } from "@nxtqr/contracts";
import { cn } from "@/lib/utils";

interface ImageBlockComponentProps {
  props: ImageBlockProps;
  theme: LandingPageThemeV1;
}

export function ImageBlock({ props, theme }: ImageBlockComponentProps) {
  const { url, alt, caption, aspectRatio = "auto" } = props;

  if (!url) {
    return (
      <div className="w-full px-4 py-3">
        <div
          className="w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 opacity-50"
          style={{ borderColor: `${theme.foregroundColor}30`, color: theme.foregroundColor }}
        >
          <span className="text-xs font-medium">Image asset not configured</span>
        </div>
      </div>
    );
  }

  const aspectClass =
    aspectRatio === "1:1"
      ? "aspect-square object-cover"
      : aspectRatio === "16:9"
      ? "aspect-video object-cover"
      : aspectRatio === "4:3"
      ? "aspect-[4/3] object-cover"
      : aspectRatio === "3:2"
      ? "aspect-[3/2] object-cover"
      : "w-full h-auto object-contain max-h-96";

  return (
    <figure className="w-full px-4 py-3 flex flex-col items-center">
      <div className="w-full overflow-hidden rounded-2xl shadow-sm">
        <img
          src={url}
          alt={alt || "Destination Asset"}
          className={cn("w-full transition-transform hover:scale-[1.01] duration-300", aspectClass)}
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption
          className="mt-2 text-xs opacity-75 text-center font-normal"
          style={{ color: theme.foregroundColor }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
