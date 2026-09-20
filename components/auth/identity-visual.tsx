"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface IdentityVisualProps {
  mode?: "login" | "signup";
  className?: string;
}

export function IdentityVisual({ mode = "login", className }: IdentityVisualProps) {
  const isSignup = mode === "signup";

  return (
    <div
      className={cn(
        "relative w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border border-border/70 dark:border-white/10 bg-surface/90 dark:bg-[#151518]/90 backdrop-blur-xl shadow-2xl select-none overflow-hidden transition-colors",
        className
      )}
      aria-hidden="true"
    >
      {/* Background ambient route pulse glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-[#FA520F]/15 via-[#FFA110]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* SVG Circuit / Route Architecture */}
      <div className="relative z-10 space-y-6">
        {/* Node 1: QR Source / Modules */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 dark:bg-white/[0.04] border border-border/60 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            {/* Mini QR Finder Graphic */}
            <div className="relative w-8 h-8 rounded-lg border-2 border-[#FA520F] flex items-center justify-center bg-[#FA520F]/10">
              <div className="w-3.5 h-3.5 rounded-sm bg-[#FA520F]" />
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#FFA110] animate-ping motion-reduce:animate-none" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#FFA110]">
                {isSignup ? "01 / GENERATE" : "01 / QR ASSET"}
              </div>
              <div className="text-xs font-semibold text-foreground dark:text-[#F7F4EC]">
                {isSignup ? "Smart QR Modules" : "Dynamic Endpoint"}
              </div>
            </div>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-muted/80 dark:bg-white/[0.06] text-muted-foreground dark:text-[#B8B5AD] border border-border/60 dark:border-white/[0.06]">
            sub-10ms
          </span>
        </div>

        {/* Route Signal Trace 1 */}
        <div className="relative flex justify-center py-1">
          <div className="w-0.5 h-8 bg-gradient-to-b from-[#FA520F] via-[#FFA110] to-border/40 dark:to-white/20" />
          <div className="absolute top-0 w-2 h-2 rounded-full bg-[#FA520F] shadow-[0_0_8px_#FA520F] animate-bounce motion-reduce:animate-none" />
        </div>

        {/* Node 2: NXTQR Identity Engine */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 dark:bg-gradient-to-r dark:from-white/[0.06] dark:to-white/[0.03] border border-[#FA520F]/40 shadow-[0_0_20px_rgba(250,82,15,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FA520F] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-[#FA520F]/30">
              ID
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#FA520F]">
                02 / IDENTITY GATEWAY
              </div>
              <div className="text-xs font-semibold text-foreground dark:text-[#F7F4EC]">
                Google Verified Profile
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">SECURE</span>
          </div>
        </div>

        {/* Route Signal Trace 2 */}
        <div className="relative flex justify-center py-1">
          <div className="w-0.5 h-8 bg-gradient-to-b from-border/40 dark:from-white/30 to-[#FA520F]/80" />
          <div className="absolute bottom-0 w-2 h-2 rounded-full bg-[#FFA110] shadow-[0_0_8px_#FFA110]" />
        </div>

        {/* Node 3: Workspace Infrastructure */}
        <div className="p-3.5 rounded-xl bg-muted/60 dark:bg-white/[0.04] border border-border/60 dark:border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground dark:text-[#B8B5AD]">
              {isSignup ? "03 / NEW ENVIRONMENT" : "03 / WORKSPACE"}
            </div>
            <span className="text-[9px] font-mono text-[#FA520F]">
              {isSignup ? "ONBOARDING" : "LIVE MESH"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-lg bg-surface dark:bg-white/[0.04] border border-border/60 dark:border-white/[0.06] shadow-xs">
              <div className="text-[9px] font-mono text-muted-foreground dark:text-[#B8B5AD]">STUDIO</div>
              <div className="text-[11px] font-medium text-foreground dark:text-[#F7F4EC] mt-0.5">Design</div>
            </div>
            <div className="p-2 rounded-lg bg-surface dark:bg-white/[0.04] border border-[#FA520F]/30 bg-[#FA520F]/5 shadow-xs">
              <div className="text-[9px] font-mono text-[#FA520F]">ROUTES</div>
              <div className="text-[11px] font-medium text-foreground dark:text-[#F7F4EC] mt-0.5">Context</div>
            </div>
            <div className="p-2 rounded-lg bg-surface dark:bg-white/[0.04] border border-border/60 dark:border-white/[0.06] shadow-xs">
              <div className="text-[9px] font-mono text-muted-foreground dark:text-[#B8B5AD]">GUARDIAN</div>
              <div className="text-[11px] font-medium text-foreground dark:text-[#F7F4EC] mt-0.5">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Micro Status Legend */}
      <div className="mt-6 pt-4 border-t border-border/60 dark:border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-muted-foreground dark:text-[#85827B]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FA520F]" />
          <span>Zero Email Passwords</span>
        </div>
        <span>Google OAuth Only</span>
      </div>
    </div>
  );
}
