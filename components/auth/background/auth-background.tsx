"use client";

import * as React from "react";
import { InfrastructureBackground } from "@/components/visual-system/infrastructure-background";

export interface AuthBackgroundProps {
  children: React.ReactNode;
  className?: string;
  showMicrocopy?: boolean;
}

/**
 * Re-exports the unified InfrastructureBackground for Auth components.
 */
export function AuthBackground({
  children,
  className,
  showMicrocopy = true,
}: AuthBackgroundProps) {
  return (
    <InfrastructureBackground
      className={className}
      showMicrocopy={showMicrocopy}
    >
      {children}
    </InfrastructureBackground>
  );
}
