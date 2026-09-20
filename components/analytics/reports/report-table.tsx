"use client";

import * as React from "react";
import { Download, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportJobRecord } from "@/lib/supabase/repositories/analytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReportTableProps {
  reports: ReportJobRecord[];
  orgSlug: string;
  onRefresh?: () => void;
  onOpenExportDialog?: () => void;
  className?: string;
}

export function ReportTable({
  reports = [],
  orgSlug,
  onRefresh,
  onOpenExportDialog,
  className,
}: ReportTableProps) {
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const handleDelete = async (jobId: string) => {
    setIsDeleting(jobId);
    try {
      const res = await fetch(`/api/v1/organizations/${orgSlug}/analytics/export?jobId=${jobId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Report deleted successfully");
      onRefresh?.();
    } catch {
      toast.error("Could not delete report");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = (report: ReportJobRecord) => {
    window.location.href = `/api/v1/organizations/${orgSlug}/analytics/export?from=${encodeURIComponent(
      report.rangeFrom
    )}&to=${encodeURIComponent(report.rangeTo)}`;
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between text-card-foreground",
        className
      )}
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h4 className="font-serif text-base font-normal tracking-tight text-foreground">
              Saved Reports & Asynchronous Exports
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Historical data snapshots generated securely from Supabase telemetry
            </p>
          </div>

          <Button
            size="sm"
            onClick={onOpenExportDialog}
            className="text-xs bg-primary hover:bg-[#cc3a05] text-white gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Generate Export Job</span>
          </Button>
        </div>

        {/* Content */}
        <div className="mt-5">
          {reports.length === 0 ? (
            <div className="py-14 text-center flex flex-col items-center justify-center space-y-3">
              {/* Premium 'R' monogram empty state */}
              <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground font-serif text-lg font-bold">
                R
              </div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                No Asynchronous Reports Generated
              </p>
              <span className="text-[11px] text-muted-foreground max-w-xs">
                Exported CSV and structured telemetry archives will be indexed here.
              </span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reports.map((report) => {
                const isCompleted = report.status === "COMPLETED";
                const isFailed = report.status === "FAILED";
                const isProcessing = report.status === "RUNNING" || report.status === "QUEUED";

                return (
                  <div
                    key={report.id}
                    className="p-3.5 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-primary shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate text-xs">
                            {report.name}
                          </p>
                          <span
                            className={cn(
                              "text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase",
                              isCompleted && "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                              isFailed && "bg-rose-500/10 text-rose-500 border border-rose-500/20",
                              isProcessing && "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            )}
                          >
                            {report.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mt-0.5">
                          <span>{report.format.toUpperCase()}</span>
                          <span>·</span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(report)}
                          className="h-7 text-xs border-border bg-card hover:bg-muted text-foreground gap-1.5 shadow-xs"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(report.id)}
                        disabled={isDeleting === report.id}
                        className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                        title="Delete report"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Verified Supabase Report Pipeline</span>
        <span>Bounded Date Windows</span>
      </div>
    </div>
  );
}
