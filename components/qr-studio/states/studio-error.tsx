import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudioErrorProps {
  message?: string;
  onRetry?: () => void;
  orgSlug: string;
}

export function StudioError({ message, onRetry, orgSlug }: StudioErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-4 border border-rose-500/20">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Unable to Load QR Studio</h2>
      <p className="text-xs text-muted-foreground max-w-md mb-6">
        {message || "We encountered an unexpected error while retrieving this QR asset from the database."}
      </p>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild className="gap-2 text-xs">
          <Link href={`/${orgSlug}/qr`}>
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to QR Codes</span>
          </Link>
        </Button>
        {onRetry && (
          <Button size="sm" onClick={onRetry} className="gap-2 text-xs bg-primary hover:bg-[#cc3a05] text-white">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </Button>
        )}
      </div>
    </div>
  );
}
