"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Split,
  QrCode,
  ExternalLink,
  Play,
  Pause,
  CheckCircle2,
  Trophy,
  Activity,
  Cpu,
  ShieldCheck,
  FlaskConical,
} from "lucide-react";
import { ExperimentItem, ExperimentStatus } from "../types";

interface ExperimentInspectorSheetProps {
  experiment: ExperimentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSimulate: (exp: ExperimentItem) => void;
  onStatusChange: (expId: string, status: ExperimentStatus) => void;
  orgSlug?: string;
}

export function ExperimentInspectorSheet({
  experiment,
  isOpen,
  onClose,
  onSimulate,
  onStatusChange,
  orgSlug,
}: ExperimentInspectorSheetProps) {
  if (!experiment) return null;

  const isRunning = experiment.status === "ACTIVE";
  const isPaused = experiment.status === "PAUSED";
  const isCompleted = experiment.status === "COMPLETED";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-[#111114] border-l border-white/10 text-white p-0 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Header */}
        <SheetHeader className="p-5 sm:p-6 pb-4 border-b border-white/8 bg-[#141418] text-left">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-wider uppercase font-bold">
              <Split className="h-3.5 w-3.5" />
              <span>EXPERIMENT TELEMETRY INSPECTOR</span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                isRunning
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : isPaused
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : isCompleted
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
              }`}
            >
              {isRunning && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              {experiment.status}
            </span>
          </div>

          <SheetTitle className="text-lg font-semibold text-white tracking-tight pt-1 truncate">
            {experiment.name}
          </SheetTitle>

          <SheetDescription className="text-xs text-zinc-400">
            {experiment.description || "Edge dynamic routing experiment comparing variant destinations."}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Target QR Card */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 space-y-2">
            <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
              AUTHORITATIVE DYNAMIC QR SOURCE
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <QrCode className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-zinc-200">{experiment.qrName}</span>
                <span className="text-zinc-500 font-mono text-[10px]">({experiment.qrSlug})</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Total Obs: {experiment.totalObservations.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Variants Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200 font-mono text-[11px] uppercase tracking-wider">
                ACTIVE VARIANTS ({experiment.variants.length})
              </span>
              <span className="text-zinc-500 text-[10px] font-mono">WEIGHT / CONV RATE</span>
            </div>

            <div className="space-y-2.5">
              {experiment.variants.map((v, idx) => {
                const scanRate =
                  v.totalScans > 0 ? ((v.conversions / v.totalScans) * 100).toFixed(1) : "0.0";

                return (
                  <div
                    key={v.id || idx}
                    className="p-3.5 rounded-xl bg-[#0d0d10] border border-white/8 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] ${
                            idx === 0
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-xs font-semibold text-zinc-200">{v.name}</span>
                        {idx === 0 ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                            CONTROL
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                            CHALLENGER
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-zinc-400">{v.trafficWeight}% weight</span>
                        <span className="text-primary font-bold">{scanRate}% conv</span>
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-black/40 p-2 rounded-lg border border-white/5 truncate font-mono text-[11px]">
                      <span className="text-zinc-500">➔</span>
                      <a
                        href={v.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:text-white inline-flex items-center gap-1 flex-1"
                      >
                        {v.destinationUrl}
                        <ExternalLink className="h-3 w-3 text-zinc-500 inline shrink-0" />
                      </a>
                    </div>

                    {/* Telemetry Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-zinc-400">
                      <div>Scans: {v.totalScans.toLocaleString()}</div>
                      <div>Conversions: {v.conversions.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edge Architecture Note */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase font-bold">
              <Cpu className="h-3.5 w-3.5" />
              <span>DETERMINISTIC EDGE ROUTING ENGINE</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Every scan arriving at the Cloudflare Edge redirect worker is mapped to a variant
              using high-entropy seed hashing. The assigned destination is resolved in &lt;10ms
              without roundtrips to central storage.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/8 bg-[#141418] flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSimulate(experiment)}
            className="h-8 text-xs bg-black/40 border-white/10 text-zinc-200 hover:text-white gap-1.5"
          >
            <FlaskConical className="h-3.5 w-3.5 text-primary" />
            Simulate Traffic
          </Button>

          <div className="flex items-center gap-2">
            {isRunning && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(experiment.id, "PAUSED")}
                className="h-8 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 gap-1.5"
              >
                <Pause className="h-3.5 w-3.5" />
                Pause
              </Button>
            )}

            {isPaused && (
              <Button
                size="sm"
                onClick={() => onStatusChange(experiment.id, "ACTIVE")}
                className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5"
              >
                <Play className="h-3.5 w-3.5" />
                Resume
              </Button>
            )}

            {!isCompleted && (
              <Button
                size="sm"
                onClick={() => onStatusChange(experiment.id, "COMPLETED")}
                className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
