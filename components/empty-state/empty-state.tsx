"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrEmptyMonogram } from "./qr-empty-monogram";
import {
  EMPTY_STATE_PRESETS,
  EmptyStatePreset,
  getInitial,
} from "./empty-state-presets";
import { cn } from "@/lib/utils";

export type EmptyStateVariant = "page" | "card" | "table" | "filtered";

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface EmptyStateProps {
  /** Optional preset name from EMPTY_STATE_PRESETS */
  preset?: keyof typeof EMPTY_STATE_PRESETS;
  /** The module name, e.g. "QR Codes", "Campaigns", "Analytics" */
  module?: string;
  /** Explicit override for the letter monogram */
  letter?: string;
  initial?: string;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Visual variant: "page" (lg), "table" (md), "card" (sm), "filtered" (sm) */
  variant?: EmptyStateVariant;
  /** Primary action object */
  action?: EmptyStateAction;
  /** Backward-compatible action properties */
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  /** Optional secondary action slot */
  secondaryAction?: React.ReactNode;
  /** Legacy icon override (superseded by QR monogram unless explicitly passed) */
  icon?: React.ReactNode;
  /** Custom delay offset in ms */
  staggerBaseDelay?: number;
  /** Additional CSS class names */
  className?: string;
}

export function EmptyState({
  preset,
  module,
  letter,
  initial,
  title,
  description,
  variant = "table",
  action,
  actionLabel,
  onAction,
  actionHref,
  secondaryAction,
  icon,
  staggerBaseDelay,
  className,
}: EmptyStateProps) {
  // Resolve preset data if provided
  const presetData: Partial<EmptyStatePreset> = preset
    ? EMPTY_STATE_PRESETS[preset] || {}
    : {};

  const resolvedModule = module || presetData.module || "NXTQR";
  const resolvedLetter =
    letter || initial || presetData.letter || getInitial(resolvedModule);
  const resolvedTitle = title || presetData.title || "No data yet";
  const resolvedDescription =
    description ||
    presetData.description ||
    "Records will appear here once activity begins.";

  // Resolve actions
  const primaryLabel = action?.label || actionLabel || presetData.actionLabel;
  const primaryOnClick = action?.onClick || onAction;
  const primaryHref = action?.href || actionHref;
  const hasPrimaryAction = Boolean(primaryLabel && (primaryOnClick || primaryHref));

  // Determine monogram size based on variant
  const monogramSize: "sm" | "md" | "lg" =
    variant === "page" ? "lg" : variant === "card" || variant === "filtered" ? "sm" : "md";

  const delay =
    staggerBaseDelay !== undefined
      ? staggerBaseDelay
      : presetData.staggerBaseDelay || 0;

  // Render variant styles
  const isPage = variant === "page";
  const isCard = variant === "card" || variant === "filtered";

  return (
    <section
      aria-label={resolvedTitle}
      className={cn(
        "flex flex-col items-center justify-center text-center select-none",
        isPage && "py-16 sm:py-24 px-4 max-w-md mx-auto",
        variant === "table" && "py-10 px-4 sm:px-6 w-full",
        isCard && "py-5 px-3 w-full",
        className
      )}
    >
      {/* Visual Monogram */}
      <div
        className={cn(
          "transition-transform duration-300",
          isPage && "mb-5 hover:scale-[1.03]",
          variant === "table" && "mb-4 hover:scale-[1.03]",
          isCard && "mb-2.5"
        )}
      >
        {icon ? (
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-elevated border border-border text-muted-foreground">
            {icon}
          </div>
        ) : (
          <QrEmptyMonogram
            letter={resolvedLetter}
            size={monogramSize}
            staggerBaseDelay={delay}
          />
        )}
      </div>

      {/* Copy */}
      <div className="space-y-1 max-w-sm">
        <h3
          className={cn(
            "font-semibold text-foreground tracking-tight",
            isPage && "text-lg sm:text-xl",
            variant === "table" && "text-sm sm:text-base",
            isCard && "text-xs"
          )}
        >
          {resolvedTitle}
        </h3>
        <p
          className={cn(
            "text-muted-foreground leading-relaxed",
            isPage && "text-xs sm:text-sm max-w-xs sm:max-w-sm",
            variant === "table" && "text-xs max-w-xs",
            isCard && "text-[11px] max-w-[220px]"
          )}
        >
          {resolvedDescription}
        </p>
      </div>

      {/* Call to action buttons */}
      {(hasPrimaryAction || secondaryAction) && (
        <div
          className={cn(
            "flex items-center justify-center gap-2.5",
            isPage && "mt-6",
            variant === "table" && "mt-4",
            isCard && "mt-3"
          )}
        >
          {hasPrimaryAction && primaryHref && (
            <Button
              size="sm"
              className={cn(
                "gap-1.5 transition-all",
                isCard && "h-7 text-[11px] px-2.5",
                isPage && "text-xs px-4 h-9 shadow-xs"
              )}
              asChild
            >
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
          )}

          {hasPrimaryAction && !primaryHref && (
            <Button
              size="sm"
              onClick={primaryOnClick}
              variant={variant === "filtered" ? "outline" : "default"}
              className={cn(
                "gap-1.5 transition-all",
                isCard && "h-7 text-[11px] px-2.5",
                isPage && "text-xs px-4 h-9 shadow-xs"
              )}
            >
              {primaryLabel}
            </Button>
          )}

          {secondaryAction}
        </div>
      )}
    </section>
  );
}
