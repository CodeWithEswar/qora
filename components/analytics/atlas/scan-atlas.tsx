"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Maximize2,
  RotateCcw,
  Globe,
  Layers,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface GeoDataPoint {
  countryCode: string;
  countryName: string;
  scans: number;
  uniqueScans: number;
  percentage: number;
  topDevice: string;
  topDestination: string;
}

interface ScanAtlasProps {
  data: GeoDataPoint[];
  selectedCountry?: string;
  onSelectCountry?: (countryCode: string) => void;
  className?: string;
}

// Official United Nations 3-digit continent codes per Google Charts GeoChart specification
const REGION_OPTIONS = [
  { id: "world", label: "World" },
  { id: "142", label: "Asia" },
  { id: "150", label: "Europe" },
  { id: "021", label: "North America" },
  { id: "005", label: "South America" },
  { id: "002", label: "Africa" },
  { id: "009", label: "Oceania" },
];

declare global {
  interface Window {
    google?: any;
    __googleChartsPromise?: Promise<void>;
  }
}

/**
 * Loads the official Google Charts loader.js and initializes the 'geochart' package.
 * Singleton promise guarantees loader.js is fetched only once across the entire application.
 */
function loadGoogleGeoChart(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.google?.visualization?.GeoChart) {
    return Promise.resolve();
  }

  if (window.__googleChartsPromise) {
    return window.__googleChartsPromise;
  }

  window.__googleChartsPromise = new Promise<void>((resolve, reject) => {
    const initPackage = () => {
      try {
        window.google.charts.load("current", {
          packages: ["geochart"],
        });
        window.google.charts.setOnLoadCallback(() => {
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    };

    if (window.google?.charts) {
      initPackage();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.gstatic.com/charts/loader.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => initPackage());
      existingScript.addEventListener("error", (e) =>
        reject(new Error("Failed to load https://www.gstatic.com/charts/loader.js"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/charts/loader.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => initPackage();
    script.onerror = (e) =>
      reject(new Error("Failed to load https://www.gstatic.com/charts/loader.js"));
    document.head.appendChild(script);
  });

  return window.__googleChartsPromise;
}

interface GoogleGeoChartCanvasProps {
  data: GeoDataPoint[];
  activeRegion: string;
  isDark: boolean;
  selectedCountry?: string;
  onSelectCountry?: (countryCode: string) => void;
  className?: string;
}

/**
 * Official Google Charts GeoChart renderer using SVG vector projection.
 */
function GoogleGeoChartCanvas({
  data,
  activeRegion,
  isDark,
  selectedCountry,
  onSelectCountry,
  className,
}: GoogleGeoChartCanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartInstanceRef = React.useRef<any>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const initChart = React.useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      await loadGoogleGeoChart();
      if (!containerRef.current || !window.google?.visualization?.GeoChart) {
        return;
      }

      // Create new GeoChart instance or reuse
      if (!chartInstanceRef.current) {
        chartInstanceRef.current = new window.google.visualization.GeoChart(
          containerRef.current
        );

        // Official Google Charts 'regionClick' event listener
        window.google.visualization.events.addListener(
          chartInstanceRef.current,
          "regionClick",
          (event: { region: string }) => {
            if (event?.region) {
              onSelectCountry?.(event.region);
            }
          }
        );

        // Official Google Charts 'select' event listener
        window.google.visualization.events.addListener(
          chartInstanceRef.current,
          "select",
          () => {
            const selection = chartInstanceRef.current?.getSelection();
            if (
              selection &&
              selection.length > 0 &&
              selection[0].row !== null &&
              selection[0].row !== undefined
            ) {
              const rowItem = data[selection[0].row];
              if (rowItem?.countryCode) {
                onSelectCountry?.(rowItem.countryCode);
              }
            }
          }
        );
      }

      // Build DataTable using official Google Visualization API
      const dataTable = new window.google.visualization.DataTable();
      dataTable.addColumn("string", "Country");
      dataTable.addColumn("number", "Scans");
      dataTable.addColumn({ type: "string", role: "tooltip", p: { html: true } });

      if (data && data.length > 0) {
        data.forEach((d) => {
          const tooltipHtml = `
            <div style="
              background: ${isDark ? "#18181c" : "#ffffff"};
              color: ${isDark ? "#F7F4EC" : "#111111"};
              border: 1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"};
              border-radius: 10px;
              padding: 10px 14px;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              box-shadow: 0 12px 28px rgba(0,0,0,0.35);
              min-width: 170px;
              pointer-events: none;
            ">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}; padding-bottom: 6px; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 13px;">${d.countryName || d.countryCode}</span>
                <span style="font-family: monospace; font-size: 10px; color: #FA520F; background: rgba(250,82,15,0.12); border: 1px solid rgba(250,82,15,0.25); padding: 1.5px 5px; border-radius: 4px; font-weight: 700;">${d.countryCode}</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-family: monospace; margin-bottom: 6px;">
                <div>
                  <div style="font-size: 9px; color: ${isDark ? "#85827B" : "#6c757d"};">SCANS</div>
                  <div style="font-size: 13px; font-weight: bold; color: ${isDark ? "#F7F4EC" : "#111111"};">${(d.scans || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div style="font-size: 9px; color: ${isDark ? "#85827B" : "#6c757d"};">SHARE</div>
                  <div style="font-size: 13px; font-weight: bold; color: #FA520F;">${d.percentage || 0}%</div>
                </div>
              </div>
              ${
                d.topDevice
                  ? `<div style="font-size: 11px; color: ${isDark ? "#B8B5AD" : "#495057"}; display: flex; justify-content: space-between; margin-top: 3px;">
                      <span>Top Device:</span>
                      <b style="text-transform: capitalize; color: ${isDark ? "#F7F4EC" : "#111111"};">${d.topDevice}</b>
                    </div>`
                  : ""
              }
              ${
                d.topDestination
                  ? `<div style="font-size: 11px; color: ${isDark ? "#B8B5AD" : "#495057"}; display: flex; justify-content: space-between; margin-top: 2px;">
                      <span>Destination:</span>
                      <b style="max-width: 95px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: ${isDark ? "#F7F4EC" : "#111111"};">${d.topDestination}</b>
                    </div>`
                  : ""
              }
            </div>
          `;
          dataTable.addRow([d.countryCode, d.scans, tooltipHtml]);
        });
      } else {
        dataTable.addRow(["", 0, ""]);
      }

      // Configuration options from Google Charts documentation
      const options = {
        region: activeRegion,
        displayMode: "regions",
        resolution: "countries",
        backgroundColor: {
          fill: isDark ? "#111113" : "#ffffff",
          stroke: isDark ? "#1f1f24" : "#dee2e6",
          strokeWidth: 0,
        },
        datalessRegionColor: isDark ? "#1b1b20" : "#f1f3f5",
        defaultColor: isDark ? "#1b1b20" : "#f1f3f5",
        colorAxis: {
          colors: isDark
            ? ["#3D1E14", "#8A2A08", "#D63E04", "#FA520F", "#FF8105", "#FFB83E"]
            : ["#FFE4D6", "#FA8F60", "#FA520F", "#C43603", "#7A2000"],
        },
        legend: "none",
        tooltip: {
          isHtml: true,
          trigger: "focus",
        },
        keepAspectRatio: true,
        enableRegionInteractivity: true,
      };

      chartInstanceRef.current.draw(dataTable, options);
      setStatus("ready");
    } catch (err: any) {
      console.error("[GoogleGeoChart] Draw error:", err);
      setErrorMessage(err?.message || "Failed to initialize Google GeoChart.");
      setStatus("error");
    }
  }, [activeRegion, data, isDark, onSelectCountry]);

  React.useEffect(() => {
    initChart();
  }, [initChart]);

  // Window resize handler to maintain aspect ratio
  React.useEffect(() => {
    const handleResize = () => {
      if (status === "ready" && chartInstanceRef.current) {
        initChart();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initChart, status]);

  // Cleanup chart instance on unmount
  React.useEffect(() => {
    return () => {
      if (chartInstanceRef.current?.clearChart) {
        try {
          chartInstanceRef.current.clearChart();
        } catch {}
      }
    };
  }, []);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground bg-inherit z-10">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-mono tracking-wider uppercase">
            Loading Google Atlas...
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center z-10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Google Charts Atlas Notice</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {errorMessage || "Unable to reach Google Charts CDN. Please verify network or CSP settings."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={initChart}
            className="h-8 text-xs font-mono gap-1.5 rounded-lg border-border"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </Button>
        </div>
      )}

      {/* SVG Container mounted for Google Charts */}
      <div
        ref={containerRef}
        className={cn(
          "w-full h-full flex items-center justify-center select-none transition-opacity duration-300",
          status === "ready" ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

export function ScanAtlas({
  data = [],
  selectedCountry,
  onSelectCountry,
  className,
}: ScanAtlasProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [activeRegion, setActiveRegion] = React.useState<string>("world");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme !== "light" : true;

  const totalScans = React.useMemo(() => {
    return data.reduce((acc, d) => acc + (d.scans || 0), 0);
  }, [data]);

  const selectedPoint = React.useMemo(() => {
    if (!selectedCountry) return null;
    return data.find((d) => d.countryCode === selectedCountry) || null;
  }, [data, selectedCountry]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl relative flex flex-col justify-between overflow-hidden font-sans text-card-foreground",
        className
      )}
    >
      {/* Tooltip reset helper CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .google-visualization-tooltip {
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
          `,
        }}
      />

      {/* Canvas Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h3 className="font-serif text-lg font-normal tracking-tight text-foreground">
              Global Scan Field
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted border border-border">
              GOOGLE ATLAS
            </span>

            {selectedPoint && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-semibold animate-in fade-in">
                <span>{selectedPoint.countryName}</span>
                <button
                  onClick={() => onSelectCountry?.("")}
                  className="hover:text-foreground ml-0.5"
                  title="Clear filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Geographic signal origin density and regional edge routing flows
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-1.5 self-end sm:self-auto">
          {/* Active Mode Indicator */}
          <div className="flex items-center rounded-lg bg-muted px-2.5 py-1 border border-border text-[11px] font-mono text-foreground font-semibold">
            <Layers className="h-3 w-3 mr-1.5 text-primary" />
            <span>REGIONS</span>
          </div>

          {/* Continent Filter Selector (shadcn/ui) */}
          <Select value={activeRegion} onValueChange={setActiveRegion}>
            <SelectTrigger
              className="h-7 w-[125px] text-xs font-mono bg-muted/70 hover:bg-muted border border-border rounded-lg px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              title="Focus Continent"
            >
              <SelectValue placeholder="Continent" />
            </SelectTrigger>
            <SelectContent align="end" className="bg-popover border-border text-popover-foreground font-mono">
              {REGION_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.id}
                  value={opt.id}
                  className="text-xs font-mono cursor-pointer"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset View */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setActiveRegion("world");
              if (selectedCountry && onSelectCountry) onSelectCountry("");
            }}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Reset to World view"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          {/* Fullscreen Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(true)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Fullscreen Atlas"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Map Projection Canvas */}
      <div
        className={cn(
          "h-[340px] sm:h-[420px] w-full mt-3 rounded-xl border border-border/60 relative overflow-hidden flex items-center justify-center p-2",
          isDark ? "bg-[#111113]" : "bg-white"
        )}
      >
        {!mounted ? (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs font-mono">Loading Google Atlas...</span>
          </div>
        ) : (
          <GoogleGeoChartCanvas
            data={data}
            activeRegion={activeRegion}
            isDark={isDark}
            selectedCountry={selectedCountry}
            onSelectCountry={onSelectCountry}
          />
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="mt-3 pt-2 border-t border-border/80 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase text-muted-foreground">SCAN DENSITY:</span>
            <div className="flex items-center gap-1">
              {isDark ? (
                <>
                  <span className="w-2.5 h-2 rounded-xs bg-[#3D1E14]" />
                  <span className="w-2.5 h-2 rounded-xs bg-[#8A2A08]" />
                  <span className="w-2.5 h-2 rounded-xs bg-[#D63E04]" />
                  <span className="w-2.5 h-2 rounded-xs bg-[#FA520F]" />
                  <span className="w-2.5 h-2 rounded-xs bg-[#FFB83E]" />
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2 rounded-xs bg-[#FFE4D6]" />
                  <span className="w-2.5 h-2 rounded-xs bg-[#FA8F60]" />
                  <span className="w-2.5 h-2 rounded-xs bg-[#FA520F]" />
                  <span className="w-2.5 h-2 rounded-xs bg-[#C43603]" />
                  <span className="w-2.5 h-2 rounded-xs bg-[#7A2000]" />
                </>
              )}
            </div>
            <span className="text-[10px] font-bold text-foreground">
              {totalScans.toLocaleString()} TOTAL SCANS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Globe className="h-3 w-3 text-primary" />
          <span>Google Charts GeoChart (ISO-3166 Resolution)</span>
        </div>
      </div>

      {/* Fullscreen Modal Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] w-[1400px] h-[85vh] bg-card border-border p-6 flex flex-col justify-between">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
            <div>
              <DialogTitle className="font-serif text-xl font-normal text-foreground">
                Global Scan Field — Fullscreen Atlas
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                High-resolution Google Charts geographic telemetry projection
              </p>
            </div>
          </DialogHeader>

          <div
            className={cn(
              "flex-1 w-full my-4 rounded-xl border border-border overflow-hidden flex items-center justify-center p-4",
              isDark ? "bg-[#111113]" : "bg-white"
            )}
          >
            <GoogleGeoChartCanvas
              data={data}
              activeRegion={activeRegion}
              isDark={isDark}
              selectedCountry={selectedCountry}
              onSelectCountry={onSelectCountry}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
