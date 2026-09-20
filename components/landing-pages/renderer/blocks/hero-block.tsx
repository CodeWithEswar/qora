"use client";

import React from "react";
import type { HeroBlockProps, LandingPageThemeV1 } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface HeroBlockComponentProps {
  props: HeroBlockProps;
  theme: LandingPageThemeV1;
  onActionClick?: (actionId: string, actionType: string) => void;
}

function getSafeHref(url: string, actionType: string): string {
  if (!url) return "#";
  if (actionType === "call") return `tel:${url.replace(/[^0-9+]/g, "")}`;
  if (actionType === "email") return `mailto:${url}`;
  if (actionType === "whatsapp") return `https://wa.me/${url.replace(/[^0-9]/g, "")}`;
  if (actionType === "sms") return `sms:${url.replace(/[^0-9+]/g, "")}`;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  return `https://${url}`;
}

export function HeroBlock({ props, theme, onActionClick }: HeroBlockComponentProps) {
  const { eyebrow, title, description, imageUrl, imageAlt, layout = "centered", primaryAction, secondaryAction } = props;

  const buttonRadiusClass =
    theme.buttonStyle === "pill"
      ? "rounded-full"
      : theme.buttonStyle === "sharp"
      ? "rounded-none"
      : "rounded-xl";

  const isSplit = layout === "split";
  const isImageFirst = layout === "image-first";
  const isEditorial = layout === "editorial";
  const isMinimal = layout === "minimal";

  return (
    <div
      className={cn(
        "w-full transition-all duration-200",
        isSplit ? "flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 text-left" : "flex flex-col",
        layout === "centered" && "text-center items-center",
        layout === "editorial" && "text-left items-start",
        layout === "minimal" && "text-center items-center py-2",
        "py-6 sm:py-8 md:py-12 px-4 sm:px-6"
      )}
    >
      {/* Image if image-first */}
      {isImageFirst && imageUrl && (
        <div className="w-full mb-6 overflow-hidden rounded-2xl md:rounded-3xl shadow-sm max-h-72 md:max-h-96">
          <img
            src={imageUrl}
            alt={imageAlt || title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Text Container */}
      <div className={cn("w-full flex flex-col", layout === "centered" ? "items-center" : "items-start")}>
        {eyebrow && !isMinimal && (
          <span
            className="text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2 sm:mb-3 inline-block px-3 py-1 rounded-full"
            style={{
              backgroundColor: `${theme.accentColor}20`,
              color: theme.accentColor,
            }}
          >
            {eyebrow}
          </span>
        )}

        <h1
          className={cn(
            "font-extrabold tracking-tight leading-tight",
            isMinimal
              ? "text-xl sm:text-2xl"
              : isEditorial
              ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
          )}
          style={{ color: theme.foregroundColor }}
        >
          {title || "Welcome"}
        </h1>

        {description && (
          <p
            className={cn(
              "mt-2.5 sm:mt-4 text-sm sm:text-base md:text-lg leading-relaxed opacity-85 max-w-2xl",
              layout === "centered" && "mx-auto text-center"
            )}
            style={{ color: theme.foregroundColor }}
          >
            {description}
          </p>
        )}

        {/* Action Buttons */}
        {(primaryAction || secondaryAction) && (
          <div
            className={cn(
              "mt-5 sm:mt-7 flex flex-wrap gap-3 sm:gap-4 w-full",
              layout === "centered" ? "justify-center" : "justify-start"
            )}
          >
            {primaryAction?.label && (
              <a
                href={getSafeHref(primaryAction.url, primaryAction.actionType || "url")}
                onClick={() => onActionClick?.("primary_hero_cta", primaryAction.actionType || "url")}
                className={cn(
                  "px-5 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-transform active:scale-[0.98] shadow-sm",
                  buttonRadiusClass
                )}
                style={{
                  backgroundColor: theme.accentColor,
                  color: "#FFFFFF",
                }}
              >
                {primaryAction.label}
              </a>
            )}

            {secondaryAction?.label && (
              <a
                href={getSafeHref(secondaryAction.url, secondaryAction.actionType || "url")}
                onClick={() => onActionClick?.("secondary_hero_cta", secondaryAction.actionType || "url")}
                className={cn(
                  "px-5 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold inline-flex items-center justify-center border transition-colors active:scale-[0.98]",
                  buttonRadiusClass
                )}
                style={{
                  borderColor: `${theme.foregroundColor}30`,
                  color: theme.foregroundColor,
                  backgroundColor: `${theme.surfaceColor}60`,
                }}
              >
                {secondaryAction.label}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Image if not image-first */}
      {!isImageFirst && imageUrl && !isMinimal && (
        <div
          className={cn(
            "overflow-hidden rounded-2xl md:rounded-3xl shadow-sm mt-6",
            isSplit ? "w-full md:w-1/2 mt-0 max-h-72 md:max-h-96" : "w-full max-h-72 md:max-h-96"
          )}
        >
          <img
            src={imageUrl}
            alt={imageAlt || title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
