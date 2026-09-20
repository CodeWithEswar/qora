import * as React from "react";
import { cn } from "@/lib/utils";

interface IdentityRequiredProps {
  className?: string;
}

/**
 * 401 Identity Required Visual
 *
 * Infrastructure Metaphor:
 * REQUEST ──→ [ IDENTITY GATE ] ──○ (LOCKED) ──→ WORKSPACE
 *
 * Communicates that identity must be established via authentication
 * before the request can route forward. No red alarm; warm amber/orange
 * boundary pulse.
 */
export function IdentityRequired({ className }: IdentityRequiredProps) {
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
          <linearGradient id="authRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF8105" stopOpacity="0.1" />
            <stop offset="60%" stopColor="#FA520F" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFB83E" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Incoming Request Node */}
        <circle cx="28" cy="32" r="6" fill="rgba(255, 129, 5, 0.15)" stroke="#FF8105" strokeWidth="1.5" />
        <circle cx="28" cy="32" r="2.5" fill="#FF8105" />
        <text
          x="28"
          y="52"
          textAnchor="middle"
          className="fill-[#4A4A4A] dark:fill-[#8A8A8A]"
          fontSize="7.5"
          fontFamily="monospace"
        >
          REQUEST
        </text>

        {/* Path to Identity Gate */}
        <line
          x1="34"
          y1="32"
          x2="135"
          y2="32"
          className="stroke-black/15 dark:stroke-white/[0.08]"
          strokeWidth="1"
        />

        {/* Animated Signal Pulse */}
        <line
          x1="34"
          y1="32"
          x2="135"
          y2="32"
          stroke="url(#authRouteGrad)"
          strokeWidth="1.8"
          strokeDasharray="30 110"
          className="animate-nxtqr-signal"
        />

        {/* Identity Gate Node */}
        <g transform="translate(150, 32)">
          <rect
            x="-22"
            y="-16"
            width="44"
            height="32"
            rx="6"
            fill="rgba(250, 82, 15, 0.08)"
            stroke="#FA520F"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          {/* Identity lock keyway ring */}
          <circle cx="0" cy="-2" r="4" stroke="#FA520F" strokeWidth="1.5" fill="none" />
          <path d="M -2 2 L 2 2 L 1 7 L -1 7 Z" fill="#FA520F" />
          <text
            x="0"
            y="26"
            textAnchor="middle"
            fill="#FFA110"
            fontSize="7.5"
            fontFamily="monospace"
            letterSpacing="0.1em"
          >
            GATE ○
          </text>
        </g>

        {/* Dashed Inactive Track to Workspace */}
        <line
          x1="172"
          y1="32"
          x2="270"
          y2="32"
          className="stroke-black/10 dark:stroke-white/[0.06]"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Protected Destination Workspace Node */}
        <g transform="translate(285, 32)">
          <rect
            x="-14"
            y="-14"
            width="28"
            height="28"
            rx="4"
            className="fill-black/[0.03] dark:fill-white/[0.02] stroke-black/15 dark:stroke-white/[0.12]"
            strokeWidth="1"
          />
          <text
            x="0"
            y="24"
            textAnchor="middle"
            className="fill-[#6A6A6A] dark:fill-[#7A7A7A]"
            fontSize="7.5"
            fontFamily="monospace"
          >
            WORKSPACE
          </text>
        </g>
      </svg>
    </div>
  );
}
