"use client";

import React from "react";
import type { ContactCardBlockProps, LandingPageThemeV1 } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface ContactCardBlockComponentProps {
  props: ContactCardBlockProps;
  theme: LandingPageThemeV1;
  onActionClick?: (actionId: string, actionType: string) => void;
}

export function ContactCardBlock({ props, theme, onActionClick }: ContactCardBlockComponentProps) {
  const { name, role, company, phone, email, website, location, avatarUrl } = props;

  const buttonRadiusClass =
    theme.buttonStyle === "pill"
      ? "rounded-2xl"
      : theme.buttonStyle === "sharp"
      ? "rounded-none"
      : "rounded-xl";

  return (
    <div className="w-full px-4 py-3">
      <div
        className={cn(
          "w-full max-w-xl mx-auto p-5 sm:p-7 flex flex-col items-center text-center border border-black/5 dark:border-white/10 shadow-sm transition-all duration-200",
          buttonRadiusClass
        )}
        style={{
          backgroundColor: theme.surfaceColor,
          color: theme.foregroundColor,
        }}
      >
        {avatarUrl ? (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3.5 border-2 shadow-xs" style={{ borderColor: theme.accentColor }}>
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl mb-3 shadow-xs"
            style={{
              backgroundColor: `${theme.accentColor}20`,
              color: theme.accentColor,
            }}
          >
            {name ? name.slice(0, 2).toUpperCase() : "ID"}
          </div>
        )}

        <h3 className="font-bold text-lg sm:text-xl leading-snug">{name || "Contact"}</h3>
        {(role || company) && (
          <p className="text-xs sm:text-sm opacity-75 mt-0.5">
            {role}
            {role && company && " · "}
            {company}
          </p>
        )}

        {location && (
          <div className="flex items-center gap-1 text-xs sm:text-sm opacity-65 mt-1.5">
            <NxtqrIcon icon="solar:map-point-linear" size={14} />
            <span>{location}</span>
          </div>
        )}

        {/* Quick Communication Actions */}
        <div className="w-full mt-4 sm:mt-6 pt-4 border-t border-black/5 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs sm:text-sm">
          {phone && (
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              onClick={() => onActionClick?.("contact_phone", "call")}
              className={cn(
                "py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors hover:opacity-85",
                "bg-black/5 dark:bg-white/5"
              )}
              style={{ color: theme.foregroundColor }}
            >
              <NxtqrIcon icon="solar:phone-calling-bold" size={15} className="text-primary" />
              <span className="truncate">Call</span>
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              onClick={() => onActionClick?.("contact_email", "email")}
              className={cn(
                "py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors hover:opacity-85",
                "bg-black/5 dark:bg-white/5"
              )}
              style={{ color: theme.foregroundColor }}
            >
              <NxtqrIcon icon="solar:letter-bold" size={15} className="text-primary" />
              <span className="truncate">Email</span>
            </a>
          )}

          {website && (
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onActionClick?.("contact_website", "url")}
              className={cn(
                "py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-colors hover:opacity-85 sm:col-span-2 md:col-span-1",
                "bg-black/5 dark:bg-white/5"
              )}
              style={{ color: theme.foregroundColor }}
            >
              <NxtqrIcon icon="solar:global-bold" size={15} className="text-primary" />
              <span className="truncate">{website.replace(/^https?:\/\//, "")}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
