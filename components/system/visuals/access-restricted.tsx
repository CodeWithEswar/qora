import * as React from "react";
import { cn } from "@/lib/utils";

interface AccessRestrictedProps {
  className?: string;
}

/**
 * 403 Access Restricted Visual
 *
 * Infrastructure Metaphor:
 * [ IDENTITY ✓ ] ──●──→ [ ACCESS POLICY ] ──╳ (POLICY BOUNDARY) ──→ [ RESOURCE ]
 *
 * Distinct from 401: Identity is verified, but authorization policy restricts
 * access to the target workspace or resource.
 */
export function AccessRestricted({ className }: AccessRestrictedProps) {
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
          <linearGradient id="policyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34A853" stopOpacity="0.2" />
            <stop offset="60%" stopColor="#FFB83E" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFA110" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Node 1: Identity Verified Node (✓) */}
        <g transform="translate(36, 32)">
          <rect
            x="-16"
            y="-16"
            width="32"
            height="32"
            rx="5"
            fill="rgba(52, 168, 83, 0.08)"
            stroke="rgba(52, 168, 83, 0.5)"
            strokeWidth="1.5"
          />
          {/* Checkmark */}
          <path
            d="M -6 0 L -2 4 L 7 -5"
            stroke="#34A853"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="0"
            y="26"
            textAnchor="middle"
            fill="#34A853"
            fontSize="7.5"
            fontFamily="monospace"
          >
            AUTH ✓
          </text>
        </g>

        {/* Path from Identity to Policy */}
        <line
          x1="52"
          y1="32"
          x2="148"
          y2="32"
          className="stroke-black/15 dark:stroke-white/[0.08]"
          strokeWidth="1"
        />

        {/* Signal Travel along verified section */}
        <line
          x1="52"
          y1="32"
          x2="148"
          y2="32"
          stroke="url(#policyGrad)"
          strokeWidth="1.8"
          strokeDasharray="25 80"
          className="animate-nxtqr-signal"
        />

        {/* Access Policy Boundary Node (Diamond) */}
        <g transform="translate(160, 32)">
          <path
            d="M 0 -16 L 16 0 L 0 16 L -16 0 Z"
            fill="rgba(255, 184, 62, 0.08)"
            stroke="#FFB83E"
            strokeWidth="1.5"
          />
          {/* Subtle policy slash */}
          <line x1="-5" y1="-5" x2="5" y2="5" stroke="#FFB83E" strokeWidth="1.5" strokeLinecap="round" />
          <text
            x="0"
            y="27"
            textAnchor="middle"
            fill="#FFB83E"
            fontSize="7.5"
            fontFamily="monospace"
            letterSpacing="0.1em"
          >
            POLICY ◇
          </text>
        </g>

        {/* Blocked Inactive Path to Resource */}
        <line
          x1="176"
          y1="32"
          x2="265"
          y2="32"
          className="stroke-black/10 dark:stroke-white/[0.05]"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* Resource Node */}
        <g transform="translate(280, 32)">
          <rect
            x="-14"
            y="-14"
            width="28"
            height="28"
            rx="4"
            className="fill-black/[0.03] dark:fill-white/[0.02] stroke-black/15 dark:stroke-white/[0.1]"
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
            RESOURCE
          </text>
        </g>
      </svg>
    </div>
  );
}
