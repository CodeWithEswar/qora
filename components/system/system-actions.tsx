import * as React from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionConfig {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: "arrow" | "refresh";
}

interface SystemActionsProps {
  primaryAction: ActionConfig;
  secondaryAction?: ActionConfig;
  className?: string;
}

export function SystemActions({
  primaryAction,
  secondaryAction,
  className,
}: SystemActionsProps) {
  const renderIcon = (type?: "arrow" | "refresh") => {
    if (type === "refresh") {
      return (
        <RefreshCw className="w-3.5 h-3.5 text-inherit transition-transform duration-300 group-hover:rotate-180" />
      );
    }
    return (
      <ArrowRight className="w-3.5 h-3.5 text-inherit transition-transform duration-200 group-hover:translate-x-1" />
    );
  };

  const primaryClass = cn(
    "group inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-xs sm:text-sm font-semibold select-none",
    "bg-[#FA520F] hover:bg-[#CC3A05] text-white shadow-lg shadow-[#FA520F]/20",
    "transition-all duration-200 active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-[#111111]"
  );

  const secondaryClass = cn(
    "group inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-xs sm:text-sm font-medium select-none",
    "border border-black/[0.12] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.02] text-[#333333] dark:text-[#B8B5AD] hover:text-black dark:hover:text-[#F7F4EC] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:border-black/20 dark:hover:border-white/20 shadow-xs",
    "transition-all duration-200 active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-[#111111]"
  );

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full",
        className
      )}
    >
      {/* Primary Action */}
      {primaryAction.href ? (
        <Link href={primaryAction.href} className={primaryClass}>
          <span>{primaryAction.label}</span>
          {renderIcon(primaryAction.icon || "arrow")}
        </Link>
      ) : (
        <button
          type="button"
          onClick={primaryAction.onClick}
          className={primaryClass}
        >
          <span>{primaryAction.label}</span>
          {renderIcon(primaryAction.icon || "refresh")}
        </button>
      )}

      {/* Secondary Action */}
      {secondaryAction &&
        (secondaryAction.href ? (
          <Link href={secondaryAction.href} className={secondaryClass}>
            <span>{secondaryAction.label}</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className={secondaryClass}
          >
            <span>{secondaryAction.label}</span>
          </button>
        ))}
    </div>
  );
}
