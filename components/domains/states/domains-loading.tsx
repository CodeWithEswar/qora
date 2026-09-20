import { Skeleton } from "@/components/ui/skeleton";

export function DomainsLoading() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-300">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 bg-muted" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-28 bg-muted" />
            <Skeleton className="h-5 w-32 rounded-full bg-muted" />
          </div>
          <Skeleton className="h-4 w-80 max-w-full bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-40 bg-muted" />
          <Skeleton className="h-9 w-32 bg-muted" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="p-6 rounded-2xl border border-border/60 bg-surface/40 space-y-4">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="space-y-3 max-w-lg w-full">
            <Skeleton className="h-4 w-24 bg-muted" />
            <Skeleton className="h-8 w-64 bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-4/5 bg-muted" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-9 w-32 bg-muted" />
              <Skeleton className="h-9 w-28 bg-muted" />
            </div>
          </div>
          <Skeleton className="h-44 w-full lg:w-[420px] rounded-xl bg-muted/60" />
        </div>
      </div>

      {/* Summary rail skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-border/60 bg-surface/30 space-y-2"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20 bg-muted" />
              <Skeleton className="h-4 w-4 rounded-full bg-muted" />
            </div>
            <Skeleton className="h-7 w-12 bg-muted" />
            <Skeleton className="h-3 w-28 bg-muted" />
          </div>
        ))}
      </div>

      {/* Registry filter bar skeleton */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Skeleton className="h-9 w-64 bg-muted" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 bg-muted" />
          <Skeleton className="h-9 w-24 bg-muted" />
        </div>
      </div>

      {/* Domain registry rows skeleton */}
      <div className="rounded-xl border border-border/60 divide-y divide-border/40 overflow-hidden bg-surface/20">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg bg-muted" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-44 bg-muted" />
                <Skeleton className="h-3 w-28 bg-muted" />
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Skeleton className="h-6 w-20 rounded-full bg-muted" />
              <Skeleton className="h-6 w-20 rounded-full bg-muted" />
              <Skeleton className="h-6 w-20 rounded-full bg-muted" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
