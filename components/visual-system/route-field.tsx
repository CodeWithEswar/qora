import * as React from "react";
import { cn } from "@/lib/utils";

interface RouteFieldProps {
  className?: string;
}

/**
 * Orthogonal Routing Paths & Signal Traces
 *
 * Models the edge routing infrastructure of NXTQR:
 * - Clean 90-degree orthogonal paths (horizontal & vertical lines)
 * - Derived from QR coordinate traces
 * - 2-3 quiet, continuous signal pulses travelling along paths
 * - Uses 1px strokes in warm NXTQR orange (#FA520F) and amber (#FFB83E)
 */
export function RouteField({ className }: RouteFieldProps) {
  return (
    <svg
      className={cn(
        "absolute inset-0 w-full h-full pointer-events-none select-none z-15",
        className
      )}
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="visSignalGradA" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FA520F" stopOpacity="0" />
          <stop offset="50%" stopColor="#FA520F" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFB83E" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="visSignalGradB" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFB83E" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFA110" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FA520F" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Path 1: Top-Left Stepped Route Segment */}
      <g className="opacity-60 dark:opacity-80">
        <path
          d="M 60 180 L 240 180 L 240 300 L 180 300"
          fill="none"
          stroke="rgba(250, 82, 15, 0.08)"
          strokeWidth="1"
        />
        <circle cx="60" cy="180" r="2" fill="rgba(250, 82, 15, 0.25)" />
        <circle cx="240" cy="180" r="2" fill="rgba(255, 184, 62, 0.25)" />
        <circle cx="180" cy="300" r="2" fill="rgba(250, 82, 15, 0.25)" />
        <path
          d="M 60 180 L 240 180 L 240 300 L 180 300"
          fill="none"
          stroke="url(#visSignalGradA)"
          strokeWidth="1.5"
          strokeDasharray="40 220"
          className="animate-nxtqr-signal"
        />
      </g>

      {/* Path 2: Bottom-Right Stepped Route Segment */}
      <g className="opacity-60 dark:opacity-80 hidden md:block">
        <path
          d="M 1224 675 L 1224 540 L 1036 540 L 1036 468"
          fill="none"
          stroke="rgba(255, 184, 62, 0.07)"
          strokeWidth="1"
        />
        <circle cx="1224" cy="675" r="2" fill="rgba(255, 184, 62, 0.25)" />
        <circle cx="1224" cy="540" r="2" fill="rgba(250, 82, 15, 0.25)" />
        <circle cx="1036" cy="540" r="2" fill="rgba(255, 184, 62, 0.25)" />
        <circle cx="1036" cy="468" r="2" fill="rgba(250, 82, 15, 0.25)" />
        <path
          d="M 1224 675 L 1224 540 L 1036 540 L 1036 468"
          fill="none"
          stroke="url(#visSignalGradB)"
          strokeWidth="1.5"
          strokeDasharray="35 190"
          className="animate-nxtqr-signal"
          style={{ animationDelay: "2.2s" }}
        />
      </g>
    </svg>
  );
}
