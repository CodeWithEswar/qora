"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SignalSpineProps {
  height?: number | string;
  isTracePath?: boolean;
  label?: string;
  status?: "idle" | "evaluated" | "matched" | "skipped" | "fallthrough";
  className?: string;
}

export function SignalSpine({
  height = 36,
  isTracePath = false,
  label,
  status = "idle",
  className,
}: SignalSpineProps) {
  const isHighlighted = isTracePath || status === "matched";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center select-none w-full my-1",
        className
      )}
      style={{ minHeight: typeof height === "number" ? `${height}px` : height }}
    >
      {/* Central Signal Line */}
      <div
        className={cn(
          "w-0.5 absolute inset-y-0 transition-all duration-300",
          isHighlighted
            ? "bg-[#FA520F] shadow-[0_0_8px_rgba(250,82,15,0.6)]"
            : status === "skipped"
            ? "bg-zinc-300/60 dark:bg-border/40 border-dashed"
            : "bg-zinc-300 dark:bg-border/70"
        )}
      />

      {/* Animated Traveling Pulse on Trace Path */}
      {isHighlighted && (
        <div className="absolute w-1.5 h-3 rounded-full bg-[#FA520F] shadow-[0_0_10px_#FA520F] animate-pulse" />
      )}

      {/* Optional Central Node or Badge */}
      {label ? (
        <div
          className={cn(
            "relative z-10 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase border transition-all duration-200 shadow-2xs",
            isHighlighted
              ? "bg-orange-500/10 text-orange-600 dark:text-[#FA520F] border-orange-500/40 shadow-xs font-semibold"
              : "bg-white dark:bg-background text-zinc-600 dark:text-muted-foreground border-zinc-300 dark:border-border/80 font-medium"
          )}
        >
          {label}
        </div>
      ) : (
        <div
          className={cn(
            "relative z-10 w-2 h-2 rounded-full border transition-all duration-200",
            isHighlighted
              ? "bg-[#FA520F] border-[#FA520F] ring-4 ring-[#FA520F]/20"
              : "bg-white dark:bg-muted border-zinc-300 dark:border-border"
          )}
        />
      )}
    </div>
  );
}
