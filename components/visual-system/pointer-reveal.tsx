"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PointerRevealProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

/**
 * Interactive Pointer Spotlight & Reveal Driver
 *
 * Coordinates fine-pointer desktop movement with zero React re-render loops:
 * - Direct style assignment of --auth-pointer-x, --auth-pointer-y, --auth-pointer-opacity
 * - Smooth transition on enter and exit
 * - Inactive on touch devices ((pointer: coarse))
 */
export function PointerReveal({
  containerRef,
  className,
}: PointerRevealProps) {
  React.useEffect(() => {
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
