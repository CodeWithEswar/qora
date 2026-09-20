"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export interface NxtqrIconProps {
  icon: string;
  size?: number | string;
  className?: string;
  inline?: boolean;
}

/**
 * NXTQR Centralized Icon Component (Iconify-backed)
 * Standardizes icon sizing, rendering, and accessibility across NXTQR surfaces.
 */
export function NxtqrIcon({
  icon,
  size = 16,
  className,
  inline = false,
}: NxtqrIconProps) {
  return (
    <Icon
      icon={icon}
      width={size}
      height={size}
      inline={inline}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    />
  );
}
