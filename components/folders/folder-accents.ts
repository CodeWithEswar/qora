import { FolderAccentKey } from "@nxtqr/contracts";

export interface FolderAccentTheme {
  key: FolderAccentKey;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  glowColor: string;
  borderHover: string;
}

export const FOLDER_ACCENT_THEMES: Record<FolderAccentKey, FolderAccentTheme> = {
  Ember: {
    key: "Ember",
    label: "Ember",
    dotColor: "#FA520F",
    badgeBg: "bg-[#FA520F]/10 dark:bg-[#FA520F]/15",
    badgeText: "text-[#FA520F]",
    glowColor: "rgba(250, 82, 15, 0.12)",
    borderHover: "hover:border-[#FA520F]/40",
  },
  Amber: {
    key: "Amber",
    label: "Amber",
    dotColor: "#F59E0B",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/15",
    badgeText: "text-amber-600 dark:text-amber-400",
    glowColor: "rgba(245, 158, 11, 0.12)",
    borderHover: "hover:border-amber-500/40",
  },
  Sun: {
    key: "Sun",
    label: "Sun",
    dotColor: "#EAB308",
    badgeBg: "bg-yellow-500/10 dark:bg-yellow-500/15",
    badgeText: "text-yellow-600 dark:text-yellow-400",
    glowColor: "rgba(234, 179, 8, 0.12)",
    borderHover: "hover:border-yellow-500/40",
  },
  Graphite: {
    key: "Graphite",
    label: "Graphite",
    dotColor: "#71717A",
    badgeBg: "bg-zinc-500/10 dark:bg-zinc-500/15",
    badgeText: "text-zinc-700 dark:text-zinc-300",
    glowColor: "rgba(113, 113, 122, 0.10)",
    borderHover: "hover:border-zinc-500/40",
  },
  Sand: {
    key: "Sand",
    label: "Sand",
    dotColor: "#D97706",
    badgeBg: "bg-orange-950/10 dark:bg-amber-800/20",
    badgeText: "text-amber-700 dark:text-amber-300",
    glowColor: "rgba(217, 119, 6, 0.12)",
    borderHover: "hover:border-amber-700/40",
  },
  Sage: {
    key: "Sage",
    label: "Sage",
    dotColor: "#10B981",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.12)",
    borderHover: "hover:border-emerald-500/40",
  },
  Ocean: {
    key: "Ocean",
    label: "Ocean",
    dotColor: "#0284C7",
    badgeBg: "bg-sky-500/10 dark:bg-sky-500/15",
    badgeText: "text-sky-600 dark:text-sky-400",
    glowColor: "rgba(2, 132, 199, 0.12)",
    borderHover: "hover:border-sky-500/40",
  },
};

export function getFolderAccent(key?: string | null): FolderAccentTheme {
  if (key && key in FOLDER_ACCENT_THEMES) {
    return FOLDER_ACCENT_THEMES[key as FolderAccentKey];
  }
  return FOLDER_ACCENT_THEMES.Graphite;
}
