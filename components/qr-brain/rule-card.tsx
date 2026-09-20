"use client";

import * as React from "react";
import {
  RoutingRule,
  RoutingCondition,
} from "@nxtqr/contracts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  AlertTriangle,
  AlertOctagon,
  Info,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { FieldPicker, ROUTING_FIELD_DEFINITIONS, FieldDefinition } from "./field-picker";
import { ValueEditor } from "./value-editor";
import { QrBrainDestinationOption } from "@/lib/domains/routing";
import { cn } from "@/lib/utils";
import { generateOpaqueId } from "@nxtqr/db";

interface RuleCardProps {
  rule: RoutingRule;
  index: number;
  totalRules: number;
  destinations: QrBrainDestinationOption[];
  isSimulatedMatch?: boolean;
  isSimulatedEvaluated?: boolean;
  conflict?: {
    type: "contradiction" | "shadowed" | "overlap";
    message: string;
    details?: string;
  };
  telemetry?: {
    matches: number;
    sharePercentage: number;
  };
  onChange: (updated: RoutingRule) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function RuleCard({
  rule,
  index,
  totalRules,
  destinations,
  isSimulatedMatch = false,
  isSimulatedEvaluated = false,
  conflict,
  telemetry,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: RuleCardProps) {
  const priorityStr = String(index + 1).padStart(2, "0");

  const handleAddCondition = (field: FieldDefinition) => {
    const newCond: RoutingCondition = {
      id: generateOpaqueId("cond"),
      type: field.type,
      operator: field.defaultOperator,
      value: field.defaultValue,
      paramName: field.type === "queryParam" ? "promo" : undefined,
    };
    onChange({
      ...rule,
      conditions: [...(rule.conditions || []), newCond],
    });
  };

  const handleUpdateCondition = (condIdx: number, updated: RoutingCondition) => {
    const nextConds = [...(rule.conditions || [])];
    nextConds[condIdx] = updated;
    onChange({ ...rule, conditions: nextConds });
  };

  const handleDeleteCondition = (condIdx: number) => {
    const nextConds = (rule.conditions || []).filter((_, i) => i !== condIdx);
    onChange({ ...rule, conditions: nextConds });
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 relative border-border/80 bg-card shadow-xs",
        !rule.isActive && "opacity-60 bg-muted/30",
        isSimulatedMatch &&
          "ring-2 ring-[#FA520F] border-[#FA520F] shadow-[0_0_20px_rgba(250,82,15,0.15)] bg-[#FA520F]/[0.02]",
        conflict?.type === "contradiction" && "border-rose-500/60 bg-rose-500/[0.02]",
        conflict?.type === "shadowed" && "border-amber-500/60 bg-amber-500/[0.02]"
      )}
    >
      {/* Simulation Result Indicator Banner */}
      {isSimulatedMatch && (
        <div className="bg-[#FA520F] text-white text-[11px] font-mono font-semibold py-1 px-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>DECISION TRACE: MATCHED RULE {priorityStr}</span>
          </div>
          <span className="text-[10px] uppercase opacity-90">Target Route Applied</span>
        </div>
      )}

      {/* Header */}
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Priority Token & Name */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center font-mono text-xs font-bold w-7 h-7 rounded-lg bg-muted border border-border text-foreground">
                {priorityStr}
              </span>
              <div className="flex flex-col">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={onMoveUp}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-25 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Move Up Priority"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === totalRules - 1}
                  onClick={onMoveDown}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-25 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Move Down Priority"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <Input
              value={rule.name}
              onChange={(e) => onChange({ ...rule, name: e.target.value })}
              placeholder="Rule Name (e.g. Mobile iOS Users)"
              className="h-8 font-semibold text-xs border-transparent hover:border-border focus:border-primary bg-transparent px-2"
            />
          </div>

          {/* Right Controls: Telemetry, Active Switch, Delete */}
          <div className="flex items-center gap-3">
            {telemetry && (
              <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                {Number(telemetry.sharePercentage ?? 0).toFixed(1)}% traffic ({Number(telemetry.matches ?? 0).toLocaleString()} scans)
              </Badge>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground font-mono">
                {rule.isActive ? "Active" : "Paused"}
              </span>
              <Switch
                checked={rule.isActive}
                onCheckedChange={(v) => onChange({ ...rule, isActive: v })}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Delete Rule"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Inline Conflict Lens Notice */}
        {conflict && (
          <div
            className={cn(
              "mt-3 p-2.5 rounded-lg border text-xs flex items-start gap-2",
              conflict.type === "contradiction"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                : conflict.type === "shadowed"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
            )}
          >
            {conflict.type === "contradiction" && <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />}
            {conflict.type === "shadowed" && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
            {conflict.type === "overlap" && <Info className="w-4 h-4 shrink-0 mt-0.5" />}
            <div className="leading-snug">
              <div className="font-semibold">{conflict.message}</div>
              {conflict.details && (
                <div className="text-[11px] opacity-90 mt-0.5">{conflict.details}</div>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* MATCH TYPE BAR (ALL vs ANY) */}
        <div className="flex items-center justify-between gap-2 bg-muted/40 p-2 rounded-xl border border-border/60">
          <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
            <span>IF</span>
            <div className="flex items-center p-0.5 bg-background border border-border rounded-md">
              <button
                type="button"
                onClick={() => onChange({ ...rule, matchType: "ALL" })}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono transition-colors font-medium cursor-pointer",
                  rule.matchType === "ALL"
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                ALL (AND)
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...rule, matchType: "ANY" })}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono transition-colors font-medium cursor-pointer",
                  rule.matchType === "ANY"
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                ANY (OR)
              </button>
            </div>
            <span>conditions are satisfied:</span>
          </div>

          <FieldPicker onSelect={handleAddCondition} />
        </div>

        {/* CONDITIONS LIST */}
        <div className="space-y-2">
          {(!rule.conditions || rule.conditions.length === 0) ? (
            <div className="p-4 border border-dashed rounded-xl text-center text-xs text-muted-foreground">
              No conditions added yet. This rule will match all inbound scans.
            </div>
          ) : (
            rule.conditions.map((cond, cIdx) => {
              const def = ROUTING_FIELD_DEFINITIONS.find((f) => f.type === cond.type);
              const Icon = def?.icon || Sparkles;

              return (
                <div
                  key={cond.id || `c_${cIdx}`}
                  className="p-2.5 rounded-xl border border-border/70 bg-background flex flex-wrap items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                    <Badge variant="outline" className="text-[11px] gap-1 px-2 py-1 font-normal shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      <span>{def?.label || cond.type}</span>
                    </Badge>

                    <ValueEditor
                      condition={cond}
                      onChange={(updated) => handleUpdateCondition(cIdx, updated)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCondition(cIdx)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                    title="Remove condition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* THEN: DESTINATION ACTION */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-foreground uppercase tracking-wider">
              <ArrowRight className="w-3.5 h-3.5 text-[#FA520F]" />
              <span>THEN REDIRECT TO:</span>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                placeholder="https://example.com/target"
                value={rule.action.destinationUrl}
                onChange={(e) =>
                  onChange({
                    ...rule,
                    action: { ...rule.action, destinationUrl: e.target.value },
                  })
                }
                className="h-8 text-xs font-mono flex-1 bg-background"
              />

              {rule.action.destinationUrl && (
                <a
                  href={rule.action.destinationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                  title="Test destination URL"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
