"use client";

import * as React from "react";
import { BrandKitVersionV1 } from "@nxtqr/contracts";
import { History, Shield, Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BrandVersionHistoryProps {
  brandKitId: string;
}

export function BrandVersionHistory({ brandKitId }: BrandVersionHistoryProps) {
  const [versions, setVersions] = React.useState<BrandKitVersionV1[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/v1/brand-kits/${brandKitId}/versions`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setVersions(data.data || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load brand kit versions:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [brandKitId]);

  return (
    <div className="rounded-2xl border border-border/80 bg-surface/50 backdrop-blur-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#FA520F] mb-1">
            <Shield className="w-3 h-3" />
            <span>Cryptographic Immutability</span>
          </div>
          <h3 className="text-lg font-bold text-foreground font-display">
            IMMUTABLE REVISION HISTORY
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tamper-evident snapshots recorded on publication. Governed by database anti-mutation triggers.
          </p>
        </div>

        <div className="text-[11px] font-mono text-muted-foreground bg-surface-elevated/60 px-2.5 py-1 rounded-md border border-border/60">
          <span>{versions.length} PUBLISHED REVISIONS</span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Loading revision timeline...
        </div>
      ) : versions.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-border bg-surface/40">
          <p className="text-xs text-muted-foreground">
            No published revisions recorded yet. Publish your first revision using the Publish action.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {versions.map((version, index) => {
            const isLatest = index === 0;

            return (
              <div key={version.id} className="relative space-y-2 group">
                {/* Node dot */}
                <span
                  className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 bg-surface ${
                    isLatest
                      ? "border-[#FA520F] ring-4 ring-[#FA520F]/20"
                      : "border-border"
                  }`}
                />

                <div className="p-4 rounded-xl border border-border/80 bg-surface/70 space-y-2 group-hover:border-border transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        Revision {version.versionNumber}
                      </span>
                      {isLatest && (
                        <Badge className="bg-[#FA520F] text-white border-0 text-[10px] py-0">
                          Active Published
                        </Badge>
                      )}
                    </div>

                    <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(version.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {version.changeSummary || "No change summary specified."}
                  </p>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>RECORD_ID: {version.id.slice(0, 8)}</span>
                    <span className="flex items-center gap-1 text-emerald-500 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      READ_ONLY_SEALED
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
