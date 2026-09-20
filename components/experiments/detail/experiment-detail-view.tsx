"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Split,
  QrCode,
  Play,
  Pause,
  CheckCircle2,
  Sliders,
  Activity,
  FlaskConical,
  ExternalLink,
  Clock,
  ShieldCheck,
  MoreVertical,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExperimentItem, ExperimentStatus, ExperimentVariantItem } from "../types";
import { ExperimentTopology } from "../visualization/experiment-topology";
import { TrafficBraid } from "../visualization/traffic-braid";
import { AllocationLattice } from "../visualization/allocation-lattice";
import { ExperimentSimulationDialog } from "../dialogs/experiment-simulation-dialog";
import { VariantInspectorSheet } from "../inspectors/variant-inspector-sheet";
import { ExperimentAlertDialogs } from "../dialogs/experiment-alert-dialogs";

interface ExperimentDetailViewProps {
  experiment: ExperimentItem;
  orgSlug: string;
}

export function ExperimentDetailView({
  experiment: initialExp,
  orgSlug,
}: ExperimentDetailViewProps) {
  const router = useRouter();
  const [experiment, setExperiment] = React.useState<ExperimentItem>(initialExp);
  const [activeTab, setActiveTab] = React.useState<"overview" | "braid" | "lattice">("overview");

  // Dialogs & Sheets
  const [isSimulateOpen, setIsSimulateOpen] = React.useState(false);
  const [inspectingVariant, setInspectingVariant] = React.useState<ExperimentVariantItem | null>(null);
  const [alertState, setAlertState] = React.useState<{
    type: "PAUSE" | "RESUME" | "COMPLETE" | "DELETE" | null;
  }>({ type: null });

  const isRunning = experiment.status === "ACTIVE";
  const isPaused = experiment.status === "PAUSED";
  const isCompleted = experiment.status === "COMPLETED";

  const handleExecuteAlertAction = async (
    action: "PAUSE" | "RESUME" | "COMPLETE" | "DELETE"
  ) => {
    try {
      if (action === "DELETE") {
        await fetch(`/api/v1/experiments/${experiment.id}`, { method: "DELETE" }).catch(() => null);
        toast.success("Experiment archived.");
        router.push(`/${orgSlug}/experiments`);
      } else {
        const nextStatus: ExperimentStatus =
          action === "PAUSE" ? "PAUSED" : action === "RESUME" ? "ACTIVE" : "COMPLETED";

        await fetch(`/api/v1/experiments/${experiment.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }).catch(() => null);

        setExperiment((prev) => ({ ...prev, status: nextStatus }));
        if (action === "PAUSE") toast.info("A/B routing paused. Traffic routed to Control.");
        if (action === "RESUME") toast.success("A/B routing resumed across edge workers.");
        if (action === "COMPLETE") toast.success("Experiment marked completed.");
      }
    } catch {
      toast.error("Failed to update experiment.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Breadcrumb Row */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Link href={`/${orgSlug}`} className="hover:text-white transition-colors">
          Workspace
        </Link>
        <ChevronRight className="h-3 w-3 text-zinc-600" />
        <Link href={`/${orgSlug}/experiments`} className="hover:text-white transition-colors">
          Intelligence
        </Link>
        <ChevronRight className="h-3 w-3 text-zinc-600" />
        <Link href={`/${orgSlug}/experiments`} className="hover:text-white transition-colors">
          Experiments
        </Link>
        <ChevronRight className="h-3 w-3 text-zinc-600" />
        <span className="text-zinc-200 font-medium truncate max-w-[200px]">
          {experiment.name}
        </span>
      </nav>

      {/* Control Room Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#111114] border border-white/8 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-6 px-2 text-xs text-zinc-400 hover:text-white gap-1"
            >
              <Link href={`/${orgSlug}/experiments`}>
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Lab
              </Link>
            </Button>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                isRunning
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : isPaused
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : isCompleted
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
              }`}
            >
              {isRunning && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              {experiment.status}
            </span>

            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-zinc-300 font-mono">
              <QrCode className="h-3 w-3 text-primary" />
              <span>{experiment.qrName}</span>
              <span className="text-zinc-500 font-mono text-[10px]">({experiment.qrSlug})</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-1 truncate">
            {experiment.name}
          </h1>

          {experiment.description && (
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">{experiment.description}</p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSimulateOpen(true)}
            className="h-8 text-xs bg-black/40 border-white/10 text-zinc-200 hover:text-white gap-1.5"
          >
            <FlaskConical className="h-3.5 w-3.5 text-primary" />
            Simulate Traffic
          </Button>

          {isRunning && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAlertState({ type: "PAUSE" })}
              className="h-8 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 gap-1.5"
            >
              <Pause className="h-3.5 w-3.5" />
              Pause
            </Button>
          )}

          {isPaused && (
            <Button
              size="sm"
              onClick={() => setAlertState({ type: "RESUME" })}
              className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              Resume
            </Button>
          )}

          {!isCompleted && (
            <Button
              size="sm"
              onClick={() => setAlertState({ type: "COMPLETE" })}
              className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-lg shadow-primary/20"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Complete
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-[#161619] border-white/10 text-xs text-zinc-200"
            >
              <DropdownMenuItem
                onClick={() => setAlertState({ type: "DELETE" })}
                className="text-red-400 hover:text-red-300 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Archive Experiment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Centerpiece: Branching Flow Geometry */}
      <ExperimentTopology
        qrName={experiment.qrName}
        qrSlug={experiment.qrSlug}
        variants={experiment.variants}
        totalObservations={experiment.totalObservations}
        status={experiment.status}
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
            activeTab === "overview"
              ? "bg-white/10 text-white border border-white/10"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          }`}
        >
          Overview &amp; Variants
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("braid")}
          className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
            activeTab === "braid"
              ? "bg-white/10 text-white border border-white/10"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          }`}
        >
          Traffic Braid
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("lattice")}
          className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
            activeTab === "lattice"
              ? "bg-white/10 text-white border border-white/10"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          }`}
        >
          Allocation Lattice
        </button>
      </div>

      {/* Active Tab Surface */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Variant Performance Table */}
          <div className="bg-[#111114] border border-white/8 rounded-2xl overflow-hidden shadow-xl space-y-2 p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="font-semibold text-xs font-mono uppercase tracking-wider text-zinc-300">
                VARIANT PERFORMANCE MATRIX
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                DESCRIPTIVE OBSERVATIONS
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="text-[11px] font-mono uppercase text-zinc-500 border-b border-white/5">
                  <tr>
                    <th className="py-2.5 px-3">Variant</th>
                    <th className="py-2.5 px-3">Destination URL</th>
                    <th className="py-2.5 px-3">Allocation</th>
                    <th className="py-2.5 px-3">Observations</th>
                    <th className="py-2.5 px-3">Conversions</th>
                    <th className="py-2.5 px-3">Observed Rate</th>
                    <th className="py-2.5 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {experiment.variants.map((v, idx) => {
                    const convRate =
                      v.totalScans > 0
                        ? ((v.conversions / v.totalScans) * 100).toFixed(2)
                        : "0.00";

                    return (
                      <tr key={v.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 font-semibold text-zinc-200 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] ${
                                idx === 0
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-purple-500/20 text-purple-400"
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{v.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-zinc-400 max-w-[220px] truncate">
                          <a
                            href={v.destinationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white inline-flex items-center gap-1"
                          >
                            {v.destinationUrl}
                            <ExternalLink className="h-2.5 w-2.5 text-zinc-500" />
                          </a>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-zinc-200">
                          {v.trafficWeight}%
                        </td>
                        <td className="py-3 px-3 font-mono text-zinc-200">
                          {v.totalScans.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono text-zinc-200">
                          {v.conversions.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-primary">
                          {convRate}%
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInspectingVariant(v)}
                            className="h-7 px-2.5 text-xs text-zinc-400 hover:text-white"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Section 40: Insufficient data notice */}
            {experiment.totalObservations < 100 && (
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400 font-mono flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-500 shrink-0" />
                <span>
                  Descriptive measurements only. Not enough data for statistical inference yet.
                  Measurements will become more informative as real observations accumulate.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "braid" && (
        <TrafficBraid
          variants={experiment.variants}
          totalObservations={experiment.totalObservations}
        />
      )}

      {activeTab === "lattice" && (
        <AllocationLattice
          variants={experiment.variants}
          totalObservations={experiment.totalObservations}
        />
      )}

      {/* Scan Simulation Dialog */}
      <ExperimentSimulationDialog
        experiment={experiment}
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onSimulated={(updated) => setExperiment(updated)}
        orgSlug={orgSlug}
      />

      {/* Variant Inspector Sheet */}
      <VariantInspectorSheet
        variant={inspectingVariant}
        isOpen={Boolean(inspectingVariant)}
        onClose={() => setInspectingVariant(null)}
        qrName={experiment.qrName}
      />

      {/* Alert Confirmation Dialogs */}
      <ExperimentAlertDialogs
        actionType={alertState.type}
        experimentId={experiment.id}
        isOpen={Boolean(alertState.type)}
        onClose={() => setAlertState({ type: null })}
        onConfirm={(_, action) => handleExecuteAlertAction(action)}
      />
    </div>
  );
}
