import * as React from "react";
import { cn } from "@/lib/utils";

interface QRFinderPatternProps {
  className?: string;
  size?: number;
}

export function QRFinderPattern({ className, size = 28 }: QRFinderPatternProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 text-current", className)}
    >
      {/* Outer boundary */}
      <rect x="1" y="1" width="26" height="26" rx="3" stroke="currentColor" strokeWidth="2.5" />
      {/* Middle quiet buffer */}
      <rect x="5.5" y="5.5" width="17" height="17" rx="1.5" fill="none" />
      {/* Inner solid module */}
      <rect x="8" y="8" width="12" height="12" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function QoraLogo({
  className,
  size = 28,
  showText = true,
}: {
  className?: string;
  size?: number;
  showText?: boolean;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 font-bold tracking-tight select-none", className)}>
      <div className="relative flex items-center justify-center rounded-md bg-[#fff8e0] dark:bg-[#26221c] border border-[#e6d5a8] dark:border-[#4a4031] p-1 text-primary">
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          {/* Top-Left Finder */}
          <rect x="2" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="5" y="5" width="5" height="5" rx="1" fill="currentColor" />

          {/* Top-Right Finder */}
          <rect x="19" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="22" y="5" width="5" height="5" rx="1" fill="currentColor" />

          {/* Bottom-Left Finder */}
          <rect x="2" y="19" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="5" y="22" width="5" height="5" rx="1" fill="currentColor" />

          {/* Qora Brain Intelligence core modules */}
          <rect x="16" y="16" width="4" height="4" rx="0.5" fill="#fa520f" />
          <rect x="23" y="16" width="3" height="3" rx="0.5" fill="#ffa110" />
          <rect x="16" y="23" width="3" height="3" rx="0.5" fill="#ffb83e" />
          <rect x="22" y="22" width="8" height="8" rx="1.5" fill="#fa520f" />
          <circle cx="26" cy="26" r="1.5" fill="#ffffff" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
            QORA
            <span className="text-[10px] uppercase font-semibold text-primary tracking-widest px-1.5 py-0.5 rounded-full bg-[#fff0c2] dark:bg-[#383024] border border-[#e6d5a8] dark:border-[#4a4031]">
              SMART QR
            </span>
          </span>
          <span className="text-[10px] text-muted-foreground tracking-wide font-normal mt-0.5">
            QR Infrastructure & Brain
          </span>
        </div>
      )}
    </div>
  );
}

export function QRPatternEmptyState({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center w-20 h-20 rounded-xl border border-dashed border-[#e6d5a8] dark:border-[#383024] bg-[#fff8e0]/60 dark:bg-[#26221c]/60 text-muted-foreground/40", className)}>
      <div className="grid grid-cols-4 gap-1.5 p-3">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-xs transition-colors",
              [0, 1, 4, 3, 2, 7, 12, 13, 15, 10].includes(i)
                ? "bg-primary/50"
                : "bg-[#e6d5a8]/60 dark:bg-[#4a4031]/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
