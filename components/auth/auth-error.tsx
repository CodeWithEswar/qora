import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AuthErrorProps {
  errorType?: string | null;
  basePath?: string;
}

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  cancelled: {
    title: "Sign-in cancelled",
    message: "Google authentication was cancelled before completion.",
  },
  state_mismatch: {
    title: "Security check expired",
    message: "The authentication handshake timed out or state could not be verified. Please try again.",
  },
  session_expired: {
    title: "Session expired",
    message: "Your authentication session has expired. Continue with Google to return to your workspace.",
  },
  authentication_failed: {
    title: "Authentication interrupted",
    message: "We could not complete your Google sign-in. Your NXTQR workspace was not modified.",
  },
  configuration_error: {
    title: "Service temporarily unavailable",
    message: "The authentication service encountered a configuration issue. Please retry in a moment.",
  },
};

export function AuthError({ errorType, basePath = "/login" }: AuthErrorProps) {
  if (!errorType) return null;

  const info = ERROR_MESSAGES[errorType] || {
    title: "Authentication notice",
    message: "An issue occurred during sign-in. Please try connecting again.",
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10 text-foreground space-y-2.5"
    >
      <div className="flex items-start gap-3">
        <div className="p-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 min-w-0 flex-1">
          <h2 className="text-xs font-semibold text-rose-700 dark:text-rose-300">
            {info.title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {info.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1 pl-7">
        <Link
          href={basePath}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:text-[#CC3A05] transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Try again</span>
        </Link>
        <span className="text-muted-foreground/40 text-[10px]">•</span>
        <Link
          href="/"
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to website
        </Link>
      </div>
    </div>
  );
}
