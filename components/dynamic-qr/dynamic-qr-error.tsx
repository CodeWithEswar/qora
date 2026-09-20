"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DynamicQrErrorProps {
  orgSlug: string;
  onRetry?: () => void;
  message?: string;
  className?: string;
}

export function DynamicQrError({
  orgSlug,
  onRetry,
  message = "We couldn't retrieve its current configuration.",
  className,
}: DynamicQrErrorProps) {
  return (
    <div
      className={cn(
        "max-w-xl mx-auto my-16 p-8 rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] text-center space-y-4",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
        <Icon icon="hugeicons:alert-circle" className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-bold text-foreground">
          Couldn&apos;t load this QR
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="text-xs h-9 px-4 gap-1.5 bg-surface border-border hover:bg-muted"
          >
            <Icon icon="hugeicons:reload" className="w-3.5 h-3.5" />
            <span>Try again</span>
          </Button>
        )}
        <Button asChild variant="default" size="sm" className="text-xs h-9 px-4 bg-primary hover:bg-[#CC3A05] text-white">
          <Link href={`/${orgSlug}/qr`}>Return to QR Codes</Link>
        </Button>
      </div>
    </div>
  );
}
