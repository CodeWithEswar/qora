import { NxtqrLogo } from "@/components/brand/nxtqr-logo";
import { NxtqrMark } from "@/components/brand/nxtqr-mark";
import { cn } from "@/lib/utils";

export { NxtqrLogo, NxtqrMark };
export const NytraLogo = NxtqrLogo;
export const NytraMark = NxtqrMark;

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

export function QRPatternEmptyState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-20 h-20 rounded-xl border border-dashed border-[#e6d5a8] dark:border-[#383024] bg-[#fff8e0]/60 dark:bg-[#26221c]/60 text-muted-foreground/40",
        className
      )}
    >
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
