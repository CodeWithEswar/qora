import * as React from "react";
import Link from "next/link";

export function AuthFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground dark:text-[#8A8A8A] border-t border-border/40 dark:border-white/[0.06] bg-background/70 dark:bg-[#111111]/40 backdrop-blur-md shrink-0 z-20 transition-colors duration-200">
      <div>&copy; {currentYear} NXTQR &bull; Smart QR Infrastructure</div>
      <nav className="flex items-center gap-4 sm:gap-6 font-mono text-[10px]">
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
        <Link
          href="/cookies"
          className="hover:text-foreground dark:hover:text-[#F7F4EC] transition-colors focus-visible:outline-none focus-visible:underline"
        >
          Cookies
        </Link>
        <Link
          href="/security"
          className="hover:text-foreground dark:hover:text-[#F7F4EC] transition-colors focus-visible:outline-none focus-visible:underline"
        >
          Security
        </Link>
      </nav>
    </footer>
  );
}

