import * as React from "react";
import Link from "next/link";
import { NxtqrMark } from "@/components/brand/nxtqr-mark";
import { BRAND } from "@/config/brand";
import { ArrowUpRight } from "lucide-react";
import { ThemeSwitcher } from "@/components/shell/theme-switcher";

export function AuthHeader() {
  return (
    <header className="w-full h-16 px-6 sm:px-8 lg:px-12 flex items-center justify-between border-b border-border/40 dark:border-white/[0.06] bg-background/70 dark:bg-[#111111]/40 backdrop-blur-md shrink-0 z-20 transition-colors duration-200">
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        aria-label={`${BRAND.name} Home`}
      >
        <NxtqrMark size={28} className="transition-transform group-hover:scale-105 duration-200" />
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-foreground dark:text-[#F7F4EC] leading-none">
            {BRAND.name}
          </span>
          <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground dark:text-[#B8B5AD] mt-0.5">
            {BRAND.descriptor}
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeSwitcher className="h-8 w-8 text-muted-foreground dark:text-[#B8B5AD] hover:text-foreground dark:hover:text-[#F7F4EC] hover:bg-muted/50 dark:hover:bg-white/[0.04]" />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground dark:text-[#B8B5AD] hover:text-foreground dark:hover:text-[#F7F4EC] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded px-2.5 py-1.5 hover:bg-muted/50 dark:hover:bg-white/[0.04]"
        >
          <span>Back to website</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
        </Link>
      </div>
    </header>
  );
}

