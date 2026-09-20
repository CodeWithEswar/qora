"use client";

import * as React from "react";
import {
  MoreVertical,
  FlaskConical,
  Eye,
  Pause,
  Play,
  CheckCircle2,
  Trash2,
  QrCode,
  Trophy,
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

interface ExperimentListProps {
  experiments: ExperimentItem[];
  onInspect: (exp: ExperimentItem) => void;
  onSimulate: (exp: ExperimentItem) => void;
  onStatusChange: (expId: string, status: ExperimentStatus) => void;
  onDelete: (expId: string) => void;
  onOpenCreate: () => void;
}

export function ExperimentList({
  experiments,
  onInspect,
  onSimulate,
  onStatusChange,
  onDelete,
  onOpenCreate,
}: ExperimentListProps) {
  if (experiments.length === 0) {
    return null; // Empty state handled by parent or shared
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs text-card-foreground">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/70 border-b border-border text-[11px] font-mono uppercase text-muted-foreground">
            <tr>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Experiment Name</th>
              <th className="py-3 px-4">Target Dynamic QR</th>
              <th className="py-3 px-4">Traffic Allocation</th>
              <th className="py-3 px-4">Observations</th>
              <th className="py-3 px-4">Outcome</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-sans">
            {experiments.map((exp) => {
              const isRunning = exp.status === "ACTIVE";
              const isPaused = exp.status === "PAUSED";
              const isCompleted = exp.status === "COMPLETED";

              // Split summary
              const splitText = exp.variants
                .map((v, i) => `${String.fromCharCode(65 + i)}: ${v.trafficWeight}%`)
                .join(" · ");

              return (
                <tr
                  key={exp.id}
                  className="hover:bg-muted/50 transition-colors group cursor-pointer"
                  onClick={() => onInspect(exp)}
                >
                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
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
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
                      )}
                      {exp.status}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="py-3.5 px-4 font-semibold text-foreground group-hover:text-primary transition-colors max-w-[200px] truncate">
                    {exp.name}
                  </td>

                  {/* Target QR */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] text-foreground font-mono">
                      <QrCode className="h-3 w-3 text-primary shrink-0" />
                      <span className="truncate max-w-[120px]">{exp.qrName}</span>
                    </div>
                  </td>

                  {/* Traffic Allocation */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    {splitText}
                  </td>

                  {/* Observations */}
                  <td className="py-3.5 px-4 font-mono text-foreground whitespace-nowrap">
                    {exp.totalObservations.toLocaleString()}
                  </td>

                  {/* Outcome */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {exp.totalObservations > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Trophy className="h-3 w-3" />
                        Evaluating
                      </span>
                    ) : (
                      <span className="font-mono text-muted-foreground text-[11px]">Collecting</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSimulate(exp)}
                        title="Simulate Scan"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <FlaskConical className="h-3.5 w-3.5 text-primary" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onInspect(exp)}
                        title="Inspect"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 bg-popover border-border text-xs text-popover-foreground shadow-xl"
                        >
                          {isRunning && (
                            <DropdownMenuItem
                              onClick={() => onStatusChange(exp.id, "PAUSED")}
                              className="text-amber-600 dark:text-amber-400 focus:bg-muted"
                            >
                              <Pause className="h-3.5 w-3.5 mr-2" />
                              Pause
                            </DropdownMenuItem>
                          )}
                          {isPaused && (
                            <DropdownMenuItem
                              onClick={() => onStatusChange(exp.id, "ACTIVE")}
                              className="text-emerald-600 dark:text-emerald-400 focus:bg-muted"
                            >
                              <Play className="h-3.5 w-3.5 mr-2" />
                              Resume
                            </DropdownMenuItem>
                          )}
                          {!isCompleted && (
                            <DropdownMenuItem
                              onClick={() => onStatusChange(exp.id, "COMPLETED")}
                              className="text-blue-600 dark:text-blue-400 focus:bg-muted"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                              Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            onClick={() => onDelete(exp.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:bg-muted"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
