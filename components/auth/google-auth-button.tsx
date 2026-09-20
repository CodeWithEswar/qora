"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoogleAuthButtonProps {
  returnTo?: string;
  className?: string;
}

/**
 * Official Google 'G' Mark conforming to Google Identity Branding guidelines.
 * Never recolored or distorted.
 */
function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5 shrink-0", className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function GoogleAuthButton({ returnTo, className }: GoogleAuthButtonProps) {
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isRedirecting) {
      e.preventDefault();
      return;
    }
    setIsRedirecting(true);
  };

  const authUrl = `/api/auth/google${
    returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""
  }`;

  return (
    <a
      href={authUrl}
      onClick={handleClick}
      role="button"
      aria-label="Continue with Google"
      aria-disabled={isRedirecting}
      tabIndex={isRedirecting ? -1 : 0}
      className={cn(
        "group relative flex items-center justify-center w-full h-[52px] sm:h-[54px] px-5 rounded-xl font-medium text-xs sm:text-sm select-none transition-all duration-200 cursor-pointer",
        // Theme-aware surface: white in light mode, dark elevated in dark mode
        "bg-white dark:bg-[#1E1E22] text-[#1F1F1F] dark:text-[#F7F4EC]",
        "border border-neutral-300 dark:border-white/15 shadow-sm",
        // Hover & Active
        "hover:bg-neutral-50 dark:hover:bg-[#27272D] hover:border-neutral-400 dark:hover:border-white/25 active:scale-[0.99]",
        // Focus state with signature NXTQR orange ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Disabled / redirecting state
        isRedirecting && "pointer-events-none opacity-80 cursor-wait",
        className
      )}
    >
      <div className="flex items-center justify-center gap-3">
        {isRedirecting ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <GoogleGIcon />
        )}
        <span className="font-semibold tracking-tight text-[#1F1F1F] dark:text-[#F7F4EC]">
          {isRedirecting ? "Connecting to Google…" : "Continue with Google"}
        </span>
      </div>
    </a>
  );
}
