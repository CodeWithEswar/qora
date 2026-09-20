import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: string;
  isSystem?: boolean;
  className?: string;
}

export function RoleBadge({ role, isSystem = true, className }: RoleBadgeProps) {
  const normalized = role.toLowerCase();

  let variantClass = "bg-muted/60 text-muted-foreground border-border";

  if (normalized.includes("owner")) {
    variantClass = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-semibold";
  } else if (normalized.includes("admin")) {
    variantClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-semibold";
  } else if (normalized.includes("manager")) {
    variantClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  } else if (normalized.includes("editor")) {
    variantClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  } else if (normalized.includes("analyst")) {
    variantClass = "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
  } else if (!isSystem) {
    variantClass = "bg-primary/10 text-primary border-primary/20 font-mono";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border font-medium",
        variantClass,
        className
      )}
    >
      <span className="truncate">{role}</span>
      {!isSystem && (
        <span className="text-[9px] font-mono px-1 rounded bg-primary/20 text-primary uppercase">
          Custom
        </span>
      )}
    </span>
  );
}
