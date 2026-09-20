"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FlaskConical, Play, Sparkles, RefreshCw, CheckCircle2, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ExperimentItem } from "../types";

interface ExperimentSimulationDialogProps {
  experiment: ExperimentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSimulated?: (updated: ExperimentItem) => void;
  orgSlug?: string;
}

export function ExperimentSimulationDialog({
  experiment,
  isOpen,
  onClose,
  onSimulated,
  orgSlug,
}: ExperimentSimulationDialogProps) {
  const [simulationLog, setSimulationLog] = React.useState<
    { id: string; timestamp: string; variantName: string; destination: string; randomSeed: number; converted?: boolean }[]
  >([]);
  const [variantCounts, setVariantCounts] = React.useState<Record<string, number>>({});
  const [isSimulating, setIsSimulating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && experiment) {
      const initialCounts: Record<string, number> = {};
      for (const v of experiment.variants) {
        initialCounts[v.name] = v.totalScans;
      }
      setVariantCounts(initialCounts);
    }
  }, [isOpen, experiment]);

  if (!experiment) return null;

  const runSimulation = async (batchSize: number) => {
    if (!experiment) return;
    setIsSimulating(true);

    try {
      const res = await fetch(`/api/v1/experiments/${experiment.id}/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-slug": orgSlug || "",
        },
        body: JSON.stringify({ batchSize }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || "Simulation injection failed.");
      }

      const { data } = await res.json();
      const decisions = data.decisions || [];
      const updatedExp: ExperimentItem = data.updatedExperiment;

      // Update decision stream with recent decisions
      setSimulationLog((prev) => [...decisions, ...prev].slice(0, 50));

      // Update variant counts from authoritative database values
      const nextCounts: Record<string, number> = {};
      if (updatedExp?.variants) {
        for (const v of updatedExp.variants) {
          nextCounts[v.name] = v.totalScans;
        }
        setVariantCounts(nextCounts);
      }

      // Propagate update to parent card / page so UI is immediately real
      if (onSimulated && updatedExp) {
        onSimulated(updatedExp);
      }

      toast.success(`Injected ${batchSize} real scans into Supabase.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to execute real simulation.");
    } finally {
      setIsSimulating(false);
    }
  };

  const totalSimulated = Object.values(variantCounts).reduce((a, b) => a + b, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-[#111114] border border-white/10 text-white rounded-2xl p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-white/8 bg-[#141418]">
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-wider uppercase font-bold">
            <FlaskConical className="h-3.5 w-3.5" />
            <span>EDGE RESOLUTION SCAN SIMULATOR</span>
          </div>
          <DialogTitle className="text-lg font-semibold text-white tracking-tight">
            Simulate A/B Traffic Split
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Testing deterministic edge routing for &ldquo;{experiment.name}&rdquo; across its configured
            variants.
          </DialogDescription>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0d0d10] border border-white/8">
            <div className="text-xs">
              <span className="font-semibold text-zinc-200">Inject Simulated Scans:</span>
              <div className="text-[11px] text-zinc-400 font-mono">
                Total Simulated: {totalSimulated}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isSimulating}
                onClick={() => runSimulation(1)}
                className="h-8 text-xs bg-black/40 border-white/10 text-zinc-200 hover:text-white"
              >
                {isSimulating ? <Loader2 className="h-3 w-3 animate-spin" /> : "+1 Scan"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isSimulating}
                onClick={() => runSimulation(10)}
                className="h-8 text-xs bg-black/40 border-white/10 text-zinc-200 hover:text-white"
              >
                {isSimulating ? <Loader2 className="h-3 w-3 animate-spin" /> : "+10 Scans"}
              </Button>
              <Button
                size="sm"
                disabled={isSimulating}
                onClick={() => runSimulation(50)}
                className="h-8 text-xs bg-primary hover:bg-primary/90 text-white font-medium gap-1"
              >
                {isSimulating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                +50 Scans
              </Button>
            </div>
          </div>

          {/* Distribution Breakdown */}
          {totalSimulated > 0 && (
            <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                SIMULATED DISTRIBUTION BREAKDOWN
              </div>
              <div className="space-y-1.5">
                {experiment.variants.map((v) => {
                  const count = variantCounts[v.name] || 0;
                  const pct = totalSimulated > 0 ? ((count / totalSimulated) * 100).toFixed(1) : "0";
                  return (
                    <div key={v.id} className="space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-300">{v.name}</span>
                        <span className="text-zinc-400">
                          {count} scans ({pct}% / Target: {v.trafficWeight}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Decision Stream */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider flex items-center justify-between">
              <span>LIVE EDGE RESOLUTION DECISIONS</span>
              <span>{simulationLog.length} events logged</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px]">
              {simulationLog.length === 0 ? (
                <div className="py-6 text-center text-zinc-500 text-xs">
                  Click a scan button above to trigger edge routing decisions.
                </div>
              ) : (
                simulationLog.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded bg-white/[0.02] border border-white/5 text-zinc-300 hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-zinc-500 text-[10px]">{log.timestamp}</span>
                      <span className="text-primary font-bold">{log.variantName}</span>
                      <span className="text-zinc-600">➔</span>
                      <span className="text-zinc-400 truncate">{log.destination}</span>
                    </div>
                    <span className="text-zinc-500 text-[10px] shrink-0">
                      seed: {log.randomSeed}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 sm:p-5 border-t border-white/8 bg-[#141418] flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSimulationLog([]);
              setVariantCounts({});
            }}
            className="h-8 text-xs text-zinc-400 hover:text-white"
          >
            Clear Log
          </Button>

          <Button
            size="sm"
            onClick={onClose}
            className="h-8 text-xs bg-white text-black hover:bg-zinc-200"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
