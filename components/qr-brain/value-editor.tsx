"use client";

import * as React from "react";
import {
  RoutingCondition,
  ConditionType,
  ConditionOperator,
} from "@nxtqr/contracts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { Badge } from "@/components/ui/badge";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface ValueEditorProps {
  condition: RoutingCondition;
  onChange: (updated: RoutingCondition) => void;
}

const OPERATOR_LABELS: Record<string, string> = {
  eq: "is",
  neq: "is not",
  in: "is one of",
  not_in: "is none of",
  between: "is between",
  exists: "exists",
  not_exists: "does not exist",
};

const DEVICE_OPTIONS = [
  { value: "mobile", label: "Mobile (Phone)" },
  { value: "tablet", label: "Tablet" },
  { value: "desktop", label: "Desktop" },
  { value: "bot", label: "Bot / Crawler" },
];

const OS_OPTIONS = [
  { value: "ios", label: "Apple iOS" },
  { value: "android", label: "Google Android" },
  { value: "macos", label: "macOS" },
  { value: "windows", label: "Windows" },
  { value: "linux", label: "Linux" },
  { value: "other", label: "Other" },
];

const BROWSER_OPTIONS = [
  { value: "safari", label: "Safari" },
  { value: "chrome", label: "Google Chrome" },
  { value: "firefox", label: "Firefox" },
  { value: "edge", label: "Microsoft Edge" },
  { value: "samsung_internet", label: "Samsung Internet" },
  { value: "other", label: "Other" },
];

const WEEKDAY_OPTIONS = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const COMMON_COUNTRIES = [
  { code: "US", label: "United States (US)" },
  { code: "IN", label: "India (IN)" },
  { code: "GB", label: "United Kingdom (GB)" },
  { code: "DE", label: "Germany (DE)" },
  { code: "CA", label: "Canada (CA)" },
  { code: "AU", label: "Australia (AU)" },
  { code: "JP", label: "Japan (JP)" },
  { code: "SG", label: "Singapore (SG)" },
  { code: "FR", label: "France (FR)" },
  { code: "BR", label: "Brazil (BR)" },
  { code: "AE", label: "UAE (AE)" },
];

export function ValueEditor({ condition, onChange }: ValueEditorProps) {
  const type = ((condition as any).field || condition.type || "device") as ConditionType;
  const operator = (condition.operator || "eq") as ConditionOperator;
  const value = condition.value;
  const paramName = condition.paramName || (condition as any).key;

  // Allowed operators based on field type
  const allowedOperators: ConditionOperator[] = React.useMemo(() => {
    if (type === "time" || type === "time_window") {
      return ["between", "eq"];
    }
    if (type === "queryParam" || type === "query_param") {
      return ["eq", "neq", "exists", "not_exists"];
    }
    if (type === "weekday") {
      return ["in", "not_in", "eq", "neq"];
    }
    return ["eq", "neq", "in", "not_in"];
  }, [type]);

  const handleOperatorChange = (op: ConditionOperator) => {
    let defaultValue: string | number | string[] | [string, string] | [number, number] = value;
    if (op === "between" && (type === "time" || type === "time_window")) {
      defaultValue = ["09:00", "18:00"] as [string, string];
    } else if (op === "in" || op === "not_in") {
      defaultValue = Array.isArray(value) ? (value as string[]) : value ? [String(value)] : [];
    } else if (op === "exists" || op === "not_exists") {
      defaultValue = "true";
    }
    onChange({ ...condition, operator: op, value: defaultValue });
  };

  // Safe time window values [start, end]
  const [startTime, endTime] = React.useMemo(() => {
    if (Array.isArray(value) && value.length >= 2) {
      return [String(value[0] || "09:00"), String(value[1] || "18:00")];
    }
    if (typeof value === "object" && value !== null) {
      return [String((value as any).start || "09:00"), String((value as any).end || "18:00")];
    }
    return ["09:00", "18:00"];
  }, [value]);

  const isOvernight = (type === "time" || type === "time_window") && operator === "between" && startTime > endTime;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-mono select-none">
      {/* Query Param Key Input */}
      {(type === "queryParam" || type === "query_param") && (
        <Input
          placeholder="parameter_name"
          value={paramName || ""}
          onChange={(e) => onChange({ ...condition, paramName: e.target.value })}
          className="h-7 w-32 font-mono text-xs bg-white dark:bg-black/40 border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground shadow-2xs"
        />
      )}

      {/* Operator Select */}
      <Select
        value={operator}
        onValueChange={(op) => handleOperatorChange(op as ConditionOperator)}
      >
        <SelectTrigger className="h-7 w-auto min-w-[95px] text-xs font-mono bg-white dark:bg-black/40 border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground shadow-2xs">
          <SelectValue>{OPERATOR_LABELS[operator] || operator}</SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-[#181818] border border-zinc-200 dark:border-border text-xs font-mono text-zinc-900 dark:text-foreground shadow-2xl">
          {allowedOperators.map((op) => (
            <SelectItem key={op} value={op} className="text-xs font-mono">
              {OPERATOR_LABELS[op] || op}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value Input (Not needed for exists/not_exists) */}
      {operator !== "exists" && operator !== "not_exists" && (
        <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
          {/* 1. DEVICE CATEGORY */}
          {type === "device" && (
            <Select
              value={String(value || "mobile")}
              onValueChange={(val) => onChange({ ...condition, value: val })}
            >
              <SelectTrigger className="h-7 flex-1 text-xs font-mono bg-white dark:bg-black/40 border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground shadow-2xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#181818] border border-zinc-200 dark:border-border text-xs font-mono text-zinc-900 dark:text-foreground shadow-2xl">
                {DEVICE_OPTIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value} className="text-xs font-mono">
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* 2. OPERATING SYSTEM */}
          {type === "os" && (
            <Select
              value={String(value || "ios")}
              onValueChange={(val) => onChange({ ...condition, value: val })}
            >
              <SelectTrigger className="h-7 flex-1 text-xs font-mono bg-white dark:bg-black/40 border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground shadow-2xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#181818] border border-zinc-200 dark:border-border text-xs font-mono text-zinc-900 dark:text-foreground shadow-2xl">
                {OS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs font-mono">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* 3. BROWSER */}
          {type === "browser" && (
            <Select
              value={String(value || "safari")}
              onValueChange={(val) => onChange({ ...condition, value: val })}
            >
              <SelectTrigger className="h-7 flex-1 text-xs font-mono bg-white dark:bg-black/40 border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground shadow-2xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#181818] border border-zinc-200 dark:border-border text-xs font-mono text-zinc-900 dark:text-foreground shadow-2xl">
                {BROWSER_OPTIONS.map((b) => (
                  <SelectItem key={b.value} value={b.value} className="text-xs font-mono">
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* 4. COUNTRY */}
          {type === "country" && (
            <div className="flex items-center gap-1.5 flex-1">
              <Select
                value={String(value || "US")}
                onValueChange={(val) => onChange({ ...condition, value: val })}
              >
                <SelectTrigger className="h-7 flex-1 text-xs font-mono bg-white dark:bg-black/40 border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground shadow-2xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#181818] border border-zinc-200 dark:border-border text-xs font-mono text-zinc-900 dark:text-foreground shadow-2xl max-h-56">
                  {COMMON_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="text-xs font-mono">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="ISO"
                value={String(value || "")}
                onChange={(e) => onChange({ ...condition, value: e.target.value.toUpperCase() })}
                maxLength={2}
                className="h-7 w-14 uppercase font-mono text-xs text-center bg-white dark:bg-black/40 border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground shadow-2xs font-bold"
              />
            </div>
          )}

          {/* 5. WEEKDAYS */}
          {type === "weekday" && (
            <div className="flex items-center gap-1 flex-wrap">
              {WEEKDAY_OPTIONS.map((day) => {
                const currentList = Array.isArray(value) ? (value as string[]) : [String(value || "")];
                const isSelected = currentList.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => {
                      if (operator === "in" || operator === "not_in") {
                        const next = isSelected
                          ? currentList.filter((d) => d !== day.value)
                          : [...currentList, day.value];
                        onChange({ ...condition, value: next });
                      } else {
                        onChange({ ...condition, value: day.value });
                      }
                    }}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer",
                      isSelected
                        ? "bg-[#FA520F] text-white border-[#FA520F] shadow-2xs font-bold"
                        : "bg-white dark:bg-black/30 text-zinc-600 dark:text-muted-foreground border-zinc-200 dark:border-border hover:bg-zinc-50 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-foreground shadow-2xs"
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* 6. TIME WINDOW */}
          {(type === "time" || type === "time_window") && (
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <TimePicker
                  value={startTime}
                  onChange={(val) =>
                    onChange({
                      ...condition,
                      value: [val, endTime] as [string, string],
                    })
                  }
                  className="h-7 w-24 text-xs font-mono bg-white dark:bg-black/40 border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground shadow-2xs"
                />
                <span className="text-zinc-500 dark:text-muted-foreground text-xs">to</span>
                <TimePicker
                  value={endTime}
                  onChange={(val) =>
                    onChange({
                      ...condition,
                      value: [startTime, val] as [string, string],
                    })
                  }
                  className="h-7 w-24 text-xs font-mono bg-white dark:bg-black/40 border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground shadow-2xs"
                />
              </div>

              {isOvernight && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10 gap-1"
                >
                  <NxtqrIcon icon="solar:moon-bold" size={11} />
                  <span>Overnight wrap</span>
                </Badge>
              )}
            </div>
          )}

          {/* 7. GENERIC / QUERY / REGION / LANGUAGE */}
          {type !== "device" &&
            type !== "os" &&
            type !== "browser" &&
            type !== "country" &&
            type !== "weekday" &&
            type !== "time" &&
            type !== "time_window" && (
              <Input
                placeholder={type === "language" ? "e.g. en, fr, de, es" : "e.g. CA, NY, or value"}
                value={typeof value === "string" ? value : Array.isArray(value) ? value.join(",") : ""}
                onChange={(e) => onChange({ ...condition, value: e.target.value })}
                className="h-7 flex-1 font-mono text-xs bg-white dark:bg-black/40 border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground shadow-2xs"
              />
            )}
        </div>
      )}
    </div>
  );
}
