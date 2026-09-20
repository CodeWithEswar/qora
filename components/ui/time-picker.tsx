"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface TimePickerProps {
  value?: string; // Format: "HH:mm" (24-hour)
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const QUICK_PRESETS = [
  { label: "09:00", desc: "Work" },
  { label: "12:00", desc: "Lunch" },
  { label: "18:00", desc: "Close" },
  { label: "22:00", desc: "Night" },
];

export function TimePicker({
  value = "12:00",
  onChange,
  className,
  disabled = false,
  placeholder = "12:00",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse hours and minutes from value
  const [selectedHour, selectedMinute] = React.useMemo(() => {
    if (!value || typeof value !== "string" || !value.includes(":")) {
      return ["12", "00"];
    }
    const [h, m] = value.split(":");
    const validH = String(Math.max(0, Math.min(23, parseInt(h, 10) || 0))).padStart(2, "0");
    const validM = String(Math.max(0, Math.min(59, parseInt(m, 10) || 0))).padStart(2, "0");
    return [validH, validM];
  }, [value]);

  const hoursListRef = React.useRef<HTMLDivElement>(null);
  const minutesListRef = React.useRef<HTMLDivElement>(null);

  // Scroll active elements into view when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        const hourEl = hoursListRef.current?.querySelector(`[data-hour="${selectedHour}"]`);
        hourEl?.scrollIntoView({ block: "center", behavior: "smooth" });

        const minEl = minutesListRef.current?.querySelector(`[data-min="${selectedMinute}"]`);
        minEl?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 50);
    }
  }, [open, selectedHour, selectedMinute]);

  const handleSetHour = (h: string) => {
    onChange(`${h}:${selectedMinute}`);
  };

  const handleSetMinute = (m: string) => {
    onChange(`${selectedHour}:${m}`);
  };

  const handleSetNow = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    onChange(`${h}:${m}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex items-center justify-between gap-2 h-8 px-2.5 rounded-lg border border-border bg-background dark:bg-black/40 text-xs font-mono text-foreground hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer select-none",
            className
          )}
        >
          <span className="tracking-wider font-semibold">
            {value ? `${selectedHour}:${selectedMinute}` : placeholder}
          </span>
          <NxtqrIcon
            icon="solar:clock-circle-bold"
            size={13}
            className="text-muted-foreground group-hover:text-primary shrink-0"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-64 p-3 bg-white dark:bg-[#181818] border border-border rounded-xl shadow-2xl text-xs font-mono text-foreground z-50 select-none"
      >
        {/* Header with Title and 'Now' button */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/80">
          <div className="flex items-center gap-1.5">
            <NxtqrIcon icon="solar:clock-circle-bold" size={13} className="text-primary" />
            <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
              Time (24h)
            </span>
          </div>

          <button
            type="button"
            onClick={handleSetNow}
            className="text-[10px] text-primary hover:underline font-medium cursor-pointer"
          >
            Current Time
          </button>
        </div>

        {/* Digital display summary */}
        <div className="flex items-center justify-center gap-1 py-1.5 mb-2.5 rounded-lg bg-muted/50 dark:bg-black/30 border border-border/70 text-base font-bold tracking-widest text-foreground">
          <span className="text-primary">{selectedHour}</span>
          <span className="text-muted-foreground animate-pulse">:</span>
          <span className="text-primary">{selectedMinute}</span>
        </div>

        {/* 2-Column Wheel Selector (Hours : Minutes) */}
        <div className="grid grid-cols-2 gap-2 border border-border/70 rounded-lg p-1 bg-muted/20 dark:bg-black/20">
          {/* Hours Column */}
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase text-center font-semibold pb-1 border-b border-border/50">
              Hours
            </div>
            <div
              ref={hoursListRef}
              className="h-36 overflow-y-auto no-scrollbar space-y-0.5 p-0.5"
            >
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  data-hour={h}
                  onClick={() => handleSetHour(h)}
                  className={cn(
                    "w-full py-1 rounded text-center text-xs font-mono transition-colors cursor-pointer",
                    selectedHour === h
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-white/[0.06]"
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes Column */}
          <div className="space-y-1 border-l border-border/50 pl-2">
            <div className="text-[10px] text-muted-foreground uppercase text-center font-semibold pb-1 border-b border-border/50">
              Minutes
            </div>
            <div
              ref={minutesListRef}
              className="h-36 overflow-y-auto no-scrollbar space-y-0.5 p-0.5"
            >
              {MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  data-min={m}
                  onClick={() => handleSetMinute(m)}
                  className={cn(
                    "w-full py-1 rounded text-center text-xs font-mono transition-colors cursor-pointer",
                    selectedMinute === m
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-white/[0.06]"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-2.5 pt-2 border-t border-border/70 flex items-center justify-between gap-1">
          {QUICK_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(p.label)}
              className={cn(
                "flex-1 py-1 rounded border text-[10px] font-mono transition-all text-center cursor-pointer",
                value === p.label
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-border/60 bg-card hover:bg-muted hover:border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
