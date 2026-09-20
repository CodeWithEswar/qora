import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(num);
}

export function formatPercentage(num: number): string {
  return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
}

export function formatDate(
  date: string | number | Date,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
): string {
  try {
    const d = typeof date === "object" ? date : new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", options);
  } catch {
    return "—";
  }
}

export function formatDateTime(
  date: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }
): string {
  try {
    const d = typeof date === "object" ? date : new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", options);
  } catch {
    return "—";
  }
}

export function formatRelativeTime(date: string | number | Date): string {
  try {
    const d = typeof date === "object" ? date : new Date(date);
    if (isNaN(d.getTime())) return "—";
    const now = Date.now();
    const diffSec = Math.floor((now - d.getTime()) / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(d);
  } catch {
    return "—";
  }
}
