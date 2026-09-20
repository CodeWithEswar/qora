"use client";

import React from "react";
import type { LinkListBlockProps, LandingPageThemeV1 } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface LinkListBlockComponentProps {
  props: LinkListBlockProps;
  theme: LandingPageThemeV1;
  device?: "phone" | "tablet" | "desktop";
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

export function LinkListBlock({ props, theme, device, onActionClick }: LinkListBlockComponentProps) {
  const { items = [], columns = "auto", alignment = "left" } = props;
  const activeItems = items.filter((i) => i.enabled !== false);
  const isPhone = device === "phone";
  const isTabletOrDesktop = device === "tablet" || device === "desktop";

  // Determine grid layout:
  // "1": always 1 column
  // "2": 2 columns on tablet/desktop, 1 column on phone
  // "auto": 1 column on phone, 2 columns on tablet/desktop, or responsive on public
  const isSingleColumn =
    columns === "1" ||
    (isPhone && columns !== "2") ||
    (isPhone && columns === "auto");

  const isTwoColumns =
    !isSingleColumn &&
    (columns === "2" || (columns === "auto" && isTabletOrDesktop));

  const isCentered = alignment === "center";

  const buttonRadiusClass =
    theme.buttonStyle === "pill"
      ? "rounded-2xl"
      : theme.buttonStyle === "sharp"
      ? "rounded-none"
      : "rounded-xl";

  if (activeItems.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-full px-4 py-2.5",
        isSingleColumn
          ? "flex flex-col gap-2.5"
          : isTwoColumns
          ? "grid grid-cols-2 gap-3 items-stretch"
          : "grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch"
      )}
    >
      {activeItems.map((item, idx) => {
        // If 2 columns and odd total items, the last item spans both columns for clean symmetry
        const isLastOdd =
          activeItems.length % 2 !== 0 &&
          idx === activeItems.length - 1 &&
          !isSingleColumn;

        return (
          <a
            key={item.id}
            href={getSafeHref(item.url, item.actionType || "url")}
            onClick={() => onActionClick?.(item.id, item.actionType || "url")}
            className={cn(
              "group relative w-full h-full p-3.5 sm:p-4 border border-black/5 dark:border-white/10 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99]",
              isCentered
                ? "flex flex-col items-center justify-center text-center gap-2.5 py-5"
                : "flex items-center justify-between gap-3",
              isLastOdd && "col-span-2",
              buttonRadiusClass
            )}
            style={{
              backgroundColor: theme.surfaceColor,
              color: theme.foregroundColor,
            }}
          >
            {isCentered ? (
              // Centered Card Layout
              <>
                {item.icon ? (
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-xs"
                    style={{
                      backgroundColor: `${theme.accentColor}18`,
                      color: theme.accentColor,
                    }}
                  >
                    <NxtqrIcon icon={item.icon} size={22} />
                  </div>
                ) : (
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                )}

                <div className="flex flex-col items-center min-w-0 text-center px-1">
                  <span className="text-sm font-semibold truncate max-w-full group-hover:underline">
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="text-xs opacity-70 line-clamp-2 mt-0.5 font-normal">
                      {item.description}
                    </span>
                  )}
                </div>

                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 opacity-40 group-hover:opacity-100 transition-opacity mt-1"
                  style={{ color: theme.foregroundColor }}
                >
                  <NxtqrIcon icon="solar:arrow-right-up-linear" size={15} />
                </div>
              </>
            ) : (
              // Standard Left-Aligned Card Layout
              <>
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  {item.icon ? (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs"
                      style={{
                        backgroundColor: `${theme.accentColor}18`,
                        color: theme.accentColor,
                      }}
                    >
                      <NxtqrIcon icon={item.icon} size={20} />
                    </div>
                  ) : (
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  )}
                  <div className="flex flex-col min-w-0 flex-1 text-left">
                    <span className="text-sm font-semibold truncate group-hover:underline">
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="text-xs opacity-70 truncate mt-0.5 font-normal">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ color: theme.foregroundColor }}
                >
                  <NxtqrIcon icon="solar:arrow-right-up-linear" size={16} />
                </div>
              </>
            )}
          </a>
        );
      })}
    </div>
  );
}
