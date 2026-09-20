import * as React from "react";
import { cn } from "@/lib/utils";

interface NotFoundRouteProps {
  className?: string;
}

/**
 * 404 Route Not Found Visual
 *
 * Infrastructure Metaphor:
 * QR IDENTITY ──●──→ ROUTE ──●──→ ╳ (UNRESOLVED DESTINATION)
 *
 * An animated signal travels across the path, reaches the broken endpoint,
 * fades gently, and restarts after a brief pause.
 */
export function NotFoundRoute({ className }: NotFoundRouteProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-full max-w-sm mx-auto py-2 select-none",
        className
      )}
      aria-hidden="true"
    >
      <svg
        className="w-full h-16"
        viewBox="0 0 320 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="nfRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FA520F" stopOpacity="0.1" />
            <stop offset="70%" stopColor="#FA520F" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FF8105" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Origin Node: QR Identity Finder */}
        <rect
          x="20"
          y="18"
          width="28"
          height="28"
          rx="4"
          stroke="#FA520F"
          strokeWidth="2"
          strokeOpacity="0.8"
          fill="rgba(250, 82, 15, 0.08)"
        />
        <rect x="29" y="27" width="10" height="10" rx="1.5" fill="#FA520F" />
        <text
          x="34"
          y="56"
          textAnchor="middle"
          className="fill-[#4A4A4A] dark:fill-[#8A8A8A]"
          fontSize="8"
          fontFamily="monospace"
          letterSpacing="0.15em"
        >
          QR ID
        </text>

        {/* Base Track */}
        <line
          x1="48"
          y1="32"
          x2="260"
          y2="32"
          className="stroke-black/15 dark:stroke-white/[0.08]"
          strokeWidth="1"
        />

        {/* Intermediate Routing Nodes */}
        <circle cx="120" cy="32" r="3.5" fill="#FA520F" fillOpacity="0.7" />
        <circle cx="120" cy="32" r="6" stroke="#FA520F" strokeWidth="1" strokeOpacity="0.3" />
        <text
          x="120"
          y="48"
          textAnchor="middle"
          className="fill-[#6A6A6A] dark:fill-[#7A7A7A]"
          fontSize="7.5"
          fontFamily="monospace"
        >
          EDGE
        </text>

        <circle cx="190" cy="32" r="3" fill="#FFB83E" fillOpacity="0.6" />
        <text
          x="190"
          y="48"
          textAnchor="middle"
          className="fill-[#6A6A6A] dark:fill-[#7A7A7A]"
          fontSize="7.5"
          fontFamily="monospace"
        >
          RESOLVE
        </text>

        {/* Animated Signal Pulse along Path */}
        <line
          x1="48"
          y1="32"
          x2="260"
          y2="32"
          stroke="url(#nfRouteGrad)"
          strokeWidth="2"
          strokeDasharray="40 180"
          className="animate-nxtqr-signal"
        />

        {/* Broken Destination Endpoint (╳) */}
        <g transform="translate(260, 32)">
          <circle cx="0" cy="0" r="10" fill="rgba(250, 82, 15, 0.12)" stroke="#FA520F" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="-4" y1="-4" x2="4" y2="4" stroke="#FA520F" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="4" y1="-4" x2="-4" y2="4" stroke="#FA520F" strokeWidth="1.8" strokeLinecap="round" />
          <text
            x="0"
            y="22"
            textAnchor="middle"
            fill="#FA520F"
            fontSize="8"
            fontFamily="monospace"
            letterSpacing="0.12em"
          >
            UNRESOLVED
          </text>
        </g>
      </svg>
    </div>
  );
}
