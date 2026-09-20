import * as React from "react";
import Link from "next/link";
import { AuthBackground } from "./background";
import { AuthHeader } from "./auth-header";
import { AuthFooter } from "./auth-footer";
import { GoogleAuthButton } from "./google-auth-button";
import { AuthError } from "./auth-error";
import { NxtqrMark } from "@/components/brand/nxtqr-mark";
import { Lock, ShieldCheck } from "lucide-react";
import { BRAND } from "@/config/brand";

interface AuthShellProps {
  mode?: "login" | "signup";
  errorType?: string | null;
  returnTo?: string;
}

export function AuthShell({ errorType, returnTo }: AuthShellProps) {
  return (
    <AuthBackground>
      {/* Minimal Top Header */}
      <AuthHeader />

      {/* Centered Identity Gateway Panel */}
      <main className="flex items-center justify-center px-4 py-8 sm:py-12 my-auto">
        <div className="w-full max-w-[440px] relative">
          {/* Subtle Outer Card Glow */}
          <div
            className="absolute -inset-1 rounded-[28px] opacity-40 blur-xl pointer-events-none transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(250, 82, 15, 0.15) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          {/* Branded Identity Card */}
          <div
            className="relative rounded-2xl sm:rounded-[26px] p-7 sm:p-9 space-y-6 overflow-hidden border border-border/70 dark:border-white/[0.09] bg-surface/90 dark:bg-[#111111]/80 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06),0_1px_2px_0_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)_inset] transition-all duration-300"
          >
            {/* Subtle internal warm corner reflection */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 80% 100%, rgba(250, 82, 15, 0.05) 0%, transparent 45%)",
              }}
              aria-hidden="true"
            />

            {/* Subtle top edge border illumination */}
            <div
              className="absolute top-0 left-1/4 right-1/4 h-[1px] pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(250, 82, 15, 0.35), transparent)",
              }}
              aria-hidden="true"
            />

            {/* Brand Header inside Card */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-muted/60 dark:bg-white/[0.03] border border-border/60 dark:border-white/[0.06] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs transition-transform duration-200 hover:scale-105"
                aria-label={`${BRAND.name} Home`}
              >
                <NxtqrMark size={36} />
              </Link>

              <div className="space-y-1.5 pt-0.5">
                <div className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.22em] uppercase text-primary font-semibold">
                  <span>{BRAND.descriptor}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground dark:text-[#F7F4EC]">
                  Welcome back.
                </h1>

                <p className="text-xs sm:text-[13px] text-muted-foreground dark:text-[#A8A59D] leading-relaxed max-w-sm mx-auto">
                  Continue to your NXTQR workspace using your Google account.
                </p>
              </div>
            </div>

            {/* Error Message if Present */}
            <div className="relative z-10">
              <AuthError errorType={errorType} basePath="/login" />
            </div>

            {/* Primary Google Auth Action */}
            <div className="relative z-10 space-y-3 pt-1">
              <GoogleAuthButton returnTo={returnTo} />

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground dark:text-[#8A8A8A] pt-1">
                <Lock className="w-3.5 h-3.5 text-muted-foreground/70 dark:text-[#8A8A8A]/70" />
                <span>Google authentication only &bull; Zero passwords stored</span>
              </div>
            </div>

            {/* Security Benefit Micro-pill */}
            <div className="relative z-10 p-3 rounded-xl border border-border/60 dark:border-white/[0.06] bg-muted/40 dark:bg-white/[0.02] flex items-center justify-center gap-2 text-xs text-muted-foreground dark:text-[#A8A59D] text-center">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Instant workspace access with Google identity</span>
            </div>

            {/* Legal Notice */}
            <p className="relative z-10 text-[11px] text-muted-foreground/80 dark:text-[#8A8A8A] text-center leading-relaxed px-2">
              By continuing, you agree to the{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 hover:text-foreground dark:hover:text-[#F7F4EC] transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and acknowledge the{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-2 hover:text-foreground dark:hover:text-[#F7F4EC] transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <AuthFooter />
    </AuthBackground>
  );
}
