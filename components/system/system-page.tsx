"use client";

import * as React from "react";
import { InfrastructureBackground } from "@/components/visual-system/infrastructure-background";
import { SystemHeader } from "./system-header";
import { SystemFooter } from "./system-footer";
import { SystemCode, type SystemCodeType } from "./system-code";
import { SystemVisual, type SystemVisualType } from "./system-visual";
import { SystemActions, type ActionConfig } from "./system-actions";
import { cn } from "@/lib/utils";

export interface SystemPageProps {
  code: SystemCodeType;
  type: SystemVisualType;
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction: ActionConfig;
  secondaryAction?: ActionConfig;
  homeHref?: string;
  homeLabel?: string;
  className?: string;
}

/**
 * SystemPage
 *
 * Unified architecture for:
 * - 401 (Identity Required)
 * - 403 (Access Restricted)
 * - 404 (Route Not Found)
 * - 500 (System Fault)
 *
 * Shares the dark, interactive QR infrastructure background while presenting
 * status-specific visual topology, action hierarchies, and precise infrastructure copy.
 */
export function SystemPage({
  code,
  type,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  homeHref = "/",
  homeLabel = "Back to website",
  className,
}: SystemPageProps) {
  return (
    <InfrastructureBackground showMicrocopy={true}>
      {/* Minimal System Header */}
      <SystemHeader homeHref={homeHref} homeLabel={homeLabel} />

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 my-auto text-center w-full max-w-2xl mx-auto z-30",
          className
        )}
      >
        <div className="space-y-4 sm:space-y-5 w-full">
          {/* Large Technical QR-Integrated System Code */}
          <SystemCode code={code} eyebrow={eyebrow} />

          {/* Infrastructure Topology Visual */}
          <SystemVisual type={type} className="my-1" />

          {/* Semantic Heading & Description */}
          <div className="space-y-2 max-w-lg mx-auto pt-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground dark:text-[#F7F4EC]">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-[#A8A59D] leading-relaxed max-w-md mx-auto">
              {description}
            </p>
          </div>

          {/* Interactive Actions */}
          <div className="pt-2">
            <SystemActions
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
            />
          </div>
        </div>
      </main>

      {/* Minimal System Footer */}
      <SystemFooter />
    </InfrastructureBackground>
  );
}
