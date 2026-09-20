import * as React from "react";
import { cn } from "@/lib/utils";

interface SystemFaultProps {
  className?: string;
}

/**
 * 500 System Fault & Recovery Visual
 *
 * Infrastructure Metaphor:
 * REQUEST ──●──●──╳ (INTERRUPTED)
 *                 ╲
 *                  ╲──● (RECOVERY PATH)
 *
 * Visually expresses an interrupted route with a graceful, safe recovery
 * alternative rather than a catastrophic dead end.
 */
export function SystemFault({ className }: SystemFaultProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-full max-w-sm mx-auto py-2 select-none",
        className
      )}
      aria-hidden="true"
    >
      <svg
        className="w-full h-18"
        viewBox="0 0 320 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="faultGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FA520F" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#FA520F" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF4A22" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="recoveryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB83E" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FA520F" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Incoming Request Track */}
        <circle cx="28" cy="24" r="3.5" fill="#FA520F" fillOpacity="0.8" />
        <line
          x1="32"
          y1="24"
          x2="150"
          y2="24"
          className="stroke-black/15 dark:stroke-white/[0.08]"
          strokeWidth="1"
        />

        {/* Normal Intermediate Nodes */}
        <circle cx="90" cy="24" r="3" fill="#FA520F" fillOpacity="0.6" />

        {/* Traveling Signal Pulse */}
        <line
          x1="32"
          y1="24"
          x2="150"
          y2="24"
          stroke="url(#faultGrad)"
          strokeWidth="1.8"
          strokeDasharray="30 100"
          className="animate-nxtqr-signal"
        />

        {/* Fault Node (Interrupted Endpoint) */}
        <g transform="translate(150, 24)">
          <circle cx="0" cy="0" r="9" fill="rgba(250, 82, 15, 0.1)" stroke="#FA520F" strokeWidth="1.5" />
          <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#FA520F" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#FA520F" strokeWidth="1.6" strokeLinecap="round" />
          <text
            x="0"
            y="-14"
            textAnchor="middle"
            fill="#FA520F"
            fontSize="7"
            fontFamily="monospace"
            letterSpacing="0.1em"
          >
            INTERRUPTED
          </text>
        </g>

        {/* Branching Safe Recovery Path */}
        <path
          d="M 150 24 L 200 52 L 270 52"
          fill="none"
          stroke="rgba(255, 184, 62, 0.3)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Recovery Signal Travel */}
        <path
          d="M 150 24 L 200 52 L 270 52"
          fill="none"
          stroke="url(#recoveryGrad)"
          strokeWidth="1.8"
          strokeDasharray="25 120"
          className="animate-nxtqr-signal"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Recovery Destination Node */}
        <g transform="translate(275, 52)">
          <circle cx="0" cy="0" r="7" fill="rgba(255, 184, 62, 0.15)" stroke="#FFB83E" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="2.5" fill="#FFB83E" />
          <text
            x="0"
            y="16"
            textAnchor="middle"
            fill="#FFB83E"
            fontSize="7.5"
            fontFamily="monospace"
            letterSpacing="0.1em"
          >
            RECOVERY △
          </text>
        </g>
      </svg>
    </div>
  );
}
