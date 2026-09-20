"use client";

import React from "react";
import type { ButtonBlockProps, LandingPageThemeV1 } from "@nxtqr/contracts";
import { cn } from "@/lib/utils";

interface ButtonBlockComponentProps {
  props: ButtonBlockProps;
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

export function ButtonBlock({ props, theme, onActionClick }: ButtonBlockComponentProps) {
  const { label = "Take Action", url = "#", actionType = "url", variant = "primary" } = props;

  const buttonRadiusClass =
    theme.buttonStyle === "pill"
      ? "rounded-full"
      : theme.buttonStyle === "sharp"
      ? "rounded-none"
      : "rounded-xl";

  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isOutline = variant === "outline";

  return (
    <div className="w-full px-4 py-2 flex items-center justify-center">
      <a
        href={getSafeHref(url, actionType)}
        onClick={() => onActionClick?.("btn_action", actionType)}
        className={cn(
          "w-full max-w-md py-3.5 sm:py-4 px-6 text-sm sm:text-base font-semibold text-center inline-flex items-center justify-center transition-all duration-150 active:scale-[0.99] shadow-sm",
          buttonRadiusClass,
          isOutline && "border bg-transparent"
        )}
        style={{
          backgroundColor: isPrimary
            ? theme.accentColor
            : isSecondary
            ? theme.surfaceColor
            : "transparent",
          color: isPrimary
            ? "#FFFFFF"
            : theme.foregroundColor,
          borderColor: isOutline ? `${theme.foregroundColor}40` : "transparent",
        }}
      >
        {label}
      </a>
    </div>
  );
}
