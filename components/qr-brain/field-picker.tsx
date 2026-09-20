"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ConditionType } from "@nxtqr/contracts";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

export interface FieldDefinition {
  type: ConditionType;
  label: string;
  category: "Client & Hardware" | "Geolocation & Locale" | "Temporal & Schedule" | "Attribution";
  icon: string;
  description: string;
  defaultOperator: "eq" | "in" | "between" | "exists";
  defaultValue: any;
}

export const ROUTING_FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    type: "device",
    label: "Device Category",
    category: "Client & Hardware",
    icon: "solar:smartphone-bold",
    description: "Match smartphone, tablet, desktop, or bot scanners",
    defaultOperator: "eq",
    defaultValue: "mobile",
  },
  {
    type: "os",
    label: "Operating System",
    category: "Client & Hardware",
    icon: "solar:laptop-bold",
    description: "Route iOS, Android, macOS, Windows, or Linux devices",
    defaultOperator: "eq",
    defaultValue: "ios",
  },
  {
    type: "browser",
    label: "Browser Family",
    category: "Client & Hardware",
    icon: "solar:globus-bold",
    description: "Detect Safari, Chrome, Firefox, Edge, or Samsung browser",
    defaultOperator: "eq",
    defaultValue: "safari",
  },
  {
    type: "country",
    label: "Country (ISO-2)",
    category: "Geolocation & Locale",
    icon: "solar:map-point-bold",
    description: "Target specific 2-letter sovereign country codes",
    defaultOperator: "eq",
    defaultValue: "US",
  },
  {
    type: "region",
    label: "Region / State",
    category: "Geolocation & Locale",
    icon: "solar:map-bold",
    description: "Match state, province, or subdivision code",
    defaultOperator: "eq",
    defaultValue: "CA",
  },
  {
    type: "language",
    label: "Preferred Language",
    category: "Geolocation & Locale",
    icon: "solar:letter-bold",
    description: "Match browser Accept-Language ISO header",
    defaultOperator: "eq",
    defaultValue: "en",
  },
  {
    type: "weekday",
    label: "Day of Week",
    category: "Temporal & Schedule",
    icon: "solar:calendar-bold",
    description: "Trigger on specific recurring days (Mon - Sun)",
    defaultOperator: "in",
    defaultValue: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  },
  {
    type: "time",
    label: "Time Window (24h)",
    category: "Temporal & Schedule",
    icon: "solar:clock-circle-bold",
    description: "Active time range with automatic overnight wrap",
    defaultOperator: "between",
    defaultValue: { start: "09:00", end: "18:00" },
  },
  {
    type: "queryParam",
    label: "Query Parameter",
    category: "Attribution",
    icon: "solar:link-bold",
    description: "Inspect inbound URL UTM or custom query strings",
    defaultOperator: "eq",
    defaultValue: "promo",
  },
];

interface FieldPickerProps {
  onSelect: (field: FieldDefinition) => void;
  trigger?: React.ReactNode;
}

export function FieldPicker({ onSelect, trigger }: FieldPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredFields = React.useMemo(() => {
    if (!search.trim()) return ROUTING_FIELD_DEFINITIONS;
    const q = search.toLowerCase();
    return ROUTING_FIELD_DEFINITIONS.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [search]);

  const categories = React.useMemo(() => {
    const map = new Map<string, FieldDefinition[]>();
    for (const def of filteredFields) {
      const list = map.get(def.category) || [];
      list.push(def);
      map.set(def.category, list);
    }
    return Array.from(map.entries());
  }, [filteredFields]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 border-dashed border-orange-500/30 hover:border-orange-500/60 bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono font-medium cursor-pointer shadow-2xs"
          >
            <NxtqrIcon icon="solar:add-circle-linear" size={13} className="text-[#FA520F]" />
            <span>Add Condition</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 p-2 shadow-2xl border border-zinc-200 dark:border-border bg-white dark:bg-[#161616] text-zinc-900 dark:text-foreground text-xs font-mono select-none"
      >
        <div className="space-y-2">
          {/* Header & Search */}
          <div className="px-1 pt-1 pb-1 border-b border-zinc-200 dark:border-border/60">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-muted-foreground flex items-center gap-1.5 mb-2">
              <NxtqrIcon icon="solar:filter-bold" size={12} className="text-[#FA520F]" />
              <span>Select Routing Condition</span>
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search condition type..."
              className="h-7 text-xs font-mono bg-zinc-50 dark:bg-[#1c1c1c] border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground placeholder:text-zinc-400 dark:placeholder:text-muted-foreground/60 shadow-2xs"
              autoFocus
            />
          </div>

          {/* Grouped Options */}
          <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1">
            {categories.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 dark:text-muted-foreground text-[11px]">
                No condition types match "{search}".
              </div>
            ) : (
              categories.map(([category, fields]) => (
                <div key={category} className="space-y-1">
                  <div className="text-[10px] font-semibold text-zinc-500 dark:text-muted-foreground/70 uppercase tracking-wider px-1">
                    {category}
                  </div>
                  <div className="space-y-0.5">
                    {fields.map((f) => (
                      <button
                        key={f.type}
                        type="button"
                        onClick={() => {
                          onSelect(f);
                          setOpen(false);
                          setSearch("");
                        }}
                        className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors group cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-border/60"
                      >
                        <div className="mt-0.5 p-1.5 rounded-md bg-zinc-100 dark:bg-[#222] text-zinc-600 dark:text-muted-foreground group-hover:bg-orange-500/10 group-hover:text-orange-600 dark:group-hover:bg-primary/20 dark:group-hover:text-primary transition-colors shrink-0">
                          <NxtqrIcon icon={f.icon} size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-zinc-900 dark:text-foreground leading-tight group-hover:text-orange-600 dark:group-hover:text-primary transition-colors">
                            {f.label}
                          </div>
                          <div className="text-[10px] text-zinc-500 dark:text-muted-foreground line-clamp-1 mt-0.5">
                            {f.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
