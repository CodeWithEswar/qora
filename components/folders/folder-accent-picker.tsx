"use client";

import * as React from "react";
import { FolderAccentKey } from "@nxtqr/contracts";
import { FOLDER_ACCENTS } from "@nxtqr/contracts";
import { FOLDER_ACCENT_THEMES } from "./folder-accents";
import { cn } from "@/lib/utils";

export interface FolderAccentPickerProps {
  value: FolderAccentKey;
  onChange: (accent: FolderAccentKey) => void;
  className?: string;
}

export function FolderAccentPicker({
  value,
  onChange,
  className,
}: FolderAccentPickerProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Visual Accent
        </label>
        <span className="text-[11px] font-mono text-muted-foreground/80">
          {FOLDER_ACCENT_THEMES[value]?.label || value}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {FOLDER_ACCENTS.map((key) => {
          const theme = FOLDER_ACCENT_THEMES[key];
          const isSelected = value === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              title={theme.label}
              className={cn(
                "relative group/swatch h-7 w-7 rounded-full flex items-center justify-center transition-all duration-150",
                "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isSelected
                  ? "ring-2 ring-primary ring-offset-2 scale-110 dark:ring-offset-neutral-900"
                  : "hover:scale-105 opacity-80 hover:opacity-100"
              )}
            >
              <span
                className="h-5 w-5 rounded-full shadow-xs border border-white/20"
                style={{ backgroundColor: theme.dotColor }}
              />
              {isSelected && (
                <span className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
