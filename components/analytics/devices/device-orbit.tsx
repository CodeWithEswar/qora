"use client";

import * as React from "react";
import { DeviceEmpty } from "./device-empty";
import { cn } from "@/lib/utils";

export interface DevicePoint {
  name: string;
  value: number;
  percentage: number;
}

interface DeviceOrbitProps {
  deviceClasses: DevicePoint[];
  operatingSystems: DevicePoint[];
  browsers: DevicePoint[];
  totalScans: number;
  selectedDevice?: string;
  onSelectDevice?: (dev: string) => void;
  className?: string;
}

const ORBIT_COLORS = ["#FA520F", "#FF8105", "#FFA110", "#FFB83E", "#A3A3A3", "#737373"];

export function DeviceOrbit({
  deviceClasses = [],
  operatingSystems = [],
  browsers = [],
  totalScans = 0,
  selectedDevice,
  onSelectDevice,
  className,
}: DeviceOrbitProps) {
  const [orbitMode, setOrbitMode] = React.useState<"class" | "os" | "browser">("class");
  const [hoveredSegment, setHoveredSegment] = React.useState<DevicePoint | null>(null);

  const activeDataset = React.useMemo(() => {
    if (orbitMode === "os") return operatingSystems;
    if (orbitMode === "browser") return browsers;
    return deviceClasses;
  }, [orbitMode, deviceClasses, operatingSystems, browsers]);

  const hasData = totalScans > 0 && activeDataset.length > 0;

  // Compute SVG circular arc segments (Center: 150, 150, Radius: 90, Thickness: 18)
  const segments = React.useMemo(() => {
    if (!hasData) return [];

    let currentAngle = -90; // Start at top
    const radius = 88;
    const cx = 150;
    const cy = 150;

    return activeDataset.map((item, idx) => {
      const sweepAngle = Math.max(4, (item.value / (totalScans || 1)) * 360);
      const startAngle = currentAngle;
      const endAngle = currentAngle + sweepAngle;
      currentAngle = endAngle;

      // Convert angles to radians
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);

      const largeArcFlag = sweepAngle > 180 ? 1 : 0;
      const pathD = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

      return {
        ...item,
        pathD,
        color: ORBIT_COLORS[idx % ORBIT_COLORS.length],
      };
    });
  }, [activeDataset, hasData, totalScans]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between text-card-foreground",
        className
      )}
    >
      <div>
        {/* Header with Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-serif text-base font-normal tracking-tight text-foreground">
                Device Orbit
              </h4>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Concentric client telemetry distribution
            </p>
          </div>

          <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5 text-[11px] font-mono self-start sm:self-auto">
            <button
              onClick={() => setOrbitMode("class")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors",
                orbitMode === "class"
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Device
            </button>
            <button
              onClick={() => setOrbitMode("os")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors",
                orbitMode === "os"
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              OS
            </button>
            <button
              onClick={() => setOrbitMode("browser")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors",
                orbitMode === "browser"
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Browser
            </button>
          </div>
        </div>

        {/* Orbit Visualization Canvas */}
        <div className="my-6 flex flex-col items-center justify-center relative">
          {!hasData ? (
            <DeviceEmpty />
          ) : (
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg viewBox="0 0 300 300" className="w-full h-full select-none overflow-visible">
                {/* Background Track Ring */}
                <circle
                  cx="150"
                  cy="150"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  className="text-muted/60"
                  strokeWidth="20"
                />

                {/* Inner Reference Ring */}
                <circle
                  cx="150"
                  cy="150"
                  r="72"
                  fill="none"
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Segments */}
                {segments.map((seg, idx) => {
                  const isHovered = hoveredSegment?.name === seg.name;
                  const isSelected = selectedDevice?.toLowerCase() === seg.name.toLowerCase();

                  return (
                    <path
                      key={idx}
                      d={seg.pathD}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={isHovered || isSelected ? 24 : 18}
                      strokeLinecap="round"
                      onClick={() => onSelectDevice?.(seg.name)}
                      onMouseEnter={() => setHoveredSegment(seg)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        isHovered || isSelected
                          ? "opacity-100 filter drop-shadow-[0_0_8px_rgba(250,82,15,0.7)]"
                          : "opacity-80 hover:opacity-100"
                      )}
                    />
                  );
                })}
              </svg>

              {/* Center Metrics Pod */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-foreground tracking-tight tabular-nums">
                  {hoveredSegment
                    ? hoveredSegment.value.toLocaleString()
                    : totalScans.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
                  {hoveredSegment ? hoveredSegment.name : "TOTAL SCANS"}
                </span>
                {hoveredSegment && (
                  <span className="text-xs font-mono font-semibold text-primary mt-0.5">
                    {hoveredSegment.percentage}%
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Interactive Legend Grid below chart */}
          {hasData && (
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-3 border-t border-border">
              {segments.map((seg, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectDevice?.(seg.name)}
                  onMouseEnter={() => setHoveredSegment(seg)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors text-xs"
                >
                  <span
                    style={{ backgroundColor: seg.color }}
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-medium text-foreground capitalize truncate block text-[11px]">
                      {seg.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                      {seg.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Coarse platform detection</span>
        <span>Click segment to filter</span>
      </div>
    </div>
  );
}
