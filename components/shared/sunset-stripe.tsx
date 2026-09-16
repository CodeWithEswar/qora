import * as React from "react";
import { cn } from "@/lib/utils";

interface SunsetStripeProps {
  className?: string;
  height?: "sm" | "md" | "lg";
}

export function SunsetStripe({ className, height = "md" }: SunsetStripeProps) {
  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn(
        "w-full sunset-stripe select-none transition-opacity",
        heightClasses[height],
        className
      )}
    />
  );
}
