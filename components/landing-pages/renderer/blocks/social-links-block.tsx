"use client";

import React from "react";
import type { SocialLinksBlockProps, LandingPageThemeV1 } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface SocialLinksBlockComponentProps {
  props: SocialLinksBlockProps;
  theme: LandingPageThemeV1;
  onActionClick?: (actionId: string, actionType: string) => void;
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "simple-icons:instagram",
  youtube: "simple-icons:youtube",
  linkedin: "simple-icons:linkedin",
  x: "simple-icons:x",
  facebook: "simple-icons:facebook",
  tiktok: "simple-icons:tiktok",
  whatsapp: "simple-icons:whatsapp",
  telegram: "simple-icons:telegram",
  github: "simple-icons:github",
  website: "solar:global-bold",
};

export function SocialLinksBlock({ props, theme, onActionClick }: SocialLinksBlockComponentProps) {
  const { items = [] } = props;
  const activeItems = items.filter((i) => i.enabled !== false && Boolean(i.url));

  if (activeItems.length === 0) return null;

  return (
    <div className="w-full px-4 py-4 sm:py-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5">
      {activeItems.map((item, idx) => {
        const iconName = PLATFORM_ICONS[item.platform] || "solar:link-bold";
        const safeUrl =
          item.url.startsWith("http://") || item.url.startsWith("https://")
            ? item.url
            : `https://${item.url}`;

        return (
          <a
            key={`${item.platform}_${idx}`}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onActionClick?.(`social_${item.platform}`, "url")}
            aria-label={item.platform}
            className={cn(
              "w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-full flex items-center justify-center transition-all duration-200 border border-black/5 dark:border-white/10 shadow-xs hover:-translate-y-1 hover:shadow-md active:scale-95"
            )}
            style={{
              backgroundColor: theme.surfaceColor,
              color: theme.foregroundColor,
            }}
          >
            <NxtqrIcon icon={iconName} size={20} />
          </a>
        );
      })}
    </div>
  );
}
