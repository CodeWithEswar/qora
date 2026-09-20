"use client";

import React from "react";
import type { TextBlockProps, LandingPageThemeV1 } from "@nxtqr/contracts";
import { cn } from "@/lib/utils";

interface TextBlockComponentProps {
  props: TextBlockProps;
  theme: LandingPageThemeV1;
}

export function TextBlock({ props, theme }: TextBlockComponentProps) {
  const { content, alignment = "left", size = "base" } = props;

  const sizeClass =
    size === "sm"
      ? "text-xs sm:text-sm"
      : size === "lg"
      ? "text-lg sm:text-xl md:text-2xl font-medium"
      : size === "xl"
      ? "text-xl sm:text-2xl md:text-3xl font-bold"
      : "text-sm sm:text-base md:text-lg";

  return (
    <div
      className={cn(
        "w-full max-w-3xl mx-auto px-4 py-3 sm:py-4 leading-relaxed break-words whitespace-pre-line",
        alignment === "center" && "text-center",
        alignment === "right" && "text-right",
        alignment === "left" && "text-left",
        sizeClass
      )}
      style={{ color: theme.foregroundColor }}
    >
      {content || ""}
    </div>
  );
}
