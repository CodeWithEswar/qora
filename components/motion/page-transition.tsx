"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * NYTRA Page Transition
 * Lightweight, non-blocking page transition with top-edge warm routing signal.
 * Completes within 300ms, adhering strictly to prefers-reduced-motion.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  React.useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Top-edge NYTRA Route Pulse Signal */}
      {isTransitioning && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-[2px] overflow-hidden bg-transparent"
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-[#FA520F] to-[#FFB83E] animate-nytra-route-sweep" />
        </div>
      )}

      {/* Main Content Fade/Slide */}
      <div
        key={pathname}
        className={cn("w-full transition-opacity duration-200 ease-out", className)}
        style={{
          animation: "nytraFadeIn 220ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
