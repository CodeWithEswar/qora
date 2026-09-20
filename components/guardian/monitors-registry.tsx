"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { GuardianMonitorSummaryV1, GuardianHealthState } from "@nxtqr/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface MonitorsRegistryProps {
  monitors: GuardianMonitorSummaryV1[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  healthFilter: string;
  onHealthFilterChange: (filter: string) => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  onSelectMonitor: (monitor: GuardianMonitorSummaryV1) => void;
  onRunCheck: (monitor: GuardianMonitorSummaryV1) => void;
  onConfigureFallback: (monitor: GuardianMonitorSummaryV1) => void;
  onTogglePause: (monitor: GuardianMonitorSummaryV1) => void;
  onDeleteMonitor: (monitor: GuardianMonitorSummaryV1) => void;
  onClearFilters: () => void;
}

export function MonitorsRegistry({
  monitors,
  searchQuery,
  onSearchChange,
  healthFilter,
  onHealthFilterChange,
  sortOption,
  onSortChange,
  onSelectMonitor,
  onRunCheck,
  onConfigureFallback,
  onTogglePause,
  onDeleteMonitor,
  onClearFilters,
}: MonitorsRegistryProps) {
  // Sort monitors
  const sortedMonitors = React.useMemo(() => {
    const list = [...monitors];
    if (sortOption === "recent") {
      list.sort((a, b) => {
        const tA = a.lastCheckedAt ? new Date(a.lastCheckedAt).getTime() : 0;
        const tB = b.lastCheckedAt ? new Date(b.lastCheckedAt).getTime() : 0;
        return tB - tA;
      });
    } else if (sortOption === "oldest") {
      list.sort((a, b) => {
        const tA = a.lastCheckedAt ? new Date(a.lastCheckedAt).getTime() : 0;
        const tB = b.lastCheckedAt ? new Date(b.lastCheckedAt).getTime() : 0;
        return tA - tB;
      });
    } else if (sortOption === "alpha") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "health") {
      const rank: Record<GuardianHealthState, number> = {
        UNAVAILABLE: 0,
        DEGRADED: 1,
        UNKNOWN: 2,
        HEALTHY: 3,
        PAUSED: 4,
      };
      list.sort((a, b) => rank[a.currentHealth] - rank[b.currentHealth]);
    }
    return list;
  }, [monitors, sortOption]);

  const hasActiveFilters = searchQuery.trim() !== "" || (healthFilter && healthFilter !== "all");

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Filters, Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Icon
            icon="solar:magnifer-linear"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search destination, QR asset or hostname..."
            className="pl-9 h-9 text-xs bg-surface border-border focus:border-[#FA520F]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              <Icon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Health Filter Select */}
          <Select value={healthFilter} onValueChange={onHealthFilterChange}>
            <SelectTrigger className="h-9 text-xs w-[140px] bg-surface border-border">
              <SelectValue placeholder="All Health" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Health</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="degraded">Degraded</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Select */}
          <Select value={sortOption} onValueChange={onSortChange}>
            <SelectTrigger className="h-9 text-xs w-[140px] bg-surface border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Checked</SelectItem>
              <SelectItem value="oldest">Oldest Check</SelectItem>
              <SelectItem value="health">Health State</SelectItem>
              <SelectItem value="alpha">Destination A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-muted-foreground font-mono text-[11px]">Filters:</span>
          {healthFilter && healthFilter !== "all" && (
            <Badge
              variant="secondary"
              className="gap-1 text-[11px] font-mono cursor-pointer"
              onClick={() => onHealthFilterChange("all")}
            >
              <span>Health: {healthFilter}</span>
              <Icon icon="solar:close-circle-bold" className="w-3 h-3" />
            </Badge>
          )}
          {searchQuery && (
            <Badge
              variant="secondary"
              className="gap-1 text-[11px] font-mono cursor-pointer"
              onClick={() => onSearchChange("")}
            >
              <span>Query: {searchQuery}</span>
              <Icon icon="solar:close-circle-bold" className="w-3 h-3" />
            </Badge>
          )}
          <button
            onClick={onClearFilters}
            className="text-[11px] font-mono text-[#FA520F] hover:underline cursor-pointer ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Registry */}
      {sortedMonitors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-surface/50 p-8 text-center space-y-3">
          <Icon icon="solar:filter-linear" className="w-6 h-6 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground font-mono">
              NO MONITORS MATCH THESE FILTERS
            </h4>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search terms or clearing health state filters.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs h-8 cursor-pointer border-border"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Hybrid Registry View */}
          <div className="hidden lg:block rounded-xl border border-border/80 bg-surface/90 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/20 text-[11px] font-mono text-muted-foreground">
                  <th className="py-3 pl-4 pr-3 font-medium">Destination & Asset</th>
                  <th className="px-3 py-3 font-medium">Status & Health</th>
                  <th className="px-3 py-3 font-medium">Last Check</th>
                  <th className="px-3 py-3 font-medium">Policy</th>
                  <th className="px-3 py-3 font-medium">Fallback</th>
                  <th className="px-3 py-3 font-medium">Recent Observations</th>
                  <th className="py-3 pl-3 pr-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {sortedMonitors.map((m) => {
                  let hostname = m.destinationUrl;
                  try {
                    hostname = new URL(m.destinationUrl).hostname;
                  } catch {}

                  const isHealthy = m.currentHealth === "HEALTHY";
                  const isDegraded = m.currentHealth === "DEGRADED";
                  const isUnavailable = m.currentHealth === "UNAVAILABLE";
                  const isPaused = m.status === "PAUSED";

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Destination & Asset */}
                      <td
                        onClick={() => onSelectMonitor(m)}
                        className="py-3.5 pl-4 pr-3 max-w-xs cursor-pointer"
                      >
                        <div className="font-semibold text-foreground truncate group-hover:text-[#FA520F] transition-colors">
                          {hostname}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground truncate">
                          {m.qrName || m.name}
                        </div>
                      </td>

                      {/* Status & Health */}
                      <td
                        onClick={() => onSelectMonitor(m)}
                        className="px-3 py-3.5 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isHealthy
                                ? "bg-emerald-500"
                                : isDegraded
                                ? "bg-amber-500"
                                : isUnavailable
                                ? "bg-rose-500"
                                : "bg-muted-foreground"
                            }`}
                          />
                          <span
                            className={`font-mono text-[11px] font-semibold ${
                              isHealthy
                                ? "text-emerald-600 dark:text-emerald-400"
                                : isDegraded
                                ? "text-amber-600 dark:text-amber-400"
                                : isUnavailable
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {m.currentHealth}
                          </span>
                        </div>
                      </td>

                      {/* Last Check */}
                      <td
                        onClick={() => onSelectMonitor(m)}
                        className="px-3 py-3.5 font-mono text-[11px] text-muted-foreground cursor-pointer"
                      >
                        {m.lastCheckedAt
                          ? new Date(m.lastCheckedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Pending check"}
                      </td>

                      {/* Policy */}
                      <td
                        onClick={() => onSelectMonitor(m)}
                        className="px-3 py-3.5 font-mono text-[11px] text-muted-foreground cursor-pointer"
                      >
                        <div>Every {Math.round(m.checkIntervalSec / 60)}m</div>
                        <div className="text-[10px] text-muted-foreground/80">
                          {m.failureThreshold} fail threshold
                        </div>
                      </td>

                      {/* Fallback */}
                      <td
                        onClick={() => onSelectMonitor(m)}
                        className="px-3 py-3.5 font-mono text-[11px] cursor-pointer"
                      >
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] ${
                            m.fallbackConfig?.readiness === "READY"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          {m.fallbackConfig?.readiness || "NOT_CONFIGURED"}
                        </span>
                      </td>

                      {/* Recent Observations */}
                      <td
                        onClick={() => onSelectMonitor(m)}
                        className="px-3 py-3.5 cursor-pointer"
                      >
                        <div className="flex items-center gap-1">
                          {m.recentObservations.slice(0, 6).map((obs) => (
                            <span
                              key={obs.id}
                              className={`w-2 h-2 rounded-full ${
                                obs.result === "HEALTHY"
                                  ? "bg-emerald-500"
                                  : obs.result === "DEGRADED"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                            />
                          ))}
                          {m.recentObservations.length === 0 && (
                            <span className="text-[10px] font-mono text-muted-foreground">
                              No probes yet
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions Menu */}
                      <td className="py-3.5 pl-3 pr-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                            >
                              <Icon icon="solar:menu-dots-bold" className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem
                              onClick={() => onSelectMonitor(m)}
                              className="gap-2 cursor-pointer"
                            >
                              <Icon icon="solar:eye-linear" className="w-3.5 h-3.5" />
                              <span>View Inspector</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => onRunCheck(m)}
                              className="gap-2 cursor-pointer"
                            >
                              <Icon icon="solar:refresh-linear" className="w-3.5 h-3.5" />
                              <span>Run Check</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => onConfigureFallback(m)}
                              className="gap-2 cursor-pointer"
                            >
                              <Icon icon="solar:restart-square-linear" className="w-3.5 h-3.5" />
                              <span>Configure Fallback</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => onTogglePause(m)}
                              className="gap-2 cursor-pointer"
                            >
                              <Icon
                                icon={
                                  isPaused
                                    ? "solar:play-circle-linear"
                                    : "solar:pause-circle-linear"
                                }
                                className="w-3.5 h-3.5"
                              />
                              <span>{isPaused ? "Resume Monitoring" : "Pause Monitoring"}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => onDeleteMonitor(m)}
                              className="gap-2 cursor-pointer text-rose-500 focus:text-rose-500"
                            >
                              <Icon icon="solar:trash-bin-trash-linear" className="w-3.5 h-3.5" />
                              <span>Delete Monitor</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Operational Cards View */}
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {sortedMonitors.map((m) => {
              let hostname = m.destinationUrl;
              try {
                hostname = new URL(m.destinationUrl).hostname;
              } catch {}

              const isHealthy = m.currentHealth === "HEALTHY";
              const isDegraded = m.currentHealth === "DEGRADED";
              const isUnavailable = m.currentHealth === "UNAVAILABLE";

              return (
                <div
                  key={m.id}
                  className="rounded-xl border border-border/80 bg-surface/90 p-4 space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isHealthy
                              ? "bg-emerald-500"
                              : isDegraded
                              ? "bg-amber-500"
                              : isUnavailable
                              ? "bg-rose-500"
                              : "bg-muted-foreground"
                          }`}
                        />
                        <span className="font-mono text-[11px] font-bold uppercase text-foreground">
                          {m.currentHealth}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-foreground truncate">
                        {hostname}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground truncate">
                        {m.qrName || m.name}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          <Icon icon="solar:menu-dots-bold" className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem onClick={() => onSelectMonitor(m)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRunCheck(m)}>
                          Run Check
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onConfigureFallback(m)}>
                          Configure Fallback
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteMonitor(m)}
                          className="text-rose-500"
                        >
                          Delete Monitor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted-foreground border-t border-border/50 pt-2">
                    <div>
                      Last Check:{" "}
                      <span className="text-foreground">
                        {m.lastCheckedAt
                          ? new Date(m.lastCheckedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Pending"}
                      </span>
                    </div>
                    <div>
                      Fallback:{" "}
                      <span className="text-foreground">
                        {m.fallbackConfig?.readiness || "None"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      {m.recentObservations.slice(0, 5).map((obs) => (
                        <span
                          key={obs.id}
                          className={`w-2 h-2 rounded-full ${
                            obs.result === "HEALTHY"
                              ? "bg-emerald-500"
                              : obs.result === "DEGRADED"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectMonitor(m)}
                      className="text-xs h-7 px-2.5 cursor-pointer border-border"
                    >
                      Open Monitor
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
