import * as React from "react";
import { cn } from "@/lib/utils";

export type QRStatus = "active" | "draft" | "paused" | "expired" | "healthy" | "warning" | "broken" | "checking";

interface StatusBadgeProps {
  status: QRStatus | string;
  className?: string;
  showPulse?: boolean;
}

export function StatusBadge({ status, className, showPulse = true }: StatusBadgeProps) {
  const normalized = status.toLowerCase() as QRStatus;

  const config: Record<
    QRStatus,
    { label: string; dot: string; bg: string; text: string; border: string; pulse?: boolean }
  > = {
    active: {
      label: "Active",
      dot: "bg-emerald-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-500/20",
      pulse: true,
    },
    draft: {
      label: "Draft",
      dot: "bg-slate-400",
      bg: "bg-slate-500/10",
      text: "text-slate-700 dark:text-slate-400",
      border: "border-slate-500/20",
    },
    paused: {
      label: "Paused",
      dot: "bg-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-500/20",
    },
    expired: {
      label: "Expired",
      dot: "bg-rose-500",
      bg: "bg-rose-500/10",
      text: "text-rose-700 dark:text-rose-400",
      border: "border-rose-500/20",
    },
    healthy: {
      label: "Healthy",
      dot: "bg-emerald-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-500/20",
    },
    warning: {
      label: "Warning",
      dot: "bg-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-500/20",
    },
    broken: {
      label: "Broken",
      dot: "bg-rose-500",
      bg: "bg-rose-500/10",
      text: "text-rose-700 dark:text-rose-400",
      border: "border-rose-500/20",
    },
    checking: {
      label: "Checking",
      dot: "bg-indigo-500",
      bg: "bg-indigo-500/10",
      text: "text-indigo-700 dark:text-indigo-400",
      border: "border-indigo-500/20",
      pulse: true,
    },
  };

  const item = config[normalized] || {
    label: status,
    dot: "bg-slate-400",
    bg: "bg-slate-500/10",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border select-none transition-colors",
        item.bg,
        item.text,
        item.border,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {showPulse && item.pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              item.dot
            )}
          />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", item.dot)} />
      </span>
      {item.label}
    </span>
  );
}
