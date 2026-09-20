"use client";

import * as React from "react";
import {
  RoutingRule,
  QrResolverSnapshotV1,
  ResolverContext,
  RoutingSimulationResult,
} from "@nxtqr/contracts";
import { evaluateRoutingPolicy } from "@nxtqr/routing-engine";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NxtqrIcon } from "@/components/icons/nxtqr-icon";
import { cn } from "@/lib/utils";

interface ScanSimulatorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: RoutingRule[];
  defaultDestinationUrl: string;
  qrId: string;
  orgId: string;
  slug: string;
  onSimulationTrace: (result: RoutingSimulationResult | null) => void;
}

export function ScanSimulatorSheet({
  open,
  onOpenChange,
  rules,
  defaultDestinationUrl,
  qrId,
  orgId,
  slug,
  onSimulationTrace,
}: ScanSimulatorSheetProps) {
  // Context inputs
  const [device, setDevice] = React.useState<"mobile" | "desktop" | "tablet" | "bot">("mobile");
  const [os, setOs] = React.useState<"ios" | "android" | "macos" | "windows" | "linux" | "other">("ios");
  const [country, setCountry] = React.useState<string>("US");
  const [region, setRegion] = React.useState<string>("CA");
  const [language, setLanguage] = React.useState<string>("en-US");
  const [simTime, setSimTime] = React.useState<string>("14:30");
  const [weekday, setWeekday] = React.useState<
    "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
  >("monday");
  const [queryKey, setQueryKey] = React.useState<string>("utm_source");
  const [queryValue, setQueryValue] = React.useState<string>("instagram");

  // Trace result
  const [traceResult, setTraceResult] = React.useState<RoutingSimulationResult | null>(null);

  const handleRunSimulation = () => {
    // 1. Build synthetic snapshot from current canvas rules
    const snapshot: QrResolverSnapshotV1 = {
      schemaVersion: 1,
      qrId,
      organizationId: orgId,
      status: "ACTIVE",
      publishedRevision: 1,
      publishedAt: new Date().toISOString(),
      defaultDestination: {
        id: "dest_default",
        url: defaultDestinationUrl,
      },
      routing: {
        rules: rules
          .filter((r) => r.isActive)
          .map((r) => ({
            id: r.id,
            qrId: r.qrId || qrId,
            name: r.name,
            priority: r.priority,
            isActive: r.isActive,
            matchType: r.matchType,
            conditions: r.conditions || [],
            action: {
              type: r.action?.type || "redirect",
              destinationUrl: r.action?.destinationUrl || defaultDestinationUrl,
              destinationId: r.action?.destinationId,
            },
          })),
      },
    };

    // 2. Build simulation context
    const queryParams: Record<string, string> = {};
    if (queryKey.trim() && queryValue.trim()) {
      queryParams[queryKey.trim()] = queryValue.trim();
    }

    const context: ResolverContext = {
      device,
      os,
      country: country.trim().toUpperCase(),
      region: region.trim(),
      language: language.trim(),
      localTime: simTime,
      weekday,
      queryParams,
      timestamp: Date.now(),
    };

    // 3. Evaluate using pure @nxtqr/routing-engine
    const startTime = performance.now();
    const result = evaluateRoutingPolicy(snapshot, context, { includeTrace: true });
    const elapsed = Number((performance.now() - startTime).toFixed(2));

    const finalResult: RoutingSimulationResult = {
      ...result,
      evaluationDurationMs: result.trace?.evaluationDurationMs || elapsed || 0.1,
    };

    setTraceResult(finalResult);
    onSimulationTrace(finalResult);
  };

  const handleResetTrace = () => {
    setTraceResult(null);
    onSimulationTrace(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col bg-card dark:bg-[#141414] border-border text-xs font-mono text-foreground select-none">
        <SheetHeader className="p-6 border-b border-border/70 bg-muted/40 dark:bg-[#171717]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#FA520F]/10 text-[#FA520F] border border-[#FA520F]/30 shrink-0">
              <NxtqrIcon icon="solar:play-bold" size={20} className="text-primary" />
            </span>
            <div>
              <SheetTitle className="text-base font-bold text-foreground font-serif">
                Scan Simulator & Decision Trace
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Run synthetic inbound scans through the deterministic edge decision pipeline.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SYNTHETIC SCAN CONTEXT INPUTS */}
          <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30 dark:bg-[#171717]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-muted-foreground">
                Synthetic Scanner Context
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetTrace}
                className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/5 cursor-pointer"
              >
                <NxtqrIcon icon="solar:restart-linear" size={12} />
                <span>Reset</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Device */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground">Device Category</label>
                <Select value={device} onValueChange={(v) => setDevice(v as any)}>
                  <SelectTrigger className="h-8 text-xs bg-background dark:bg-black/40 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#181818] border border-border text-xs font-mono text-foreground shadow-2xl">
                    <SelectItem value="mobile">Mobile (Phone)</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="bot">Bot / Crawler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* OS */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground">Operating System</label>
                <Select value={os} onValueChange={(v) => setOs(v as any)}>
                  <SelectTrigger className="h-8 text-xs bg-background dark:bg-black/40 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#181818] border border-border text-xs font-mono text-foreground shadow-2xl">
                    <SelectItem value="ios">iOS</SelectItem>
                    <SelectItem value="android">Android</SelectItem>
                    <SelectItem value="macos">macOS</SelectItem>
                    <SelectItem value="windows">Windows</SelectItem>
                    <SelectItem value="linux">Linux</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground">Country (ISO-2)</label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase())}
                  placeholder="US"
                  maxLength={2}
                  className="h-8 text-xs font-mono uppercase bg-background dark:bg-black/40 border-border text-foreground"
                />
              </div>

              {/* Region */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground">Region / State</label>
                <Input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="CA"
                  className="h-8 text-xs font-mono bg-background dark:bg-black/40 border-border text-foreground"
                />
              </div>

              {/* Language */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground">Language</label>
                <Input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="en-US"
                  className="h-8 text-xs font-mono bg-background dark:bg-black/40 border-border text-foreground"
                />
              </div>

              {/* Day of Week */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground">Day of Week</label>
                <Select value={weekday} onValueChange={(v) => setWeekday(v as any)}>
                  <SelectTrigger className="h-8 text-xs bg-background dark:bg-black/40 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#181818] border border-border text-xs font-mono text-foreground shadow-2xl">
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time of Day */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground">Time (24h)</label>
                <TimePicker
                  value={simTime}
                  onChange={setSimTime}
                  className="w-full h-8"
                />
              </div>

              {/* Query Parameter */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground">Inbound Query Param</label>
                <div className="flex items-center gap-1">
                  <Input
                    value={queryKey}
                    onChange={(e) => setQueryKey(e.target.value)}
                    placeholder="utm_source"
                    className="h-8 text-[11px] font-mono bg-background dark:bg-black/40 border-border text-foreground"
                  />
                  <span>=</span>
                  <Input
                    value={queryValue}
                    onChange={(e) => setQueryValue(e.target.value)}
                    placeholder="val"
                    className="h-8 text-[11px] font-mono bg-background dark:bg-black/40 border-border text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Run CTA */}
            <Button
              onClick={handleRunSimulation}
              className="w-full h-9 text-xs font-mono gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold cursor-pointer"
            >
              <NxtqrIcon icon="solar:play-bold" size={14} />
              <span>Evaluate Decision Pipeline</span>
            </Button>
          </div>

          {/* SIMULATION TRACE RESULTS */}
          {traceResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/70 pb-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground">
                  Decision Outcome
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Duration: {traceResult.evaluationDurationMs}ms
                </span>
              </div>

              {/* Destination Result Banner */}
              <div
                className={cn(
                  "p-4 rounded-xl border text-xs space-y-2",
                  traceResult.matchedRuleId
                    ? "border-primary/50 bg-primary/10"
                    : "border-border bg-muted/40 dark:bg-black/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <NxtqrIcon
                      icon="solar:check-circle-bold"
                      size={16}
                      className={traceResult.matchedRuleId ? "text-primary" : "text-emerald-500 dark:text-emerald-400"}
                    />
                    <span className="font-bold text-foreground">
                      {traceResult.matchedRuleId ? "Matched Rule Destination" : "Default Fallthrough Destination"}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {(traceResult.trace?.evaluatedRules || traceResult.decisionTrace || []).length} Rules Evaluated
                  </Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-background dark:bg-black/60 border border-border font-mono text-xs break-all flex items-center justify-between gap-2">
                  <span className="text-foreground font-medium">{traceResult.destinationUrl}</span>
                  <a
                    href={traceResult.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-muted dark:hover:bg-white/10 text-muted-foreground hover:text-foreground shrink-0"
                    title="Open destination in new tab"
                  >
                    <NxtqrIcon icon="solar:link-square-linear" size={13} />
                  </a>
                </div>
              </div>

              {/* Step-by-Step Rule Evaluation Trace */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  Rule Evaluation Trace
                </span>

                <div className="space-y-2">
                  {(traceResult.trace?.evaluatedRules || traceResult.decisionTrace || []).map((step: any, idx: number) => {
                    const isWinning = step.ruleId === traceResult.matchedRuleId;
                    const conditions = step.conditionsEvaluated || step.conditionTrace || [];
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-xl border text-xs font-mono space-y-2",
                          isWinning
                            ? "border-primary/60 bg-primary/5"
                            : "border-border bg-muted/30 dark:bg-black/30 opacity-90"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-primary font-mono">#{step.priority}</span>
                            <span className="text-foreground">{step.ruleName}</span>
                          </div>
                          <Badge
                            variant={isWinning ? "default" : "outline"}
                            className={cn(
                              "text-[10px] font-mono",
                              isWinning && "bg-primary text-primary-foreground"
                            )}
                          >
                            {step.matched ? "MATCHED" : "NO MATCH"}
                          </Badge>
                        </div>

                        {/* Conditions detail trace */}
                        {conditions.length > 0 && (
                          <div className="space-y-1 pl-2 border-l-2 border-border/60">
                            {conditions.map((cTrace: any, cIdx: number) => (
                              <div
                                key={cIdx}
                                className="flex items-center justify-between text-[11px]"
                              >
                                <span className="text-muted-foreground">
                                  {cTrace.type} {cTrace.operator} {JSON.stringify(cTrace.expectedValue ?? cTrace.expected)}
                                </span>
                                <span
                                  className={cn(
                                    "font-semibold",
                                    (cTrace.matched ?? cTrace.passed) ? "text-emerald-400" : "text-rose-400"
                                  )}
                                >
                                  {(cTrace.matched ?? cTrace.passed) ? "PASS" : "FAIL"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
