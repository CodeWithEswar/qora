"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Columns, Trophy, TrendingUp, Split } from "lucide-react";
import { ExperimentItem } from "../types";

interface CompareExperimentsDialogProps {
  experiments: ExperimentItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function CompareExperimentsDialog({
  experiments,
  isOpen,
  onClose,
}: CompareExperimentsDialogProps) {
  const [expAId, setExpAId] = React.useState<string>(experiments[0]?.id || "");
  const [expBId, setExpBId] = React.useState<string>(experiments[1]?.id || experiments[0]?.id || "");

  const expA = experiments.find((e) => e.id === expAId) || experiments[0];
  const expB = experiments.find((e) => e.id === expBId) || experiments[1] || experiments[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#111114] border border-white/10 text-white rounded-2xl p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-white/8 bg-[#141418]">
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-wider uppercase font-bold">
            <Columns className="h-3.5 w-3.5" />
            <span>A/B EXPERIMENT COMPARATOR</span>
          </div>
          <DialogTitle className="text-lg font-semibold text-white tracking-tight">
            Side-by-Side Pipeline Comparison
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Compare traffic division, observations, and conversion performance between two routing
            experiments.
          </DialogDescription>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Selectors Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400">EXPERIMENT 1</label>
              <Select value={expAId} onValueChange={setExpAId}>
                <SelectTrigger className="h-9 bg-black/40 border-white/10 text-xs text-zinc-200">
                  <SelectValue placeholder="Select Experiment 1" />
                </SelectTrigger>
                <SelectContent className="bg-[#141418] border-white/10 text-xs text-zinc-200">
                  {experiments.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400">EXPERIMENT 2</label>
              <Select value={expBId} onValueChange={setExpBId}>
                <SelectTrigger className="h-9 bg-black/40 border-white/10 text-xs text-zinc-200">
                  <SelectValue placeholder="Select Experiment 2" />
                </SelectTrigger>
                <SelectContent className="bg-[#141418] border-white/10 text-xs text-zinc-200">
                  {experiments.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comparison Columns */}
          {expA && expB ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Column 1 */}
              <div className="p-4 rounded-xl bg-[#0d0d10] border border-white/8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 truncate">{expA.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                    {expA.status}
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Target QR:</span>
                    <span className="text-zinc-200">{expA.qrName}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Total Observations:</span>
                    <span className="text-primary font-bold">
                      {expA.totalObservations.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Variants Count:</span>
                    <span className="text-zinc-200">{expA.variants.length}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">VARIANTS</div>
                  {expA.variants.map((v, i) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between text-xs p-2 rounded bg-white/[0.02] border border-white/5 font-mono"
                    >
                      <span className="text-zinc-300 truncate">
                        {String.fromCharCode(65 + i)}: {v.name}
                      </span>
                      <span className="text-zinc-400">{v.trafficWeight}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2 */}
              <div className="p-4 rounded-xl bg-[#0d0d10] border border-white/8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 truncate">{expB.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                    {expB.status}
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Target QR:</span>
                    <span className="text-zinc-200">{expB.qrName}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Total Observations:</span>
                    <span className="text-primary font-bold">
                      {expB.totalObservations.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Variants Count:</span>
                    <span className="text-zinc-200">{expB.variants.length}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">VARIANTS</div>
                  {expB.variants.map((v, i) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between text-xs p-2 rounded bg-white/[0.02] border border-white/5 font-mono"
                    >
                      <span className="text-zinc-300 truncate">
                        {String.fromCharCode(65 + i)}: {v.name}
                      </span>
                      <span className="text-zinc-400">{v.trafficWeight}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">
              Need at least 2 experiments to run comparison.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
