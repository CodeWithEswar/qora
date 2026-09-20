import * as React from "react";
import { NxtqrAnimatedMark } from "./nxtqr-mark-animated";

export interface NxtqrLoaderProps {
  /** Size variant for the loader */
  size?: "sm" | "md" | "lg";
  /** Descriptive status message beneath the routing symbol */
  message?: string;
  /** Additional styling classes */
  className?: string;
}

/**
 * NXTQR Global Loader
 * Renders the animated continuous route symbol for meaningful async operations:
 * Route resolution, workspace switching, QR publishing, auth initialization.
 */
export function NxtqrLoader({
  size = "md",
  message,
  className = "",
}: NxtqrLoaderProps) {
  const sizeMap = {
    sm: { mark: 28, text: "text-xs" },
    md: { mark: 44, text: "text-sm" },
    lg: { mark: 64, text: "text-base" },
  };

  const { mark, text } = sizeMap[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 p-6 select-none ${className}`}
    >
      <NxtqrAnimatedMark size={mark} />
      {message && (
        <span className={`font-sans font-medium text-muted-foreground animate-pulse ${text}`}>
          {message}
        </span>
      )}
      <span className="sr-only">Loading NXTQR...</span>
    </div>
  );
}

// Backward compatibility alias
export const NytraLoader = NxtqrLoader;
export type NytraLoaderProps = NxtqrLoaderProps;
