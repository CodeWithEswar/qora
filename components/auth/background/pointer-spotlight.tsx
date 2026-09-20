"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PointerSpotlightProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

/**
 * Interactive Pointer Spotlight
 *
 * Tracks fine-pointer desktop movement with zero React re-render loops:
 * - Coordinates are throttled through requestAnimationFrame and written directly
 *   as CSS variables (--auth-pointer-x, --auth-pointer-y, --auth-pointer-opacity).
 * - Smooth fade-in on pointer enter (300ms) and fade-out on pointer leave (500ms).
 * - Completely inactive on touch/mobile devices ((pointer: coarse)).
 * - Clean teardown of listeners and pending RAFs on unmount.
 */
export function PointerSpotlight({
  containerRef,
  className,
}: PointerSpotlightProps) {
  React.useEffect(() => {
    // Only activate for high-precision pointer devices (desktop mouse/trackpad)
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    let targetX = -999;
    let targetY = -999;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;

      if (rafId === null) {
        rafId = window.requestAnimationFrame(() => {
          container.style.setProperty("--auth-pointer-x", `${targetX}px`);
          container.style.setProperty("--auth-pointer-y", `${targetY}px`);
          rafId = null;
        });
      }
    };

    const handlePointerEnter = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      container.style.setProperty("--auth-pointer-x", `${targetX}px`);
      container.style.setProperty("--auth-pointer-y", `${targetY}px`);
      container.style.setProperty("--auth-pointer-opacity", "1");
    };

    const handlePointerLeave = () => {
      container.style.setProperty("--auth-pointer-opacity", "0");
    };

    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerenter", handlePointerEnter, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointerleave", handlePointerLeave);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [containerRef]);

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none select-none z-25 transition-opacity duration-500 ease-out",
        className
      )}
      style={{
        opacity: "var(--auth-pointer-opacity, 0)",
        background: `radial-gradient(
          380px circle at var(--auth-pointer-x, -999px) var(--auth-pointer-y, -999px),
          rgba(250, 82, 15, 0.12) 0%,
          rgba(255, 129, 5, 0.05) 42%,
          transparent 75%
        )`,
      }}
      aria-hidden="true"
    />
  );
}
