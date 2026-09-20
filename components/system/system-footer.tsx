import * as React from "react";
import Link from "next/link";

export function SystemFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground dark:text-[#8A8A8A] border-t border-border/40 dark:border-white/[0.06] bg-background/60 dark:bg-[#111111]/40 backdrop-blur-md shrink-0 z-30">
      <div>&copy; {currentYear} NXTQR &bull; Smart QR Infrastructure</div>
      <nav className="flex items-center gap-4 sm:gap-6 font-mono text-[10px]">
        <Link
          href="/status"
          className="hover:text-foreground dark:hover:text-[#F7F4EC] transition-colors focus-visible:outline-none focus-visible:underline"
        >
          System Status
        </Link>
        <Link
          href="/security"
          className="hover:text-foreground dark:hover:text-[#F7F4EC] transition-colors focus-visible:outline-none focus-visible:underline"
        >
          Security
        </Link>
        <Link
          href="/privacy"
          className="hover:text-foreground dark:hover:text-[#F7F4EC] transition-colors focus-visible:outline-none focus-visible:underline"
        >
          Privacy
        </Link>
        <Link
          href="/terms"
          className="hover:text-foreground dark:hover:text-[#F7F4EC] transition-colors focus-visible:outline-none focus-visible:underline"
        >
          Terms
        </Link>
      </nav>
    </footer>
  );
}
