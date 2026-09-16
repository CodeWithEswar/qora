import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight transition-colors select-none",
  {
    variants: {
      variant: {
        // Mistral badge-orange
        default:
          "bg-primary text-white border border-primary/30",
        orange:
          "bg-primary text-white border border-primary/30",
        // Mistral badge-cream
        cream:
          "bg-[#fff0c2] text-[#1f1f1f] dark:bg-[#383024] dark:text-[#ffedd5] border border-[#e6d5a8] dark:border-[#4a4031]",
        // Mistral badge-dark
        dark:
          "bg-[#1f1f1f] text-white dark:bg-[#27272a] border border-[#3d3d3d]",
        secondary:
          "bg-muted text-muted-foreground border border-border",
        outline:
          "border border-border text-foreground bg-transparent",
        success:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
        danger:
          "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
        info:
          "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
        indigo:
          "bg-primary text-white border border-primary/30",
        neutral:
          "bg-surface-elevated text-foreground border border-border-strong",
      },
      size: {
        sm: "text-[11px] px-2 py-0.2 font-medium",
        default: "text-xs px-2.5 py-0.5",
        lg: "text-xs px-3 py-1 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
