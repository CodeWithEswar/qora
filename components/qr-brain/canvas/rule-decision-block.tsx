"use client";

import * as React from "react";
import {
  RoutingRule,
  RoutingCondition,
} from "@nxtqr/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { FieldPicker, FieldDefinition } from "../field-picker";
import { ValueEditor } from "../value-editor";
import { QrBrainDestinationOption } from "@/lib/domains/routing";
import { cn } from "@/lib/utils";
import { generateOpaqueId } from "@nxtqr/db";

interface RuleDecisionBlockProps {
  rule: RoutingRule;
  index: number;
  totalRules: number;
  isSelected?: boolean;
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
  onSelect: () => void;
  onChange: (updated: RoutingRule) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function RuleDecisionBlock({
  rule,
  index,
  totalRules,
  isSelected = false,
  destinations,
  isSimulatedMatch = false,
  isSimulatedEvaluated = false,
  conflict,
  telemetry,
  onSelect,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: RuleDecisionBlockProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState(rule.name);

  // Sync draft if rule name changes externally
  React.useEffect(() => {
    setNameDraft(rule.name);
  }, [rule.name]);

  const priorityStr = String(index + 1).padStart(2, "0");

  const handleNameSave = () => {
    setIsEditingName(false);
    if (nameDraft.trim() && nameDraft !== rule.name) {
      onChange({ ...rule, name: nameDraft.trim() });
    } else {
      setNameDraft(rule.name);
    }
  };

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

  // Destination host preview
  const destinationHost = React.useMemo(() => {
    const url = rule.action?.destinationUrl || "";
    try {
      const u = new URL(url);
      return u.hostname + (u.pathname !== "/" ? u.pathname : "");
    } catch {
      return url;
    }
  }, [rule.action?.destinationUrl]);

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative rounded-xl border transition-all text-xs font-mono select-none overflow-hidden shadow-xs",
        isSelected
          ? "border-primary/80 bg-white dark:bg-[#191919] shadow-md shadow-primary/10 ring-1 ring-primary/40"
          : "border-zinc-200/90 dark:border-border bg-white dark:bg-[#161616] hover:border-zinc-300 dark:hover:border-border-strong hover:bg-zinc-50/50 dark:hover:bg-[#181818]",
        !rule.isActive && "opacity-60 bg-zinc-50 dark:bg-muted/20",
        isSimulatedMatch &&
          "ring-2 ring-[#FA520F] border-[#FA520F] shadow-[0_0_24px_rgba(250,82,15,0.2)] bg-[#FFF8F3] dark:bg-[#1e1714]",
        conflict && "border-amber-500/60"
      )}
    >
      {/* Simulation Result Header Ribbon if matched */}
      {isSimulatedMatch && (
        <div className="bg-[#FA520F] text-white text-[11px] font-mono font-semibold px-3 py-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <NxtqrIcon icon="solar:bolt-bold" size={13} />
            <span>SIMULATION MATCH: RULE {priorityStr} APPLIED</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider opacity-90">Evaluated & Passed</span>
        </div>
      )}

      {/* Conflict Warning Banner if detected */}
      {conflict && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-3 py-1.5 flex items-center justify-between text-amber-600 dark:text-amber-300 text-[11px]">
          <div className="flex items-center gap-1.5">
            <NxtqrIcon icon="solar:danger-triangle-bold" size={13} className="text-amber-500 shrink-0" />
            <span className="font-medium">{conflict.message}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300">
            {conflict.type}
          </span>
        </div>
      )}

      {/* BLOCK HEADER */}
      <div className="p-3 border-b border-zinc-200 dark:border-border flex items-center justify-between gap-2 flex-wrap bg-[#FAF9F6] dark:bg-[#151515]">
        {/* Left: Priority + Name */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-xs text-orange-600 dark:text-primary font-mono bg-orange-500/10 border border-orange-500/25 px-2 py-0.5 rounded">
            {priorityStr}
          </span>

          {isEditingName ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSave();
                  if (e.key === "Escape") {
                    setNameDraft(rule.name);
                    setIsEditingName(false);
                  }
                }}
                className="h-6 text-xs font-mono w-48 bg-white dark:bg-[#202020] border-zinc-300 dark:border-border text-zinc-900 dark:text-foreground"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleNameSave}
                className="h-6 w-6 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                <NxtqrIcon icon="solar:check-circle-bold" size={13} />
              </Button>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 group/name cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingName(true);
              }}
              title="Click to rename rule"
            >
              <h3 className="font-bold text-sm text-zinc-900 dark:text-foreground truncate">{rule.name}</h3>
              <NxtqrIcon
                icon="solar:pen-2-linear"
                size={12}
                className="text-zinc-400 dark:text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity"
              />
            </div>
          )}
        </div>

        {/* Right: Active switch, reorder buttons, and more actions */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Active Switch */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-muted-foreground font-medium">
            <span>{rule.isActive ? "Active" : "Disabled"}</span>
            <Switch
              checked={rule.isActive}
              onCheckedChange={(checked) => onChange({ ...rule, isActive: checked })}
              className="scale-75 data-[state=checked]:bg-primary cursor-pointer"
              aria-label="Toggle rule active state"
            />
          </div>

          <div className="h-3.5 w-px bg-zinc-200 dark:bg-border/60" />

          {/* Reorder Buttons */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled={index === 0}
              onClick={onMoveUp}
              className="p-1 rounded text-zinc-500 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-white/10 disabled:opacity-20 cursor-pointer transition-colors"
              title="Move up"
              aria-label="Move rule up"
            >
              <NxtqrIcon icon="solar:arrow-up-linear" size={13} />
            </button>
            <button
              type="button"
              disabled={index >= totalRules - 1}
              onClick={onMoveDown}
              className="p-1 rounded text-zinc-500 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-white/10 disabled:opacity-20 cursor-pointer transition-colors"
              title="Move down"
              aria-label="Move rule down"
            >
              <NxtqrIcon icon="solar:arrow-down-linear" size={13} />
            </button>
          </div>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-1 rounded text-zinc-500 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-white/10 cursor-pointer transition-colors"
                aria-label="More rule actions"
              >
                <NxtqrIcon icon="solar:menu-dots-bold" size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs font-mono bg-white dark:bg-[#181818] border border-zinc-200 dark:border-border text-zinc-900 dark:text-popover-foreground shadow-xl">
              <DropdownMenuItem onClick={() => setIsEditingName(true)} className="cursor-pointer">
                <NxtqrIcon icon="solar:pen-2-linear" size={13} className="mr-2 text-zinc-500" />
                Rename Rule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate} className="cursor-pointer">
                <NxtqrIcon icon="solar:copy-bold" size={13} className="mr-2 text-zinc-500" />
                Duplicate Rule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChange({ ...rule, isActive: !rule.isActive })} className="cursor-pointer">
                <NxtqrIcon
                  icon={rule.isActive ? "solar:pause-circle-bold" : "solar:play-circle-bold"}
                  size={13}
                  className="mr-2 text-zinc-500"
                />
                {rule.isActive ? "Disable Rule" : "Enable Rule"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-border/60" />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-rose-600 dark:text-rose-400 focus:text-rose-700 dark:focus:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-500/10 cursor-pointer"
              >
                <NxtqrIcon icon="solar:trash-bin-trash-bold" size={13} className="mr-2" />
                Delete Rule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* NATURAL SENTENCE DECISION BODY */}
      <div className="p-3.5 space-y-3.5 bg-white dark:bg-transparent">
        {/* 1. IF CLAUSE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-[#FA520F] font-bold tracking-wider">IF</span>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center border border-zinc-200 dark:border-border/80 rounded-md p-0.5 bg-zinc-100 dark:bg-black/40 text-[10px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange({ ...rule, matchType: "ALL" });
                        }}
                        className={cn(
                          "px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer",
                          rule.matchType === "ALL"
                            ? "bg-[#FA520F] text-white shadow-xs"
                            : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground"
                        )}
                      >
                        ALL (AND)
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange({ ...rule, matchType: "ANY" });
                        }}
                        className={cn(
                          "px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer",
                          rule.matchType === "ANY"
                            ? "bg-[#FA520F] text-white shadow-xs"
                            : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground"
                        )}
                      >
                        ANY (OR)
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-[11px] font-mono max-w-xs">
                    {rule.matchType === "ALL"
                      ? "ALL: Every condition must evaluate to true for this rule to match."
                      : "ANY: At least one condition must evaluate to true for this rule to match."}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <span className="text-zinc-600 dark:text-muted-foreground font-normal text-[11px]">
                conditions are satisfied:
              </span>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <FieldPicker onSelect={handleAddCondition} />
            </div>
          </div>

          {/* Condition Rows */}
          {(!rule.conditions || rule.conditions.length === 0) ? (
            <div className="p-3 rounded-lg border border-dashed border-zinc-200 dark:border-border/70 bg-zinc-50/50 dark:bg-transparent text-center text-zinc-500 dark:text-muted-foreground text-[11px]">
              No conditions set. This rule will always match if active.
            </div>
          ) : (
            <div className="space-y-1.5">
              {rule.conditions.map((cond, condIdx) => (
                <div
                  key={cond.id || condIdx}
                  className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-[#FAF9F6] dark:bg-black/30 border border-zinc-200 dark:border-border/70 hover:border-zinc-300 dark:hover:border-border transition-colors group/cond shadow-2xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex-1 min-w-0">
                    <ValueEditor
                      condition={cond}
                      onChange={(updated) => handleUpdateCondition(condIdx, updated)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCondition(condIdx)}
                    className="p-1 rounded text-zinc-400 dark:text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-70 group-hover/cond:opacity-100 cursor-pointer"
                    title="Remove condition"
                    aria-label="Remove condition"
                  >
                    <NxtqrIcon icon="solar:trash-bin-trash-linear" size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. THEN CLAUSE (Visually Distinct with Orange Routing Connector) */}
        <div className="pt-2 border-t border-zinc-200 dark:border-border/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <NxtqrIcon icon="solar:arrow-right-bold" size={14} className="text-[#FA520F]" />
            <span className="text-[#FA520F] font-bold tracking-wider">THEN ROUTE TO</span>
          </div>

          {/* Destination Selector / Input */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 min-w-[200px] relative">
              <Input
                value={rule.action?.destinationUrl || ""}
                onChange={(e) => {
                  const newUrl = e.target.value;
                  const matched = destinations.find((d) => d.url === newUrl);
                  onChange({
                    ...rule,
                    action: {
                      ...rule.action,
                      type: "redirect",
                      destinationId: matched ? matched.id : undefined,
                      destinationUrl: newUrl,
                    },
                  });
                }}
                placeholder="https://example.com/target-landing"
                className="h-8 pr-7 text-xs font-mono bg-white dark:bg-black/40 border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground placeholder:text-zinc-400 dark:placeholder:text-muted-foreground/60 focus-visible:ring-primary/40 shadow-2xs"
              />
              {rule.action?.destinationUrl && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...rule,
                      action: {
                        ...rule.action,
                        type: "redirect",
                        destinationId: undefined,
                        destinationUrl: "",
                      },
                    })
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:text-muted-foreground dark:hover:text-foreground p-0.5 rounded cursor-pointer transition-colors"
                  title="Clear destination link"
                  aria-label="Clear destination link"
                >
                  <NxtqrIcon icon="solar:close-circle-bold" size={13} />
                </button>
              )}
            </div>

            {/* Quick destination preset picker if destinations are available */}
            {destinations.length > 0 && (
              <Select
                value={rule.action?.destinationId || "__none__"}
                onValueChange={(val) => {
                  if (val === "__none__") {
                    onChange({
                      ...rule,
                      action: {
                        ...rule.action,
                        type: "redirect",
                        destinationId: undefined,
                      },
                    });
                    return;
                  }
                  const matched = destinations.find((d) => d.id === val);
                  if (matched) {
                    onChange({
                      ...rule,
                      action: {
                        ...rule.action,
                        type: "redirect",
                        destinationId: matched.id,
                        destinationUrl: matched.url,
                      },
                    });
                  }
                }}
              >
                <SelectTrigger className="h-8 w-auto sm:w-48 text-[11px] font-mono bg-white dark:bg-black/30 border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground shadow-2xs font-semibold">
                  <SelectValue placeholder="Preset Destination" />
                </SelectTrigger>
                <SelectContent className="text-xs font-mono bg-white dark:bg-[#181818] border border-zinc-200 dark:border-border text-zinc-900 dark:text-foreground shadow-2xl">
                  <SelectItem value="__none__" className="text-xs font-mono text-zinc-500 italic">
                    Custom URL (No Preset)
                  </SelectItem>
                  {destinations.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="text-xs font-mono">
                      {d.label || d.url}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Reset destination button if URL is present */}
            {rule.action?.destinationUrl && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...rule,
                    action: {
                      ...rule.action,
                      type: "redirect",
                      destinationId: undefined,
                      destinationUrl: "",
                    },
                  })
                }
                className="h-8 px-2.5 rounded-md border border-zinc-200 dark:border-border bg-white dark:bg-black/20 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors shrink-0 shadow-2xs text-[11px] font-mono cursor-pointer"
                title="Reset destination link"
                aria-label="Reset destination link"
              >
                <NxtqrIcon icon="solar:restart-linear" size={12} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* External URL Preview / Test Link */}
            {rule.action?.destinationUrl && (
              <a
                href={rule.action.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-2.5 rounded-md border border-zinc-200 dark:border-border bg-white dark:bg-black/20 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground flex items-center justify-center transition-colors shrink-0 shadow-2xs cursor-pointer"
                title="Open destination URL in new tab"
                aria-label="Open destination in new tab"
              >
                <NxtqrIcon icon="solar:link-square-linear" size={14} />
              </a>
            )}
          </div>
        </div>

        {/* 3. OTHERWISE CLAUSE */}
        <div className="pt-2 border-t border-zinc-200 dark:border-border/40 flex items-center justify-between text-[11px] text-zinc-500 dark:text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-zinc-700 dark:text-muted-foreground/90 uppercase tracking-wider text-[10px]">OTHERWISE</span>
            <span className="text-zinc-600 dark:text-muted-foreground font-mono">
              {index < totalRules - 1
                ? `Continue to Rule ${String(index + 2).padStart(2, "0")}`
                : "Fall through to Default Route"}
            </span>
          </div>
          <NxtqrIcon icon="solar:arrow-down-linear" size={12} className="text-zinc-400 dark:text-muted-foreground/60" />
        </div>
      </div>

      {/* Delete Rule AlertDialog confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#181818] border-zinc-200 dark:border-border text-xs font-mono text-zinc-900 dark:text-foreground shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base text-zinc-900 dark:text-foreground font-serif">
              Delete "{rule.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-600 dark:text-muted-foreground text-xs leading-relaxed">
              This removes the rule from the current draft. Published routing remains unchanged until a
              new revision is published. Destination links are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs font-mono border-zinc-200 dark:border-border bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="h-8 text-xs font-mono bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
