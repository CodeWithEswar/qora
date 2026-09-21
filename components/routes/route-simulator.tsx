"use client";

import * as React from "react";
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  Globe,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Split,
  Laptop,
  Tablet,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import {
  RoutingRule,
  QrResolverSnapshotV1,
  ResolverContext,
  evaluateRoutingPolicy,
  RoutingSimulationResult,
} from "@nxtqr/contracts";
import { BRAND } from "@/lib/brand";
import { RESOLVER_CONFIG } from "@nxtqr/config";

interface RouteSimulatorProps {
  initialSnapshot?: QrResolverSnapshotV1;
  rules?: RoutingRule[];
  defaultUrl?: string;
}

export function RouteSimulator({
  initialSnapshot,
  rules = [],
  defaultUrl = "https://nxtqr.vercel.app/home",
}: RouteSimulatorProps) {
  // Simulator input state
  const [device, setDevice] = React.useState<"mobile" | "desktop" | "tablet" | "other">("mobile");
  const [os, setOs] = React.useState<"ios" | "android" | "windows" | "macos" | "linux" | "other">("ios");
  const [country, setCountry] = React.useState<string>("IN");
  const [language, setLanguage] = React.useState<string>("en-US");
  const [localTime, setLocalTime] = React.useState<string>("14:30");
  const [weekday, setWeekday] = React.useState<
    "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
  >("monday");

  // Construct snapshot for simulation
  const snapshot: QrResolverSnapshotV1 = React.useMemo(() => {
    if (initialSnapshot) return initialSnapshot;
    return {
      schemaVersion: 1,
      qrId: "sim_qr_active",
      organizationId: "sim_workspace",
      status: "ACTIVE",
      publishedRevision: 1,
      defaultDestination: {
        id: "dest_default",
        url: defaultUrl,
      },
      rules: rules,
      publishedAt: new Date().toISOString(),
    };
  }, [initialSnapshot, rules, defaultUrl]);

  // Execute simulation reactively on input change
  const simulationResult: RoutingSimulationResult = React.useMemo(() => {
    const context: Partial<ResolverContext> = {
      now: Date.now(),
      host: RESOLVER_CONFIG.defaultHost,
      slug: "test-route",
      device,
      os,
      country: country.toUpperCase(),
      language: language.toLowerCase(),
      languagePrimary: language.split("-")[0].toLowerCase(),
      localTime,
      weekday,
    };

    return evaluateRoutingPolicy(snapshot, context, { includeTrace: true });
  }, [snapshot, device, os, country, language, localTime, weekday]);

  const trace = simulationResult.trace;

  const handleReset = () => {
    setDevice("mobile");
    setOs("ios");
    setCountry("IN");
    setLanguage("en-US");
    setLocalTime("14:30");
    setWeekday("monday");
  };

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/20 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">QR Brain Live Route Simulator</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Simulate scan-time edge context and inspect the exact deterministic decision tree path.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Pure Engine Parity: 100%
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Input Parameters Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Device Form Factor */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Smartphone className="h-3 w-3" /> Form Factor
            </label>
            <Select value={device} onValueChange={(val) => setDevice(val as any)}>
              <SelectTrigger className="w-full text-xs font-medium h-8">
                <SelectValue placeholder="Device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile" className="text-xs">Mobile</SelectItem>
                <SelectItem value="desktop" className="text-xs">Desktop</SelectItem>
                <SelectItem value="tablet" className="text-xs">Tablet</SelectItem>
                <SelectItem value="other" className="text-xs">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Operating System */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Laptop className="h-3 w-3" /> OS Family
            </label>
            <Select value={os} onValueChange={(val) => setOs(val as any)}>
              <SelectTrigger className="w-full text-xs font-medium h-8">
                <SelectValue placeholder="OS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ios" className="text-xs">iOS</SelectItem>
                <SelectItem value="android" className="text-xs">Android</SelectItem>
                <SelectItem value="macos" className="text-xs">macOS</SelectItem>
                <SelectItem value="windows" className="text-xs">Windows</SelectItem>
                <SelectItem value="linux" className="text-xs">Linux</SelectItem>
                <SelectItem value="other" className="text-xs">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Globe className="h-3 w-3" /> Country
            </label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full text-xs font-medium h-8">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN" className="text-xs">India (IN)</SelectItem>
                <SelectItem value="US" className="text-xs">United States (US)</SelectItem>
                <SelectItem value="GB" className="text-xs">United Kingdom (GB)</SelectItem>
                <SelectItem value="DE" className="text-xs">Germany (DE)</SelectItem>
                <SelectItem value="JP" className="text-xs">Japan (JP)</SelectItem>
                <SelectItem value="OTHER" className="text-xs">Other / Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Language
            </label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full text-xs font-medium h-8">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US" className="text-xs">English (en-US)</SelectItem>
                <SelectItem value="en-GB" className="text-xs">English (en-GB)</SelectItem>
                <SelectItem value="hi-IN" className="text-xs">Hindi (hi-IN)</SelectItem>
                <SelectItem value="te-IN" className="text-xs">Telugu (te-IN)</SelectItem>
                <SelectItem value="de-DE" className="text-xs">German (de-DE)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3" /> Local Time
            </label>
            <TimePicker
              value={localTime}
              onChange={setLocalTime}
              className="w-full h-8"
            />
          </div>

          {/* Weekday */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Weekday
            </label>
            <Select value={weekday} onValueChange={(val) => setWeekday(val as any)}>
              <SelectTrigger className="w-full text-xs font-medium h-8 capitalize">
                <SelectValue placeholder="Weekday" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday" className="text-xs capitalize">Monday</SelectItem>
                <SelectItem value="tuesday" className="text-xs capitalize">Tuesday</SelectItem>
                <SelectItem value="wednesday" className="text-xs capitalize">Wednesday</SelectItem>
                <SelectItem value="thursday" className="text-xs capitalize">Thursday</SelectItem>
                <SelectItem value="friday" className="text-xs capitalize">Friday</SelectItem>
                <SelectItem value="saturday" className="text-xs capitalize">Saturday</SelectItem>
                <SelectItem value="sunday" className="text-xs capitalize">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resolved Destination Result Banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={simulationResult.isFallback ? "danger" : "orange"} className="text-[10px] uppercase font-bold tracking-wider">
                  {simulationResult.isFallback
                    ? "Guardian Fallback"
                    : simulationResult.matchedRuleId
                    ? "Rule Matched"
                    : "Default Fallback"}
                </Badge>
                <span className="text-xs font-semibold text-foreground">
                  {simulationResult.reason}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-primary font-medium break-all mt-1">
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                <span>{simulationResult.destinationUrl}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Latency</span>
                <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {trace ? `${trace.evaluationDurationMs}ms` : "< 1ms"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Decision Trace Breakdown */}
        {trace && trace.evaluatedRules.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Evaluated Decision Steps ({trace.evaluatedRules.length})
            </h4>

            <div className="space-y-2">
              {trace.evaluatedRules.map((ruleStep, idx) => (
                <div
                  key={ruleStep.ruleId}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    ruleStep.matched
                      ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                      : "border-border/60 bg-muted/10 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {ruleStep.matched ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                      )}
                      <span className="font-semibold text-foreground">
                        Priority {ruleStep.priority}: {ruleStep.ruleName}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        (Match Mode: {ruleStep.matchType})
                      </span>
                    </div>
                    <Badge variant={ruleStep.matched ? "default" : "outline"} className="text-[10px]">
                      {ruleStep.matched ? "MATCHED & SELECTED" : "NOT MATCHED"}
                    </Badge>
                  </div>

                  {ruleStep.conditionsEvaluated.length > 0 && (
                    <div className="mt-2.5 pl-6 space-y-1">
                      {ruleStep.conditionsEvaluated.map((c) => (
                        <div key={c.conditionId} className="flex items-center gap-2 text-[11px] font-mono">
                          <span className={c.matched ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-muted-foreground"}>
                            {c.matched ? "✓" : "✗"}
                          </span>
                          <span className="text-foreground">{c.type}</span>
                          <span className="text-muted-foreground">{c.operator}</span>
                          <span className="text-primary font-semibold">{JSON.stringify(c.expected)}</span>
                          <span className="text-muted-foreground">(actual: {JSON.stringify(c.actual)})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
