"use client";

import * as React from "react";
import { FlaskConical, Play, QrCode, Eye, CheckCircle2 } from "lucide-react";
import { ExperimentSummaryMetrics } from "./types";

interface ExperimentSignalStripProps {
  metrics: ExperimentSummaryMetrics;
}

export function ExperimentSignalStrip({ metrics }: ExperimentSignalStripProps) {
  return (
    <section
      aria-label="Experiment instrumentation summary"
      className="relative rounded-xl border border-border bg-card dark:bg-[#141414] overflow-hidden shadow-xs"
    >
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-border">
        {/* Metric 1: Total Experiments */}
        <div className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-muted/50 dark:hover:bg-[#181818] transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium tracking-wider uppercase text-[10px]">
              Experiments
            </span>
            <FlaskConical className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {metrics.totalExperiments}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">total</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            Configured A/B test definitions
          </p>
        </div>

        {/* Metric 2: Running */}
        <div className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-muted/50 dark:hover:bg-[#181818] transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium tracking-wider uppercase text-[10px]">
              Running
            </span>
            <Play className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {metrics.runningExperiments}
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">active</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            Live routing traffic split
          </p>
        </div>

        {/* Metric 3: QR Assets */}
        <div className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-muted/50 dark:hover:bg-[#181818] transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium tracking-wider uppercase text-[10px]">
              QR Assets
            </span>
            <QrCode className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {metrics.qrAssetsCount}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">participating</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            Dynamic QR traffic sources
          </p>
        </div>

        {/* Metric 4: Observations */}
        <div className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-muted/50 dark:hover:bg-[#181818] transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium tracking-wider uppercase text-[10px]">
              Observations
            </span>
            <Eye className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {metrics.totalObservations.toLocaleString()}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">scans</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            Actual variant evaluations
          </p>
        </div>

        {/* Metric 5: Completed */}
        <div className="col-span-2 md:col-span-1 p-4 sm:p-5 flex flex-col justify-between group hover:bg-muted/50 dark:hover:bg-[#181818] transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium tracking-wider uppercase text-[10px]">
              Completed
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {metrics.completedExperiments}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">closed</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            Concluded experiment tests
          </p>
        </div>
      </div>
    </section>
  );
}
