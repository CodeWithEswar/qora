import * as React from "react";
import { cn } from "@/lib/utils";

interface NytraPixelSpectrumProps {
  className?: string;
  variant?: "bar" | "matrix" | "subtle";
  height?: "sm" | "md" | "lg";
}

export function NytraPixelSpectrum({
  className,
  variant = "bar",
  height = "md",
}: NytraPixelSpectrumProps) {
  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  if (variant === "matrix") {
    // Modular pixel matrix resembling QR data transmission
    const modules = [
      { color: "#CC3A05", opacity: 0.95 },
      { color: "#FA520F", opacity: 1 },
      { color: "#FFA110", opacity: 0.9 },
      { color: "#FF8A00", opacity: 0.85 },
      { color: "#FFB83E", opacity: 0.8 },
      { color: "#FFD900", opacity: 0.75 },
      { color: "#FFD06A", opacity: 0.65 },
      { color: "#FFF8E0", opacity: 0.6 },
    ];

    return (
      <div
        className={cn("flex items-center gap-1 overflow-hidden select-none", className)}
        aria-hidden="true"
      >
        {modules.map((m, idx) => (
          <div
            key={idx}
            className="h-2 w-3 sm:w-4 rounded-[1px] transition-transform hover:scale-110"
            style={{ backgroundColor: m.color, opacity: m.opacity }}
          />
        ))}
      </div>
    );
  }

  // Linear multi-stop gradient band (Primary)
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn(
        "w-full select-none transition-opacity",
        heightClasses[height],
        className
      )}
      style={{
        background:
          "linear-gradient(90deg, #CC3A05 0%, #FA520F 22%, #FFA110 48%, #FFD900 76%, #FFF8E0 100%)",
      }}
    />
  );
}
