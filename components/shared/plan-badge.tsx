import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlanType = "free" | "pro" | "business";

interface PlanBadgeProps {
  plan: PlanType | string;
  className?: string;
  showIcon?: boolean;
}

export function PlanBadge({ plan, className, showIcon = true }: PlanBadgeProps) {
  const normalized = plan.toLowerCase() as PlanType;

  if (normalized === "pro") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white border border-primary/30 select-none shadow-2xs",
          className
        )}
      >
        {showIcon && <Sparkles className="h-2.5 w-2.5 fill-white text-white" />}
        PRO
      </span>
    );
  }

  if (normalized === "business") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-[#1f1f1f] dark:bg-[#27272a] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white border border-[#3d3d3d] select-none",
          className
        )}
      >
        {showIcon && <Sparkles className="h-2.5 w-2.5 fill-white text-white" />}
        BUSINESS
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#fff0c2] dark:bg-[#383024] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1f1f1f] dark:text-[#ffedd5] border border-[#e6d5a8] dark:border-[#4a4031] select-none",
        className
      )}
    >
      FREE
    </span>
  );
}
