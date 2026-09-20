"use client";

import * as React from "react";
import {
  MoreVertical,
  QrCode,
  Play,
  Pause,
  CheckCircle2,
  Sliders,
  TrendingUp,
  FlaskConical,
  ExternalLink,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExperimentItem, ExperimentStatus } from "../types";
import { ExperimentTopology } from "../visualization/experiment-topology";

interface ExperimentSignalNodeProps {
  experiment: ExperimentItem;
  onInspect: (exp: ExperimentItem) => void;
  onSimulate: (exp: ExperimentItem) => void;
  onStatusChange: (expId: string, status: ExperimentStatus) => void;
  onDelete: (expId: string) => void;
}

export function ExperimentSignalNode({
  experiment,
  onInspect,
  onSimulate,
  onStatusChange,
  onDelete,
}: ExperimentSignalNodeProps) {
  const isRunning = experiment.status === "ACTIVE";
  const isPaused = experiment.status === "PAUSED";
  const isCompleted = experiment.status === "COMPLETED";

  return (
    <div className="group relative bg-card hover:bg-card/90 border border-border hover:border-primary/40 rounded-2xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-4 text-card-foreground">
      {/* Node Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          {/* Status & QR Source Badge Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                isRunning
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : isPaused
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : isCompleted
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {isRunning && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              )}
              {experiment.status}
            </span>

            {/* Target QR Source Badge */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] text-foreground font-mono">
              <QrCode className="h-3 w-3 text-primary" />
              <span className="truncate max-w-[140px]">{experiment.qrName}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground text-[10px]">{experiment.qrSlug}</span>
            </div>
          </div>

          {/* Experiment Title */}
          <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate pt-1">
            {experiment.name}
          </h3>

          {experiment.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{experiment.description}</p>
          )}
        </div>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-popover border-border text-popover-foreground text-xs shadow-xl"
          >
            <DropdownMenuItem
              onClick={() => onInspect(experiment)}
              className="cursor-pointer flex items-center gap-2 focus:bg-muted focus:text-foreground"
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              Inspect Experiment
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSimulate(experiment)}
              className="cursor-pointer flex items-center gap-2 focus:bg-muted focus:text-foreground"
            >
              <FlaskConical className="h-3.5 w-3.5 text-primary" />
              Simulate Scan Traffic
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            {isRunning && (
              <DropdownMenuItem
                onClick={() => onStatusChange(experiment.id, "PAUSED")}
                className="cursor-pointer flex items-center gap-2 text-amber-600 dark:text-amber-400 focus:bg-muted"
              >
                <Pause className="h-3.5 w-3.5" />
                Pause Routing
              </DropdownMenuItem>
            )}
            {isPaused && (
              <DropdownMenuItem
                onClick={() => onStatusChange(experiment.id, "ACTIVE")}
                className="cursor-pointer flex items-center gap-2 text-emerald-600 dark:text-emerald-400 focus:bg-muted"
              >
                <Play className="h-3.5 w-3.5" />
                Resume Routing
              </DropdownMenuItem>
            )}
            {!isCompleted && (
              <DropdownMenuItem
                onClick={() => onStatusChange(experiment.id, "COMPLETED")}
                className="cursor-pointer flex items-center gap-2 text-blue-600 dark:text-blue-400 focus:bg-muted"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Declare Winner & End
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={() => onDelete(experiment.id)}
              className="cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:bg-muted"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Archive Experiment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Visual Traffic Split Pipeline */}
      <ExperimentTopology
        qrName={experiment.qrName}
        qrSlug={experiment.qrSlug}
        variants={experiment.variants}
        totalObservations={experiment.totalObservations}
        status={experiment.status}
      />

      {/* Node Bottom Controls & Telemetry */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/80 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span>CREATED:</span>
          <span className="text-foreground">
            {new Date(experiment.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSimulate(experiment)}
            className="h-7 px-2.5 text-xs bg-background border-border text-foreground hover:bg-muted hover:text-primary hover:border-primary/40 gap-1.5"
          >
            <FlaskConical className="h-3 w-3 text-primary" />
            Simulate
          </Button>

          <Button
            size="sm"
            onClick={() => onInspect(experiment)}
            className="h-7 px-3 text-xs bg-primary hover:bg-[#cc3a05] text-white shadow-xs"
          >
            Inspect
          </Button>
        </div>
      </div>
    </div>
  );
}
