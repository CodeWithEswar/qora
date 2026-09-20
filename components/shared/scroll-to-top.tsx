"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollHeight > 0) {
        const progress = Math.min(
          100,
          Math.max(0, (currentScroll / scrollHeight) * 100)
        );
        setScrollProgress(progress);
      }

      // Show when scrolled down more than 160px
      if (currentScroll > 160) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG circular geometry
  const size = 44;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out",
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-4 opacity-0 pointer-events-none"
      )}
    >
      <button
        type="button"
        onClick={scrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Scroll back to top (${Math.round(scrollProgress)}% scrolled)`}
        title={`Back to top (${Math.round(scrollProgress)}%)`}
        className="
          group relative flex h-11 w-11 sm:h-12 sm:w-12
          items-center justify-center rounded-full
          border border-border/80
          bg-background/80
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          backdrop-blur-xl
          supports-[backdrop-filter]:bg-background/70
          transition-all duration-300
          hover:scale-105
          hover:border-primary/50
          hover:shadow-[0_12px_36px_rgba(250,82,15,0.22)]
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-primary
          focus-visible:ring-offset-2
        "
      >
        {/* Circular Progress SVG */}
        <svg
          className="absolute inset-0 -rotate-90 pointer-events-none"
          width="100%"
          height="100%"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Subtle background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/50 dark:text-muted/30"
          />

          {/* Active animated progress stroke with gradient */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-150 ease-out"
          />

          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FA520F" />
              <stop offset="50%" stopColor="#FF8A00" />
              <stop offset="100%" stopColor="#FFD06A" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content: switches between Arrow and Percentage on hover, or displays arrow with clean micro-interaction */}
        <div className="relative flex items-center justify-center">
          {isHovered ? (
            <span className="font-mono text-[9px] font-bold text-primary animate-in fade-in-0 duration-150">
              {Math.round(scrollProgress)}%
            </span>
          ) : (
            <ArrowUp className="h-4 w-4 text-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-primary sm:h-[18px] sm:w-[18px]" />
          )}
        </div>
      </button>
    </div>
  );
}
