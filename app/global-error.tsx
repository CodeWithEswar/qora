"use client";

import * as React from "react";
import Link from "next/link";
import { NxtqrMark } from "@/components/brand/nxtqr-mark";
import { RefreshCw, Home } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Fallback (Root Layout Recovery)
 *
 * Invoked ONLY when an unhandled error occurs within the root layout itself.
 * Per the Critical Fallback Principle, this component is entirely self-contained:
 * - Emits its own <html> and <body>
 * - Avoids complex layout chains or nested providers
 * - Features clean inline dark styling and immediate recovery actions
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    console.error("[NXTQR Global Error]", error);
  }, [error]);

  return (
    <html lang="en" className="dark h-full">
      <head>
        <title>Something went wrong — NXTQR</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-full bg-[#111111] text-[#F7F4EC] font-sans antialiased flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
        {/* Subtle Radial Ambient Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(250, 82, 15, 0.08) 0%, transparent 65%)",
          }}
          aria-hidden="true"
        />

        <main className="relative z-10 w-full max-w-md text-center space-y-6">
          {/* Brand Mark & 500 Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-xl">
              <NxtqrMark size={38} />
            </div>
            <span className="absolute -top-2 -right-2 bg-primary/20 text-primary text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-primary/30">
              500
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-mono tracking-[0.22em] uppercase text-primary font-semibold">
              NXTQR / SYSTEM FAULT
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F7F4EC]">
              Something went wrong.
            </h1>
            <p className="text-xs text-[#A8A59D] leading-relaxed max-w-sm mx-auto">
              An unexpected system interruption occurred at the root layout. No diagnostic traces are exposed.
            </p>
          </div>

          {/* Recovery Actions */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl text-xs font-semibold bg-[#FA520F] hover:bg-[#CC3A05] text-white shadow-lg shadow-[#FA520F]/20 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try again</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl text-xs font-medium border border-white/[0.12] bg-white/[0.02] text-[#B8B5AD] hover:text-[#F7F4EC] hover:bg-white/[0.06] transition-all active:scale-95"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return home</span>
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
