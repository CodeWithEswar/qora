"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, RotateCcw } from "lucide-react";

export default function TeamDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[TeamDetailError] Encountered error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4 font-sans">
      <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <div className="space-y-1.5 max-w-md">
        <h2 className="text-base font-bold text-foreground">
          Unable to Load Team Operations
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          An error occurred while resolving this team workspace. The team may have been removed,
          or your session might have expired.
        </p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => reset()}
          className="text-xs gap-1.5 cursor-pointer font-mono"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Retry Operation</span>
        </Button>
        <Button
          size="sm"
          asChild
          className="text-xs gap-1.5 cursor-pointer"
        >
          <Link href="../teams">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Teams</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
