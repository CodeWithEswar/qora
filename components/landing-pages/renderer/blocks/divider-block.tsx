"use client";

import React from "react";
import type { DividerBlockProps, LandingPageThemeV1 } from "@nxtqr/contracts";
import { cn } from "@/lib/utils";

interface DividerBlockComponentProps {
  props: DividerBlockProps;
  theme: LandingPageThemeV1;
}

export function DividerBlock({ props, theme }: DividerBlockComponentProps) {
  const { style = "solid", spacing = "md" } = props;

  const spacingClass =
    spacing === "none"
      ? "py-0"
      : spacing === "sm"
      ? "py-2"
      : spacing === "lg"
      ? "py-6"
      : "py-4";

  return (
    <div className={cn("w-full px-6 flex items-center justify-center", spacingClass)}>
      <hr
        className={cn(
          "w-full border-t",
          style === "dashed" && "border-dashed",
          style === "dotted" && "border-dotted"
        )}
        style={{ borderColor: `${theme.foregroundColor}20` }}
      />
    </div>
  );
}
