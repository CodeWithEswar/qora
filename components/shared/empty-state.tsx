import * as React from "react";
import { Button } from "@/components/ui/button";
import { QRPatternEmptyState } from "@/components/shared/qr-decor";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  icon?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  icon,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-surface/40",
        className
      )}
    >
      <div className="mb-4">
        {icon ? (
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-elevated border border-border text-muted-foreground">
            {icon}
          </div>
        ) : (
          <QRPatternEmptyState />
        )}
      </div>

      <h3 className="text-base font-semibold text-foreground tracking-tight max-w-sm">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryAction) && (
        <div className="mt-5 flex items-center gap-3">
          {actionLabel && (
            <Button
              size="sm"
              onClick={onAction}
              asChild={!!actionHref}
            >
              {actionHref ? <a href={actionHref}>{actionLabel}</a> : actionLabel}
            </Button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this data. Please try again.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-rose-500/20 bg-rose-500/5",
        className
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Retry
        </Button>
      )}
    </div>
  );
}
